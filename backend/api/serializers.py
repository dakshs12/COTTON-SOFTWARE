from rest_framework import serializers
from django.db import models
from .models import (
    PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails,
    BrokerageBill, PartyPaymentReceipt, PaymentAllocation, PassingSplit
)

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
    remaining_bales = serializers.SerializerMethodField()

    class Meta:
        model = BargainEntry
        fields = '__all__'

    def get_remaining_bales(self, obj):
        delivered = obj.deliverydetails_set.aggregate(total=models.Sum('quantity_bales'))['total'] or 0
        return obj.bales - delivered

class PassingSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PassingSplit
        fields = ['id', 'bales']
        read_only_fields = ('passing',)

class PassingEntrySerializer(serializers.ModelSerializer):
    # Fetch details from the linked Bargain so we can see them in the list
    deal_no = serializers.ReadOnlyField(source='bargain.smart_deal_id')
    seller_name = serializers.CharField(source='bargain.seller.company_name', read_only=True)
    buyer_name = serializers.CharField(source='bargain.buyer.company_name', read_only=True)
    payment_condition = serializers.IntegerField(source='bargain.payment_condition', read_only=True)
    splits = PassingSplitSerializer(many=True, required=False)

    class Meta:
        model = PassingEntry
        fields = '__all__'

    def create(self, validated_data):
        splits_data = validated_data.pop('splits', [])
        passing = super().create(validated_data)
        for split_data in splits_data:
            PassingSplit.objects.create(passing=passing, **split_data)
        return passing

    def update(self, instance, validated_data):
        splits_data = validated_data.pop('splits', None)
        instance = super().update(instance, validated_data)
        if splits_data is not None:
            instance.splits.all().delete()
            for split_data in splits_data:
                PassingSplit.objects.create(passing=instance, **split_data)
        return instance

class DeliveryDetailsSerializer(serializers.ModelSerializer):
    deal_display = serializers.CharField(source='bargain.smart_deal_id', read_only=True)
    seller_name = serializers.CharField(source='bargain.seller.company_name', read_only=True)
    buyer_name = serializers.CharField(source='bargain.buyer.company_name', read_only=True)
    passing_ref = serializers.CharField(source='passing.pr_no', read_only=True, allow_null=True)

    class Meta:
        model = DeliveryDetails
        fields = '__all__'

class BrokerageBillSerializer(serializers.ModelSerializer):
    party_name = serializers.CharField(source='party.company_name', read_only=True)
    firm_name = serializers.CharField(source='firm.firm_name', read_only=True)
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = BrokerageBill
        fields = '__all__'

    def get_balance_due(self, obj):
        return obj.net_amount - obj.amount_paid

class PartyPaymentReceiptSerializer(serializers.ModelSerializer):
    party_name = serializers.CharField(source='party.company_name', read_only=True)

    class Meta:
        model = PartyPaymentReceipt
        fields = '__all__'

class PaymentAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAllocation
        fields = '__all__'