import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import PassingEntry, DeliveryDetails
from api.serializers import PassingEntrySerializer, DeliveryDetailsSerializer

passing = PassingEntry.objects.last()
if passing:
    data = PassingEntrySerializer(passing).data
    print("Passing keys:", list(data.keys()))

delivery = DeliveryDetails.objects.last()
if delivery:
    data = DeliveryDetailsSerializer(delivery).data
    print("Delivery keys:", list(data.keys()))
