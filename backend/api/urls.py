from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PartyMasterViewSet, FirmMasterViewSet, 
    BargainEntryViewSet, PassingEntryViewSet, DeliveryDetailsViewSet
)

router = DefaultRouter()
router.register(r'parties', PartyMasterViewSet)
router.register(r'firms', FirmMasterViewSet)
router.register(r'bargains', BargainEntryViewSet)
router.register(r'passings', PassingEntryViewSet)
router.register(r'deliveries', DeliveryDetailsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]