import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import PartyMaster, BargainEntry, PassingEntry, DeliveryDetails

def run():
    buyers = PartyMaster.objects.filter(party_type="Mill")
    sellers = PartyMaster.objects.filter(party_type="Ginner")
    
    if not buyers.exists() or not sellers.exists():
        print("Not enough parties. Please run populate_db.py first.")
        return

    buyer = buyers.first()
    seller = sellers.first()
    
    today = datetime.today().date()
    deal_date = today - timedelta(days=2)
    
    rate = Decimal('58000')
    bales = 300
    
    print(f"Creating unbilled bargain for Buyer: {buyer.company_name} and Seller: {seller.company_name}...")
    
    bargain = BargainEntry.objects.create(
        bargain_date=deal_date,
        seller=seller, buyer=buyer,
        station=seller.station, state=seller.state,
        bales=bales, rate=rate, unit="Candy",
        payment_condition=15, payment_by="Dispatch Date",
        delivery_terms="Ready", delivery_type="Spot", deal_type="Pakka Sauda",
        status="Approved"
    )
    
    passing = PassingEntry.objects.create(
        bargain=bargain, passing_no=f"PASS-UNBILLED-{bargain.deal_no}",
        approval_date=deal_date + timedelta(days=1),
        lot_no=f"LOT-TEST",
        approved_by="Inspector"
    )
    
    for t in range(3):
        cotton_val = Decimal(100) * rate
        DeliveryDetails.objects.create(
            bargain=bargain, passing=passing,
            bill_no=f"INV-TEST-{bargain.deal_no}-{t}",
            bill_date=today,
            truck_no=f"MH-40-XX-{random.randint(1000, 9999)}",
            quantity_bales=100,
            rate=rate, net_weight=Decimal('16500'),
            cotton_value=cotton_val,
            gst_percent=Decimal('5.0'),
            gst_amount=cotton_val * Decimal('0.05'),
            total_bill_amount=cotton_val * Decimal('1.05'),
            seller_billed=False, buyer_billed=False
        )

    print("Successfully created 3 unbilled deliveries for the new bargain!")
    print(f"Go to Bill Generation, select your Firm and select Party: '{buyer.company_name}' or '{seller.company_name}' to see the pending bills.")

if __name__ == '__main__':
    run()
