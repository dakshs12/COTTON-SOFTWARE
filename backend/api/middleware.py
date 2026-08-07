from django.http import JsonResponse

class SubscriptionEnforcerMiddleware:
    """
    Global middleware that intercepts requests and enforces TenantSubscription lifecycle rules.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Paths that should not be blocked regardless of subscription status
        self.exempt_paths = [
            '/api/auth/',
            '/api/token/',
            '/api/payments/webhook/',
            '/admin/',
        ]

    def __call__(self, request):
        path = request.path_info
        
        # 1. Exempt specific paths from enforcement
        for exempt_path in self.exempt_paths:
            if path.startswith(exempt_path):
                return self.get_response(request)
        
        # 2. Only enforce rules for authenticated users who have a subscription
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                subscription = request.user.subscription
                status = subscription.subscription_status
                
                # If Locked Out: Drop all operational endpoints (402 Payment Required)
                if status == 'LOCKED_OUT':
                    return JsonResponse({
                        "detail": "Subscription locked out. Payment is required to resume operations."
                    }, status=402)
                

            except Exception:
                # If they somehow have a tenant but no subscription object, fall back to safe read-only or lock
                # We assume they are locked out to force DB integrity
                return JsonResponse({"detail": "Subscription record missing. Please contact support."}, status=402)

        # 3. Process the view normally
        return self.get_response(request)
