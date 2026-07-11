import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import BargainEntry
try:
    deal = BargainEntry.objects.last()
    print("Trying to delete deal", deal.pk)
    deal.delete()
    print("Deleted successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
