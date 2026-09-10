from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import * 
from .serializers import *
from django.db.models import Q, Sum, OuterRef, Exists
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails
from .serializers import (
    PartyMasterSerializer, FirmMasterSerializer, 
    BargainEntrySerializer, PassingEntrySerializer, DeliveryDetailsSerializer
)

class PartyMasterViewSet(viewsets.ModelViewSet):
    serializer_class = PartyMasterSerializer

    def get_queryset(self):
        return PartyMaster.objects.filter(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def lite(self, request):
        qs = self.get_queryset().values('id', 'company_name', 'station', 'party_type')
        return Response(list(qs))

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class FirmMasterViewSet(viewsets.ModelViewSet):
    serializer_class = FirmMasterSerializer

    def get_queryset(self):
        return FirmMaster.objects.filter(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def lite(self, request):
        qs = self.get_queryset().values('id', 'firm_name', 'city')
        return Response(list(qs))

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class BargainEntryViewSet(viewsets.ModelViewSet):
    serializer_class = BargainEntrySerializer

    def get_queryset(self):
        return BargainEntry.objects.filter(tenant=self.request.user.tenant) \
            .select_related('seller', 'buyer') \
            .prefetch_related('splits') \
            .annotate(delivered_bales=Sum('deliverydetails__quantity_bales'))

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def lite(self, request):
        qs = BargainEntry.objects.filter(tenant=request.user.tenant)
        if 'status' in request.query_params:
            qs = qs.filter(status=request.query_params['status'])
        data = list(qs.values(
            'deal_no', 'bargain_date', 'bales', 'rate', 'status', 'payment_condition',
            'seller__company_name', 'buyer__company_name'
        ))
        for d in data:
            date = d['bargain_date']
            fy = f"{date.year % 100}-{(date.year + 1) % 100}" if date.month >= 4 else f"{(date.year - 1) % 100}-{date.year % 100}"
            d['smart_deal_id'] = f"{fy}/{d['deal_no']}"
            
            d['id'] = d['deal_no']
            d['seller_name'] = d.pop('seller__company_name', None)
            d['buyer_name'] = d.pop('buyer__company_name', None)
            d['splits'] = [] 
            d['remaining_bales'] = d['bales']
        return Response(data)

class PassingEntryViewSet(viewsets.ModelViewSet):
    serializer_class = PassingEntrySerializer

    def get_queryset(self):
        return PassingEntry.objects.filter(tenant=self.request.user.tenant) \
            .select_related('bargain__seller', 'bargain__buyer') \
            .annotate(has_deliveries=Exists(DeliveryDetails.objects.filter(passing=OuterRef('pk'))))

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

    @action(detail=False, methods=['get'])
    def lite(self, request):
        qs = PassingEntry.objects.filter(tenant=request.user.tenant).annotate(
            has_deliveries=Exists(DeliveryDetails.objects.filter(passing=OuterRef('pk')))
        )
        data = list(qs.values(
            'id', 'lot_no', 'pr_no', 'bales', 'has_deliveries', 'bargain',
            'bargain__deal_no', 'bargain__bargain_date', 'bargain__seller__company_name', 'bargain__buyer__company_name'
        ))
        for d in data:
            date = d.pop('bargain__bargain_date', None)
            if date:
                fy = f"{date.year % 100}-{(date.year + 1) % 100}" if date.month >= 4 else f"{(date.year - 1) % 100}-{date.year % 100}"
                d['deal_no'] = f"{fy}/{d.pop('bargain__deal_no')}"
            else:
                d['deal_no'] = d.pop('bargain__deal_no', None)
                
            d['seller_name'] = d.pop('bargain__seller__company_name', None)
            d['buyer_name'] = d.pop('bargain__buyer__company_name', None)
            d['status'] = "Dispatched" if d.pop('has_deliveries', False) else "Pending Dispatch"
        return Response(data)

class DeliveryDetailsViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryDetailsSerializer

    def get_queryset(self):
        return DeliveryDetails.objects.filter(tenant=self.request.user.tenant) \
            .select_related('bargain__seller', 'bargain__buyer', 'passing')

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

# --- BROKERAGE LOGIC ---

@api_view(['GET'])
def get_pending_deliveries(request):
    party_id = request.GET.get('party_id')
    
    if not party_id:
        return Response({"error": "Party ID is required"}, status=400)

    try:
        party = PartyMaster.objects.get(id=party_id, tenant=request.user.tenant)
        
        # LOGIC: 
        # 1. Find deliveries where this party is the SELLER, and 'seller_billed' is False
        # 2. OR find deliveries where this party is the BUYER, and 'buyer_billed' is False
        
        deliveries = DeliveryDetails.objects.filter(
            Q(bargain__seller=party, seller_billed=False) | 
            Q(bargain__buyer=party, buyer_billed=False)
        ).filter(tenant=request.user.tenant)
        
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
        party = PartyMaster.objects.get(id=data['party_id'], tenant=request.user.tenant)
        firm = FirmMaster.objects.get(id=data['firm_id'], tenant=request.user.tenant)
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
            amount_in_words=data.get('amount_in_words', ''),
            tenant=request.user.tenant
        )
        
        # 2. Link Deliveries & Mark them as Billed
        for delivery_id in delivery_ids:
            d = DeliveryDetails.objects.get(id=delivery_id, tenant=request.user.tenant)
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
        import datetime
        from django.utils import timezone
        
        now = timezone.now().date()
        if now.month >= 4:
            fy_start_date = datetime.date(now.year, 4, 1)
            fy_end_year = now.year + 1
        else:
            fy_start_date = datetime.date(now.year - 1, 4, 1)
            fy_end_year = now.year

        fy_label = f"Apr '{str(fy_start_date.year)[-2:]} - Mar '{str(fy_end_year)[-2:]}"

        total_bales_ytd_agg = BargainEntry.objects.filter(
            tenant=request.user.tenant,
            bargain_date__gte=fy_start_date
        ).aggregate(Sum('bales'))
        total_bales_ytd = total_bales_ytd_agg['bales__sum'] or 0
        
        # Calculate Total Bales for current month
        current_month = now.month
        current_year = now.year
        total_bales_agg = BargainEntry.objects.filter(
            tenant=request.user.tenant,
            bargain_date__year=current_year,
            bargain_date__month=current_month
        ).aggregate(Sum('bales'))
        total_bales = total_bales_agg['bales__sum'] or 0
        
        # Calculate Pending Dispatches (Bales awaiting dispatch = Lifetime Bales - Delivered Bales)
        lifetime_bales = BargainEntry.objects.filter(tenant=request.user.tenant).aggregate(Sum('bales'))['bales__sum'] or 0
        total_delivered_agg = DeliveryDetails.objects.filter(tenant=request.user.tenant).aggregate(Sum('quantity_bales'))
        total_delivered_bales = total_delivered_agg['quantity_bales__sum'] or 0
        pending_dispatches = max(0, lifetime_bales - total_delivered_bales)
        
        # Calculate Pending Passing
        pending_passing_agg = BargainSplit.objects.filter(
            tenant=request.user.tenant, 
            status='Pending Passing'
        ).aggregate(Sum('bales'))
        pending_passing = pending_passing_agg['bales__sum'] or 0

        # Unbilled Deliveries Logic (Older than 6 months or oldest)
        from datetime import date, timedelta
        from django.db.models import Min
        six_months_ago = date.today() - timedelta(days=180)
        
        unbilled_deliveries_qs = DeliveryDetails.objects.filter(
            tenant=request.user.tenant, 
            seller_billed=False, 
            buyer_billed=False
        )
        
        oldest_unbilled_count = unbilled_deliveries_qs.filter(bill_date__lt=six_months_ago).count()
        
        oldest_unbilled_date_agg = unbilled_deliveries_qs.aggregate(oldest=Min('bill_date'))['oldest']
        oldest_unbilled_date = oldest_unbilled_date_agg.strftime('%d-%m-%Y') if oldest_unbilled_date_agg else None
            
        unbilled_info = {
            "count": oldest_unbilled_count if oldest_unbilled_count > 0 else (1 if oldest_unbilled_date else 0),
            "oldest_date": oldest_unbilled_date,
            "is_6_months_plus": oldest_unbilled_count > 0
        }

        # Fulfillment Progress (% of dispatched this month)
        current_month = date.today().month
        current_year = date.today().year
        
        booked_this_month = BargainEntry.objects.filter(
            tenant=request.user.tenant, 
            bargain_date__month=current_month, 
            bargain_date__year=current_year
        ).aggregate(Sum('bales'))['bales__sum'] or 0
        
        dispatched_this_month = DeliveryDetails.objects.filter(
            tenant=request.user.tenant,
            bill_date__month=current_month,
            bill_date__year=current_year
        ).aggregate(Sum('quantity_bales'))['quantity_bales__sum'] or 0
        
        fulfillment_progress = 0
        if booked_this_month > 0:
            fulfillment_progress = round((dispatched_this_month / booked_this_month) * 100, 1)

        # 2. Top 5 Buyers by Volume
        top_buyers = list(BargainEntry.objects.filter(tenant=request.user.tenant).values('buyer__company_name')
                          .annotate(total_bales=Sum('bales'))
                          .order_by('-total_bales')[:5])
                          
        # 3. Top 5 Sellers by Volume
        top_sellers = list(BargainEntry.objects.filter(tenant=request.user.tenant).values('seller__company_name')
                           .annotate(total_bales=Sum('bales'))
                           .order_by('-total_bales')[:5])
                           
        # 4. Bales Volume Trend (Month-over-Month)
        bales_trends_query = (
            BargainEntry.objects.filter(tenant=request.user.tenant)
            .annotate(month=TruncMonth('bargain_date'))
            .values('month')
            .annotate(volume=Sum('bales'))
            .order_by('month')
        )
        
        bales_trends = [
            {
                "month": bt['month'].strftime('%b %Y') if bt['month'] else 'Unknown',
                "volume": float(bt['volume'])
            }
            for bt in bales_trends_query
        ]
        
        # 5. Recent Bargains (Last 4)
        recent_bargains_qs = BargainEntry.objects.filter(tenant=request.user.tenant).order_by('-created_at')[:4]
        recent_bargains = [
            {
                "date": b.bargain_date.strftime('%d %b, %Y'),
                "buyer": b.buyer.company_name,
                "seller": b.seller.company_name,
                "bales": b.bales
            } for b in recent_bargains_qs
        ]
        
        return Response({
            "kpi": {
                "total_bales_ytd": total_bales_ytd,
                "total_deals_label": fy_label,
                "total_bales": total_bales,
                "pending_dispatches": pending_dispatches,
                "pending_passing": pending_passing,
                "unbilled_info": unbilled_info,
                "fulfillment_progress": fulfillment_progress,
                "current_month_name": date.today().strftime('%B')
            },
            "top_buyers": top_buyers,
            "top_sellers": top_sellers,
            "bales_trends": bales_trends,
            "recent_bargains": recent_bargains
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
    unpaid_bills = BrokerageBill.objects.filter(tenant=request.user.tenant, is_paid=False)
    
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
    bills = BrokerageBill.objects.filter(tenant=request.user.tenant, party_id=party_id, is_paid=False).order_by('bill_date')
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
            party = PartyMaster.objects.get(id=party_id, tenant=request.user.tenant)
            
            # 1. Create the Receipt
            receipt = PartyPaymentReceipt.objects.create(
                tenant=request.user.tenant,
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
                    
                bill = BrokerageBill.objects.select_for_update().get(id=bill_id, party=party, tenant=request.user.tenant)
                
                # Create allocation record
                PaymentAllocation.objects.create(
                    tenant=request.user.tenant,
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

@api_view(['GET'])
def get_party_statement(request, party_id):
    try:
        from datetime import datetime
        party = PartyMaster.objects.get(id=party_id, tenant=request.user.tenant)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        bills_query = BrokerageBill.objects.filter(tenant=request.user.tenant, party=party)
        payments_query = PartyPaymentReceipt.objects.filter(tenant=request.user.tenant, party=party)

        if start_date:
            bills_query = bills_query.filter(bill_date__gte=start_date)
            payments_query = payments_query.filter(receipt_date__gte=start_date)
        if end_date:
            bills_query = bills_query.filter(bill_date__lte=end_date)
            payments_query = payments_query.filter(receipt_date__lte=end_date)

        transactions = []
        
        # Debits (Bills)
        for bill in bills_query:
            transactions.append({
                "date": str(bill.bill_date),
                "type": "Bill",
                "ref_no": bill.bill_no,
                "particulars": f"Brokerage Bill #{bill.bill_no} ({bill.total_bales} Bales)",
                "debit": float(bill.net_amount),
                "credit": 0.0
            })
            
        # Credits (Payments)
        for pay in payments_query:
            transactions.append({
                "date": str(pay.receipt_date),
                "type": "Payment",
                "ref_no": pay.reference_no or str(pay.id),
                "particulars": f"Payment Received - {pay.payment_mode}",
                "debit": 0.0,
                "credit": float(pay.amount)
            })

        # Sort chronologically
        transactions.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"))

        # Calculate Running Balance
        running_balance = 0.0
        for txn in transactions:
            running_balance += txn["debit"]
            running_balance -= txn["credit"]
            txn["balance"] = running_balance

        return Response({
            "party": {
                "id": party.id,
                "company_name": party.company_name,
                "station": party.station
            },
            "transactions": transactions,
            "closing_balance": running_balance
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes

@api_view(['POST'])
@permission_classes([AllowAny])
def register_skeleton_account(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        company_name = data.get('company_name')

        if not all([username, password, company_name]):
            return Response({"error": "Missing required fields"}, status=400)

        if CustomUser.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)

        with transaction.atomic():
            # Create Skeleton Tenant
            tenant = Tenant.objects.create(
                company_name=company_name,
                subscription_status='pending'
            )
            
            # Create User
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
                tenant=tenant
            )

        return Response({
            "message": "Skeleton account created successfully. Proceed to payment.",
            "tenant_id": tenant.id
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class BrokerNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        note, _ = BrokerNote.objects.get_or_create(user=request.user)
        serializer = BrokerNoteSerializer(note)
        return Response(serializer.data)

    def post(self, request):
        note, _ = BrokerNote.objects.get_or_create(user=request.user)
        content = request.data.get('content', '')
        note.content = content
        note.save()
        serializer = BrokerNoteSerializer(note)
        return Response(serializer.data)

class ChecklistItemViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChecklistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)