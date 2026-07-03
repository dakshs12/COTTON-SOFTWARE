import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import BargainEntry, DeliveryDetails, Tenant
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth

try:
    tenant = Tenant.objects.first()
    print("Testing Pending Dispatches...")
    pending_dispatches = BargainEntry.objects.filter(tenant=tenant).annotate(del_count=Count('deliverydetails')).filter(del_count=0).count()
    print("Pending Dispatches:", pending_dispatches)
except Exception as e:
    print("Failed at Pending Dispatches:", e)

try:
    print("Testing Bales Trend...")
    bales_trends_query = (
        BargainEntry.objects.filter(tenant=tenant)
        .annotate(month=TruncMonth('date'))
        .values('month')
        .annotate(volume=Sum('bales'))
        .order_by('month')
    )
    list(bales_trends_query)
    print("Bales trend success")
except Exception as e:
    print("Failed at Bales Trend:", e)

