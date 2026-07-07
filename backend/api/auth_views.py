from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from django.utils import timezone
from .models import CustomUser, Tenant
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
import os

class CurrentUserView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            
        user = request.user
        tenant = user.tenant
        
        data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "phone_number": user.phone_number,
            "tenant_id": tenant.id if tenant else None,
            "company_name": tenant.company_name if tenant else None,
        }
        
        if tenant and hasattr(tenant, 'subscription'):
            data["subscription"] = {
                "plan_type": tenant.subscription.plan_type,
                "days_remaining": tenant.subscription.days_remaining,
                "status": tenant.subscription.subscription_status,
                "end_date": tenant.subscription.end_date
            }
            
        return Response(data)

class CookieTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        user = None
        if username:
            user = CustomUser.objects.filter(username=username).first()
        
        if user:
            if user.lockout_until and user.lockout_until > timezone.now():
                return Response({"detail": "Account temporarily locked due to multiple failed login attempts."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            if user:
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= 5:
                    user.lockout_until = timezone.now() + timezone.timedelta(minutes=15)
                user.save()
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Reset counters on success
        if user:
            user.failed_login_attempts = 0
            user.lockout_until = None
            user.save()
            
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            response.data['message'] = 'Authenticated Successfully'
            
        return response

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        token = request.data.get('token')
        client_id = os.environ.get('GOOGLE_CLIENT_ID')

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            user = CustomUser.objects.filter(username=email).first()

            if user:
                if user.lockout_until and user.lockout_until > timezone.now():
                    return Response({"detail": "Account temporarily locked."}, status=status.HTTP_403_FORBIDDEN)
                
                # Reset counters
                user.failed_login_attempts = 0
                user.lockout_until = None
                user.save()

                refresh = RefreshToken.for_user(user)
                response = Response({"message": "Authenticated Successfully"}, status=status.HTTP_200_OK)
                
                response.set_cookie(
                    key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                    value=str(refresh.access_token),
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                return response
            else:
                return Response({
                    "message": "User not found. Please complete registration.",
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name
                }, status=status.HTTP_202_ACCEPTED)

        except ValueError:
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

class CompleteGoogleRegistrationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        company_name = request.data.get('company_name')

        if not email or not company_name:
            return Response({"detail": "Email and Company Name are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(username=email).exists():
            return Response({"detail": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create Tenant
        tenant = Tenant.objects.create(company_name=company_name, subscription_status='pending')
        
        # Create User
        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            tenant=tenant
        )

        # Authenticate immediately
        refresh = RefreshToken.for_user(user)
        response = Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
        
        response.set_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            value=str(refresh.access_token),
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
        )
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # The default TokenRefreshView expects 'refresh' token in request data.
        # We need to extract it from the cookie and inject it into request data.
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            request.data['refresh'] = refresh_token
            
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            
            # Set Access Token Cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            
            # Optional: Remove access token from JSON body
            # del response.data['access']
            response.data['message'] = 'Token Refreshed Successfully'
            
        return response

class LogoutView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        response = Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        
        # Delete Cookies
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie('refresh_token')
        
        return response

import resend
import random
from datetime import timedelta
from django.db import transaction
from .models import OTPVerification

class RequestOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
            
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'An account with this email already exists.'}, status=400)

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # Save OTP
        OTPVerification.objects.update_or_create(
            email=email,
            defaults={
                'otp_code': otp,
                'expires_at': timezone.now() + timedelta(minutes=10)
            }
        )
        
        # Send Email via Resend
        resend.api_key = os.environ.get("RESEND_API_KEY")
        try:
            r = resend.Emails.send({
                "from": "noreply@cottbook.com",
                "to": email,
                "subject": "Your Verification Code - Cottbook",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }}
                        .container {{ max-width: 500px; margin: 20px auto; padding: 30px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }}
                        h2 {{ color: #1a1a1a; font-size: 24px; margin-top: 0; }}
                        p {{ color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 10px; }}
                        .otp-box {{ background: #f4f7f6; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; border: 1px solid #e1e8e5; }}
                        .otp-code {{ font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a; margin: 0; }}
                        .warning {{ color: #dc2626; font-weight: 600; font-size: 14px; margin-top: 15px; margin-bottom: 0; }}
                        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 13px; color: #6b7280; line-height: 1.6; }}
                        .footer p {{ font-size: 13px; color: #6b7280; }}
                        .footer a {{ color: #2563eb; text-decoration: none; }}
                        @media screen and (max-width: 600px) {{
                            .container {{ margin: 10px; padding: 20px; }}
                            .otp-code {{ font-size: 28px; letter-spacing: 5px; }}
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Verify Your Email</h2>
                        <p>Please use the following 6-digit code to complete your registration:</p>
                        
                        <div class="otp-box">
                            <p class="otp-code">{otp}</p>
                            <p class="warning">⚠️ Never share this code with anyone.</p>
                        </div>
                        
                        <p style="font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
                        
                        <div class="footer">
                            <p><strong>Didn't request this?</strong><br/>If you didn't initiate this request, please safely ignore this email. No action is required.</p>
                            <p><strong>Need help?</strong><br/>Please do not reply to this automated email. For any queries or support, reach out to us at <a href="mailto:cottbook2026@gmail.com">cottbook2026@gmail.com</a>.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            })
            return Response({"message": "OTP sent successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class VerifyAndRegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        company_name = request.data.get('company_name')
        username = request.data.get('username')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not all([email, otp_code, company_name, username, password, first_name, last_name]):
            return Response({"error": "Missing required fields"}, status=400)
            
        try:
            otp_record = OTPVerification.objects.get(email=email, otp_code=otp_code)
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid OTP code."}, status=400)
            
        if otp_record.expires_at < timezone.now():
            return Response({"error": "OTP has expired. Please request a new one."}, status=400)
            
        if CustomUser.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)
            
        try:
            with transaction.atomic():
                tenant = Tenant.objects.create(
                    company_name=company_name,
                    subscription_status='active'
                )
                
                user = CustomUser.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    tenant=tenant
                )
                
                otp_record.delete()
                
                return Response({
                    "message": "Account created successfully. Please login.",
                    "tenant_id": tenant.id
                })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

from django.db.models import Q

class ForgotPasswordRequestOTPView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        identifier = request.data.get('identifier')
        if not identifier:
            return Response({'error': 'Username or Email is required'}, status=400)
            
        user = CustomUser.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
        if not user:
            return Response({'error': 'Account not found with that username or email.'}, status=400)
            
        email = user.email
        otp = str(random.randint(100000, 999999))
        
        OTPVerification.objects.update_or_create(
            email=email,
            defaults={
                'otp_code': otp,
                'expires_at': timezone.now() + timedelta(minutes=10)
            }
        )
        
        resend.api_key = os.environ.get("RESEND_API_KEY")
        try:
            r = resend.Emails.send({
                "from": "noreply@cottbook.com",
                "to": email,
                "subject": "Password Reset Code - Cottbook",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }}
                        .container {{ max-width: 500px; margin: 20px auto; padding: 30px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }}
                        h2 {{ color: #1a1a1a; font-size: 24px; margin-top: 0; }}
                        p {{ color: #4a4a4a; font-size: 16px; line-height: 1.5; margin-bottom: 10px; }}
                        .otp-box {{ background: #f4f7f6; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; border: 1px solid #e1e8e5; }}
                        .otp-code {{ font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a; margin: 0; }}
                        .warning {{ color: #dc2626; font-weight: 600; font-size: 14px; margin-top: 15px; margin-bottom: 0; }}
                        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 13px; color: #6b7280; line-height: 1.6; }}
                        .footer p {{ font-size: 13px; color: #6b7280; }}
                        .footer a {{ color: #2563eb; text-decoration: none; }}
                        @media screen and (max-width: 600px) {{
                            .container {{ margin: 10px; padding: 20px; }}
                            .otp-code {{ font-size: 28px; letter-spacing: 5px; }}
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Reset Your Password</h2>
                        <p>We received a request to reset your password. Please use the following 6-digit code:</p>
                        
                        <div class="otp-box">
                            <p class="otp-code">{otp}</p>
                            <p class="warning">⚠️ Never share this code with anyone.</p>
                        </div>
                        
                        <p style="font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
                        
                        <div class="footer">
                            <p><strong>Didn't request this?</strong><br/>If you didn't initiate this request, please safely ignore this email. No action is required and your password will remain the same.</p>
                            <p><strong>Need help?</strong><br/>Please do not reply to this automated email. For any queries or support, reach out to us at <a href="mailto:cottbook2026@gmail.com">cottbook2026@gmail.com</a>.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            })
            parts = email.split("@")
            if len(parts) == 2 and len(parts[0]) > 2:
                obfuscated_email = f"{parts[0][:2]}***@{parts[1]}"
            else:
                obfuscated_email = "***@***"
                
            return Response({
                "message": "OTP sent successfully",
                "email": email,
                "obfuscated_email": obfuscated_email
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ForgotPasswordVerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not all([email, otp_code]):
            return Response({"error": "Missing required fields"}, status=400)
            
        try:
            otp_record = OTPVerification.objects.get(email=email, otp_code=otp_code)
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid OTP code."}, status=400)
            
        if otp_record.expires_at < timezone.now():
            return Response({"error": "OTP has expired. Please request a new one."}, status=400)
            
        return Response({"message": "OTP is valid."})

class ForgotPasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        new_password = request.data.get('new_password')
        
        if not all([email, otp_code, new_password]):
            return Response({"error": "Missing required fields"}, status=400)
            
        try:
            otp_record = OTPVerification.objects.get(email=email, otp_code=otp_code)
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid or expired OTP code."}, status=400)
            
        if otp_record.expires_at < timezone.now():
            return Response({"error": "OTP has expired. Please request a new one."}, status=400)
            
        user = CustomUser.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found."}, status=400)
            
        try:
            user.set_password(new_password)
            user.save()
            otp_record.delete()
            return Response({"message": "Password reset successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class UpdateProfileView(APIView):
    def post(self, request):
        user = request.user
        data = request.data
        
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.username = data.get('username', user.username)
        user.phone_number = data.get('phone_number', user.phone_number)
        
        try:
            user.save()
            return Response({"message": "Profile updated successfully"})
        except Exception as e:
            return Response({"error": "Failed to update profile. Username might be taken."}, status=400)

class RequestEmailChangeOTPView(APIView):
    def post(self, request):
        new_email = request.data.get('new_email')
        if not new_email:
            return Response({"error": "New email is required"}, status=400)
            
        if CustomUser.objects.filter(email=new_email).exists():
            return Response({"error": "This email is already in use by another account."}, status=400)
            
        resend.api_key = os.environ.get('RESEND_API_KEY')
        otp_code = str(random.randint(100000, 999999))
        
        # We can reuse OTPVerification model
        OTPVerification.objects.filter(email=new_email).delete()
        OTPVerification.objects.create(
            email=new_email,
            otp_code=otp_code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        html_content = f"""
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; text-align: center;">
            <h2>Confirm Your New Email Address</h2>
            <p>You requested to change your CottBook account email to this address.</p>
            <h1 style="background: #f4f4f4; padding: 15px; letter-spacing: 5px;">{otp_code}</h1>
            <p style="color: #666; font-size: 12px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        """
        
        try:
            resend.Emails.send({
                "from": "noreply@cottbook.com",
                "to": new_email,
                "subject": "CottBook Email Change Verification Code",
                "html": html_content
            })
            return Response({"message": "Verification code sent to new email."})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class VerifyEmailChangeOTPView(APIView):
    def post(self, request):
        new_email = request.data.get('new_email')
        otp_code = request.data.get('otp_code')
        user = request.user
        
        if not all([new_email, otp_code]):
            return Response({"error": "Missing fields"}, status=400)
            
        try:
            otp_record = OTPVerification.objects.get(email=new_email, otp_code=otp_code)
        except OTPVerification.DoesNotExist:
            return Response({"error": "Invalid verification code."}, status=400)
            
        if otp_record.expires_at < timezone.now():
            return Response({"error": "Code has expired."}, status=400)
            
        try:
            user.email = new_email
            user.save()
            otp_record.delete()
            return Response({"message": "Email updated successfully."})
        except Exception as e:
            return Response({"error": "Failed to update email."}, status=500)
