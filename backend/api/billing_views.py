from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import TenantSubscription, Tenant
import os
import razorpay
import hmac
import hashlib
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_subscription(request):
    """
    Creates a Razorpay subscription for the authenticated user's tenant.
    """
    plan_duration = request.data.get('plan_duration') # e.g., '1_YEAR', '3_YEAR', '5_YEAR'
    tenant = request.user.tenant
    
    if not tenant:
        return Response({"error": "User is not associated with a tenant"}, status=400)
        
    if plan_duration == '1_YEAR':
        plan_id = os.environ.get('RAZORPAY_PLAN_1_YEAR')
    elif plan_duration == '3_YEAR':
        plan_id = os.environ.get('RAZORPAY_PLAN_3_YEAR')
    elif plan_duration == '5_YEAR':
        plan_id = os.environ.get('RAZORPAY_PLAN_5_YEAR')
    else:
        return Response({"error": "Invalid plan duration"}, status=400)
        
    if not plan_id:
        return Response({"error": "Plan ID not configured on the server"}, status=500)

    try:
        client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))
        
        # Create subscription
        subscription_data = {
            "plan_id": plan_id,
            "total_count": 1, # Set based on your billing model (1 means non-recurring strictly, or 1 billing cycle)
            "customer_notify": 1,
            "notes": {
                "tenant_id": str(tenant.id)
            }
        }
        
        subscription = client.subscription.create(data=subscription_data)
        return Response({"subscription_id": subscription['id']})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """
    Webhook endpoint to receive events from Razorpay.
    """
    secret = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
    signature = request.headers.get('X-Razorpay-Signature', '')
    
    try:
        client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))
        
        # Extract payload string properly
        body = request.body.decode('utf-8')
        
        # Verify signature
        client.utility.verify_webhook_signature(body, signature, secret)
        
        payload = json.loads(body)
        event_type = payload.get('event')
        
        if event_type in ['subscription.charged', 'payment.captured']:
            # Extract notes to find tenant_id
            if event_type == 'subscription.charged':
                entity = payload.get('payload', {}).get('subscription', {}).get('entity', {})
                plan_id = entity.get('plan_id')
            else:
                entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
                plan_id = None # Might need to derive from notes or invoice if using standard payment
                
            notes = entity.get('notes', {})
            tenant_id = notes.get('tenant_id')
            
            if not tenant_id:
                return Response({"error": "No tenant_id in metadata"}, status=400)
                
            tenant = Tenant.objects.get(id=tenant_id)
            subscription = tenant.subscription
            
            # Map Razorpay Product IDs to our PLAN_CHOICES
            PLAN_1_YEAR_ID = os.environ.get('RAZORPAY_PLAN_1_YEAR')
            PLAN_3_YEAR_ID = os.environ.get('RAZORPAY_PLAN_3_YEAR')
            PLAN_5_YEAR_ID = os.environ.get('RAZORPAY_PLAN_5_YEAR')
            
            days_to_add = 0
            if plan_id == PLAN_1_YEAR_ID:
                subscription.plan_type = '1_YEAR'
                days_to_add = 365
            elif plan_id == PLAN_3_YEAR_ID:
                subscription.plan_type = '3_YEAR'
                days_to_add = 1095
            elif plan_id == PLAN_5_YEAR_ID:
                subscription.plan_type = '5_YEAR'
                days_to_add = 1825
            else:
                # If plan_id is missing (e.g. standard payment), fallback if we can't derive
                days_to_add = 365 # Safe fallback or handle differently
                
            if days_to_add > 0:
                # If currently active and not expired, extend from current end_date
                # If expired, start from today
                now = timezone.now()
                if subscription.end_date and subscription.end_date > now:
                    subscription.end_date = subscription.end_date + timedelta(days=days_to_add)
                else:
                    subscription.end_date = now + timedelta(days=days_to_add)
                    
                subscription.is_active = True
                subscription.save()
                
                return Response({"message": "Subscription updated successfully"})
                
        return Response({"message": "Event ignored"}, status=200)
        
    except razorpay.errors.SignatureVerificationError:
        return Response({"error": "Invalid signature"}, status=400)
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
