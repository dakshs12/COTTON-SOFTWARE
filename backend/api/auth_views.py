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
