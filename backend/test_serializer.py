import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.serializers import FirmMasterSerializer
data = {
    "firm_name": "Test Firm",
    "address": "123 Test St",
    "city": "Test City",
    "state": "Test State",
    "mobile": "1234567890",
}
serializer = FirmMasterSerializer(data=data)
print("Is valid?", serializer.is_valid())
print("Errors:", serializer.errors)
