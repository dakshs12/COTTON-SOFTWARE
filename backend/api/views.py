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

from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

@api_view(['GET'])
def get_dashboard_analytics(request):
    try:
        # 1. KPI Metrics
        total_deals = BargainEntry.objects.count()
        
        # Calculate Total Bales (from BargainEntry)
        total_bales_agg = BargainEntry.objects.aggregate(Sum('bales'))
        total_bales = total_bales_agg['bales__sum'] or 0
        
        # Calculate Pending Bales (Deliveries not yet billed)
        # Using DeliveryDetails because it represents actual dispatched bales
        # We check seller_billed or buyer_billed
        pending_deliveries = DeliveryDetails.objects.filter(seller_billed=False) | DeliveryDetails.objects.filter(buyer_billed=False)
        # Simple pending calculation (if either isn't billed)
        total_pending_bales = pending_deliveries.distinct().aggregate(Sum('quantity_bales'))['quantity_bales__sum'] or 0

        # Total Brokerage Revenue (Gross Amount from BrokerageBills)
        total_brokerage_agg = BrokerageBill.objects.aggregate(Sum('gross_amount'))
        total_brokerage = total_brokerage_agg['gross_amount__sum'] or 0
        
        # 2. Top 5 Buyers by Volume
        top_buyers = list(BargainEntry.objects.values('buyer__company_name')
                          .annotate(total_bales=Sum('bales'))
                          .order_by('-total_bales')[:5])
                          
        # 3. Top 5 Sellers by Volume
        top_sellers = list(BargainEntry.objects.values('seller__company_name')
                           .annotate(total_bales=Sum('bales'))
                           .order_by('-total_bales')[:5])
                           
        # 4. Revenue Month-over-Month (BrokerageBill)
        # Group by Month of bill_date
        revenue_trends_query = (
            BrokerageBill.objects
            .annotate(month=TruncMonth('bill_date'))
            .values('month')
            .annotate(revenue=Sum('gross_amount'))
            .order_by('month')
        )
        
        # Format dates for frontend
        revenue_trends = [
            {
                "month": rt['month'].strftime('%b %Y') if rt['month'] else 'Unknown',
                "revenue": float(rt['revenue'])
            }
            for rt in revenue_trends_query
        ]

        return Response({
            "kpi": {
                "total_deals": total_deals,
                "total_bales": total_bales,
                "total_pending_bales": total_pending_bales,
                "total_brokerage": float(total_brokerage),
            },
            "top_buyers": top_buyers,
            "top_sellers": top_sellers,
            "revenue_trends": revenue_trends
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# --- DUE LIST & PAYMENTS ---

@api_view(['GET'])
def get_party_dues(request):
    """
    Returns a list of all parties that have outstanding balances,
    along with their total due amount and number of unpaid bills.
    """
    # Filter bills that are not fully paid
    unpaid_bills = BrokerageBill.objects.filter(is_paid=False)
    
    # Aggregate dues grouped by Party
    from django.db.models import Sum, F, Count
    party_dues = (
        unpaid_bills.values('party__id', 'party__company_name')
        .annotate(
            total_net=Sum('net_amount'),
            total_paid=Sum('amount_paid'),
            balance_due=Sum(F('net_amount') - F('amount_paid')),
            bill_count=Count('id')
        )
        .order_by('-balance_due')
    )
    
    data = []
    for pd in party_dues:
        data.append({
            "party_id": pd['party__id'],
            "company_name": pd['party__company_name'],
            "balance_due": float(pd['balance_due']),
            "bill_count": pd['bill_count']
        })
        
    return Response(data)

@api_view(['GET'])
def get_party_due_bills(request, party_id):
    """
    Returns the list of specific unpaid bills for a single party.
    """
    bills = BrokerageBill.objects.filter(party_id=party_id, is_paid=False).order_by('bill_date')
    serializer = BrokerageBillSerializer(bills, many=True)
    return Response(serializer.data)

from django.db import transaction

@api_view(['POST'])
def receive_party_payment(request):
    """
    Receives a lump-sum payment and allocates it to specified bills.
    Expects:
    {
        "party_id": 1,
        "amount": 155000,
        "payment_mode": "NEFT",
        "receipt_date": "2026-06-13",
        "reference_no": "UPI123456",
        "remarks": "",
        "allocations": [
            {"bill_id": 10, "allocated_amount": 50000},
            {"bill_id": 11, "allocated_amount": 105000}
        ]
    }
    """
    from decimal import Decimal
    data = request.data
    party_id = data.get('party_id')
    amount = Decimal(str(data.get('amount', '0')))
    allocations = data.get('allocations', [])
    
    try:
        with transaction.atomic():
            party = PartyMaster.objects.get(id=party_id)
            
            # 1. Create the Receipt
            receipt = PartyPaymentReceipt.objects.create(
                party=party,
                receipt_date=data.get('receipt_date'),
                amount=amount,
                payment_mode=data.get('payment_mode', 'Unknown'),
                reference_no=data.get('reference_no', ''),
                remarks=data.get('remarks', '')
            )
            
            # 2. Process Allocations
            total_allocated = Decimal('0.0')
            for alloc in allocations:
                bill_id = alloc['bill_id']
                alloc_amount = Decimal(str(alloc['allocated_amount']))
                
                if alloc_amount <= 0:
                    continue
                    
                bill = BrokerageBill.objects.select_for_update().get(id=bill_id, party=party)
                
                # Create allocation record
                PaymentAllocation.objects.create(
                    receipt=receipt,
                    bill=bill,
                    allocated_amount=alloc_amount
                )
                
                # Update Bill
                bill.amount_paid += alloc_amount
                
                # Check if fully paid (allow 1 Rupee rounding tolerance if needed, but exact is better)
                if bill.amount_paid >= bill.net_amount:
                    bill.is_paid = True
                    # Cap amount_paid to net_amount to prevent negative balance display, though in accounting they might have advance.
                    # We'll allow exact capping for now.
                    
                bill.save()
                total_allocated += alloc_amount
                
            # Validations
            if total_allocated > amount:
                raise ValueError("Total allocated amount exceeds receipt amount!")
                
        return Response({"message": "Payment recorded and allocated successfully!"})
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)