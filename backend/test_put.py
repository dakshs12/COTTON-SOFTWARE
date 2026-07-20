import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from api.models import CustomUser, PartyMaster

for user in CustomUser.objects.all():
    parties = PartyMaster.objects.filter(tenant=user.tenant)
    if parties.exists():
        print(f"User {user.email} has parties.")
        c = Client()
        c.force_login(user)
        party = parties.first()
        data = {
            "party_code": party.party_code,
            "company_name": party.company_name + " Updated",
            "station": party.station,
            "address": party.address,
            "state": party.state,
            "party_type": party.party_type,
            "contact_person": party.contact_person,
            "mobile": party.mobile
        }
        response = c.put(f'/api/parties/{party.id}/', data, content_type='application/json')
        print(f"PUT response for user {user.email}:", response.status_code, response.content)
        break
