from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views  # <--- THIS IS THE FIX (Importing the whole file)

router = DefaultRouter()
router.register(r'parties', views.PartyMasterViewSet)
router.register(r'firms', views.FirmMasterViewSet)
router.register(r'bargains', views.BargainEntryViewSet)
router.register(r'passings', views.PassingEntryViewSet)
router.register(r'deliveries', views.DeliveryDetailsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # These will now work because 'views' is defined!
    path('brokerage/pending/', views.get_pending_deliveries),
    path('brokerage/generate/', views.generate_brokerage_bill),
]