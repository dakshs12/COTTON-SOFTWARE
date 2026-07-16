import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import BargainEntry, BargainSplit
bargains = BargainEntry.objects.all()
for b in bargains:
    print(f"Deal No: {b.deal_no}, Bales: {b.bales}")
    splits = b.splits.all()
    for s in splits:
        print(f"  Split: {s.bales} ({s.status})")
