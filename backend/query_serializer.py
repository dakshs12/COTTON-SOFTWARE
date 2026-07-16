import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import BargainEntry
from api.serializers import BargainEntrySerializer

b = BargainEntry.objects.get(deal_no=58)
serializer = BargainEntrySerializer(b)
print(serializer.data)
