import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import BargainEntry
from api.serializers import BargainEntrySerializer

deal = BargainEntry.objects.last()
if deal:
    data = BargainEntrySerializer(deal).data
    for key, val in data.items():
        print(f"{key}: {val}")
