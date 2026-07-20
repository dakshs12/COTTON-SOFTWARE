import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import PartyMaster
from api.serializers import PartyMasterSerializer

party = PartyMaster.objects.first()
serializer = PartyMasterSerializer(party)
print(serializer.data.keys())
