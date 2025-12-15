from rest_framework import viewsets
from .models import PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails
from .serializers import (
    PartyMasterSerializer, FirmMasterSerializer, 
    BargainEntrySerializer, PassingEntrySerializer, DeliveryDetailsSerializer
)

class PartyMasterViewSet(viewsets.ModelViewSet):
    queryset = PartyMaster.objects.all()
    serializer_class = PartyMasterSerializer

class FirmMasterViewSet(viewsets.ModelViewSet):
    queryset = FirmMaster.objects.all()
    serializer_class = FirmMasterSerializer

class BargainEntryViewSet(viewsets.ModelViewSet):
    queryset = BargainEntry.objects.all()
    serializer_class = BargainEntrySerializer

class PassingEntryViewSet(viewsets.ModelViewSet):
    queryset = PassingEntry.objects.all()
    serializer_class = PassingEntrySerializer

class DeliveryDetailsViewSet(viewsets.ModelViewSet):
    queryset = DeliveryDetails.objects.all()
    serializer_class = DeliveryDetailsSerializer