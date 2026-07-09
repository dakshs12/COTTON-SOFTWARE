from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views  # <--- THIS IS THE FIX (Importing the whole file)
from . import auth_views
from . import billing_views

router = DefaultRouter()
router.register(r'parties', views.PartyMasterViewSet, basename='partymaster')
router.register(r'firms', views.FirmMasterViewSet, basename='firmmaster')
router.register(r'bargains', views.BargainEntryViewSet, basename='bargainentry')
router.register(r'passings', views.PassingEntryViewSet, basename='passingentry')
router.register(r'deliveries', views.DeliveryDetailsViewSet, basename='deliverydetails')

urlpatterns = [
    path('', include(router.urls)),
    
    # These will now work because 'views' is defined!
    path('brokerage/pending/', views.get_pending_deliveries),
    path('brokerage/generate/', views.generate_brokerage_bill),
    
    # Analytics
    path('analytics/dashboard/', views.get_dashboard_analytics),
    
    # Due List & Payments
    path('brokerage/party-dues/', views.get_party_dues),
    path('brokerage/party-dues/<int:party_id>/', views.get_party_due_bills),
    path('brokerage/receive-payment/', views.receive_party_payment),
    
    # Reports
    path('statement/<int:party_id>/', views.get_party_statement),
    
    # SaaS Auth
    path('auth/me/', auth_views.CurrentUserView.as_view()),
    path('auth/profile/update/', auth_views.UpdateProfileView.as_view()),
    path('auth/profile/request-email-otp/', auth_views.RequestEmailChangeOTPView.as_view()),
    path('auth/profile/verify-email-otp/', auth_views.VerifyEmailChangeOTPView.as_view()),
    path('auth/request-otp/', auth_views.RequestOTPView.as_view()),
    path('auth/verify-and-register/', auth_views.VerifyAndRegisterView.as_view()),
    path('auth/forgot-password/request-otp/', auth_views.ForgotPasswordRequestOTPView.as_view()),
    path('auth/forgot-password/verify-otp/', auth_views.ForgotPasswordVerifyOTPView.as_view()),
    path('auth/forgot-password/reset/', auth_views.ForgotPasswordResetView.as_view()),
    
    # Billing Webhooks & Subscriptions
    path('payments/create-subscription/', billing_views.create_razorpay_subscription),
    path('payments/webhook/', billing_views.razorpay_webhook),
]