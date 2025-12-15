from rest_framework import serializers
from .models import PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails

class PartyMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartyMaster
        fields = '__all__'

class FirmMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirmMaster
        fields = '__all__'

class BargainEntrySerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.company_name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.company_name', read_only=True)
    
    # This sends the smart ID (24-25/1) instead of just "1"
    smart_deal_id = serializers.ReadOnlyField()

    class Meta:
        model = BargainEntry
        fields = '__all__'

class PassingEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = PassingEntry
        fields = '__all__'

class DeliveryDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryDetails
        fields = '__all__'