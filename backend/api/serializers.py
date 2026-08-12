from rest_framework import serializers
from django.db import models
from .models import (
    PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails,
    BrokerageBill, PartyPaymentReceipt, PaymentAllocation, BargainSplit,
    BrokerNote, ChecklistItem
)

class PartyMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartyMaster
        fields = '__all__'
        read_only_fields = ('tenant',)

class FirmMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirmMaster
        fields = '__all__'
        read_only_fields = ('tenant',)

class BargainSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BargainSplit
        fields = '__all__'
        read_only_fields = ('tenant', 'bargain')

class BargainEntrySerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.company_name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.company_name', read_only=True)
    
    # This sends the smart ID (24-25/1) instead of just "1"
    smart_deal_id = serializers.ReadOnlyField()
    remaining_bales = serializers.SerializerMethodField()
    splits = BargainSplitSerializer(many=True, required=False)

    class Meta:
        model = BargainEntry
        fields = '__all__'
        read_only_fields = ('tenant',)

    def get_remaining_bales(self, obj):
        delivered = obj.deliverydetails_set.aggregate(total=models.Sum('quantity_bales'))['total'] or 0
        return obj.bales - delivered

    def create(self, validated_data):
        splits_data = validated_data.pop('splits', [])
        bargain = super().create(validated_data)
        for split_data in splits_data:
            BargainSplit.objects.create(bargain=bargain, tenant=bargain.tenant, **split_data)
        return bargain

    def update(self, instance, validated_data):
        splits_data = validated_data.pop('splits', None)
        instance = super().update(instance, validated_data)
        if splits_data is not None:
            instance.splits.all().delete()
            for split_data in splits_data:
                BargainSplit.objects.create(bargain=instance, tenant=instance.tenant, **split_data)
        return instance

class PassingEntrySerializer(serializers.ModelSerializer):
    # Fetch details from the linked Bargain so we can see them in the list
    deal_no = serializers.ReadOnlyField(source='bargain.smart_deal_id')
    seller_name = serializers.CharField(source='bargain.seller.company_name', read_only=True)
    buyer_name = serializers.CharField(source='bargain.buyer.company_name', read_only=True)
    payment_condition = serializers.IntegerField(source='bargain.payment_condition', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = PassingEntry
        fields = '__all__'
        read_only_fields = ('tenant',)

    def get_status(self, obj):
        return "Dispatched" if obj.deliverydetails_set.exists() else "Pending Dispatch"

class DeliveryDetailsSerializer(serializers.ModelSerializer):
    deal_display = serializers.CharField(source='bargain.smart_deal_id', read_only=True)
    seller_name = serializers.CharField(source='bargain.seller.company_name', read_only=True)
    buyer_name = serializers.CharField(source='bargain.buyer.company_name', read_only=True)
    passing_ref = serializers.CharField(source='passing.pr_no', read_only=True, allow_null=True)

    class Meta:
        model = DeliveryDetails
        fields = '__all__'
        read_only_fields = ('tenant',)

class BrokerageBillSerializer(serializers.ModelSerializer):
    party_name = serializers.CharField(source='party.company_name', read_only=True)
    firm_name = serializers.CharField(source='firm.firm_name', read_only=True)
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = BrokerageBill
        fields = '__all__'
        read_only_fields = ('tenant',)

    def get_balance_due(self, obj):
        return obj.net_amount - obj.amount_paid

class PartyPaymentReceiptSerializer(serializers.ModelSerializer):
    party_name = serializers.CharField(source='party.company_name', read_only=True)

    class Meta:
        model = PartyPaymentReceipt
        fields = '__all__'
        read_only_fields = ('tenant',)

class PaymentAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAllocation
        fields = '__all__'
        read_only_fields = ('tenant',)

class BrokerNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrokerNote
        fields = ('id', 'content', 'updated_at')

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ('id', 'text', 'is_done', 'created_at')
        read_only_fields = ('id', 'created_at')