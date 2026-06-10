from django.contrib import admin
from .models import PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails

# This tells Django: "Show these tables in the Admin Panel"
admin.site.register(PartyMaster)
admin.site.register(FirmMaster)
admin.site.register(BargainEntry)
admin.site.register(PassingEntry)
admin.site.register(DeliveryDetails)