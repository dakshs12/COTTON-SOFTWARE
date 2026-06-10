from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import * 
from .serializers import *
from django.db.models import Q
from rest_framework import viewsets
from .models import PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails
from .serializers import (
    PartyMasterSerializer, FirmMasterSerializer, 
    BargainEntrySerializer, PassingEntrySerializer, DeliveryDetailsSerializer
)

class PartyMasterViewSet(viewsets.ModelViewSet):
    queryset = PartyMaster.objects.all()
    serializer_class = PartyMasterSerializer

class FirmMasterViewSet(viewsets.ModelViewSet):
    queryset = FirmMaster.objects.all()
    serializer_class = FirmMasterSerializer

class BargainEntryViewSet(viewsets.ModelViewSet):
    queryset = BargainEntry.objects.all()
    serializer_class = BargainEntrySerializer

class PassingEntryViewSet(viewsets.ModelViewSet):
    queryset = PassingEntry.objects.all()
    serializer_class = PassingEntrySerializer

class DeliveryDetailsViewSet(viewsets.ModelViewSet):
    queryset = DeliveryDetails.objects.all()
    serializer_class = DeliveryDetailsSerializer

# --- BROKERAGE LOGIC ---

@api_view(['GET'])
def get_pending_deliveries(request):
    party_id = request.GET.get('party_id')
    
    if not party_id:
        return Response({"error": "Party ID is required"}, status=400)

    try:
        party = PartyMaster.objects.get(id=party_id)
        
        # LOGIC: 
        # 1. Find deliveries where this party is the SELLER, and 'seller_billed' is False
        # 2. OR find deliveries where this party is the BUYER, and 'buyer_billed' is False
        
        deliveries = DeliveryDetails.objects.filter(
            Q(bargain__seller=party, seller_billed=False) | 
            Q(bargain__buyer=party, buyer_billed=False)
        )
        
        data = []
        for d in deliveries:
            # Determine if this party acted as Buyer or Seller in this specific deal
            role = "Seller" if d.bargain.seller == party else "Buyer"
            counter_party = d.bargain.buyer.company_name if role == "Seller" else d.bargain.seller.company_name
            
            data.append({
                "id": d.id,
                "date": d.bill_date,
                "truck_no": d.truck_no,
                "bales": d.quantity_bales,
                "role": role, # Did they buy or sell this truck?
                "counter_party": counter_party, # The 'Other' party name for the print
                "station": d.bargain.station,
                "deal_rate": d.bargain.rate, # Cotton Rate
                "deal_no": d.bargain.smart_deal_id
            })
            
        return Response(data)
    
    except PartyMaster.DoesNotExist:
        return Response({"error": "Party not found"}, status=404)

@api_view(['POST'])
def generate_brokerage_bill(request):
    data = request.data
    
    try:
        party = PartyMaster.objects.get(id=data['party_id'])
        firm = FirmMaster.objects.get(id=data['firm_id'])
        delivery_ids = data['delivery_ids'] # List of IDs [1, 5, 8]
        
        # 1. Create the Bill
        bill = BrokerageBill.objects.create(
            bill_no=data['bill_no'],
            bill_date=data['bill_date'],
            party=party,
            firm=firm,
            total_bales=data['total_bales'],
            rate=data['rate'],
            gross_amount=data['gross_amount'],
            gst_percent=data['gst_percent'],
            cgst_amount=data.get('cgst_amount', 0),
            sgst_amount=data.get('sgst_amount', 0),
            igst_amount=data.get('igst_amount', 0),
            net_amount=data['net_amount'],
            amount_in_words=data.get('amount_in_words', '')
        )
        
        # 2. Link Deliveries & Mark them as Billed
        for delivery_id in delivery_ids:
            d = DeliveryDetails.objects.get(id=delivery_id)
            bill.deliveries.add(d)
            
            # Check role again to mark the correct flag
            if d.bargain.seller == party:
                d.seller_billed = True
            elif d.bargain.buyer == party:
                d.buyer_billed = True
            d.save()
            
        return Response({"message": "Bill Generated Successfully!", "id": bill.id})

    except Exception as e:
        return Response({"error": str(e)}, status=500)