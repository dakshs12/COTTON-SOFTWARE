from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import TenantSubscription, Tenant
import os
import hmac
import hashlib
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def dodo_webhook(request):
    """
    Webhook endpoint to receive events from Dodo Payments.
    """
    secret = os.environ.get('DODO_WEBHOOK_SECRET', '')
    
    # In a real integration, you would extract the signature from headers
    # e.g., signature = request.headers.get('Dodo-Signature')
    # and verify it using hmac and the secret.
    
    try:
        # Assuming Dodo sends JSON payloads
        # We look for a successful payment or subscription creation
        # Structure varies based on Dodo API docs, using generic fallback
        payload = request.data
        
        event_type = payload.get('type')
        if event_type == 'payment.succeeded' or event_type == 'subscription.created':
            # Extract customer or tenant identifying information
            # Usually passed via metadata when initiating the payment session
            metadata = payload.get('data', {}).get('metadata', {})
            tenant_id = metadata.get('tenant_id')
            plan_id = payload.get('data', {}).get('product_id')
            
            if not tenant_id:
                return Response({"error": "No tenant_id in metadata"}, status=400)
                
            tenant = Tenant.objects.get(id=tenant_id)
            subscription = tenant.subscription
            
            # Map Dodo Product IDs to our PLAN_CHOICES
            PLAN_1_YEAR_ID = os.environ.get('DODO_PLAN_1_YEAR_ID', 'prod_1year')
            PLAN_3_YEAR_ID = os.environ.get('DODO_PLAN_3_YEAR_ID', 'prod_3year')
            PLAN_5_YEAR_ID = os.environ.get('DODO_PLAN_5_YEAR_ID', 'prod_5year')
            
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
        
    except Tenant.DoesNotExist:
        return Response({"error": "Tenant not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
