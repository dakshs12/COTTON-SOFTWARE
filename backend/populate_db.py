import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Tenant, CustomUser, PartyMaster, FirmMaster, BargainEntry, PassingEntry, DeliveryDetails, BrokerageBill
from django.contrib.auth import get_user_model

def run():
    print("Clearing old data...")
    BrokerageBill.objects.all().delete()
    DeliveryDetails.objects.all().delete()
    PassingEntry.objects.all().delete()
    BargainEntry.objects.all().delete()
    PartyMaster.objects.all().delete()
    FirmMaster.objects.all().delete()
    Tenant.objects.all().delete()
    CustomUser.objects.exclude(username='admin').delete()

    print("Creating Tenant and User...")
    tenant1 = Tenant.objects.create(
        company_name="Daksh Cotton Enterprises",
        subscription_status='active',
        dodo_customer_id='cus_12345'
    )
    user = get_user_model().objects.create_user(
        username='broker1',
        email='broker1@example.com',
        password='password123',
        tenant=tenant1
    )

    print("Creating Firms...")
    firm1 = FirmMaster.objects.create(
        tenant=tenant1,
        firm_name="Daksh Cotton Brokers",
        address="123 Broker Lane", city="Indore", state="Madhya Pradesh",
        mobile="9876543210"
    )

    print("Creating Parties (Buyers/Mills & Sellers/Ginners)...")
    buyers = [
        PartyMaster.objects.create(tenant=tenant1, party_code=f"B{i}", company_name=f"Mill Corporation {i}", station=random.choice(["Indore", "Mumbai", "Ahmedabad"]), address="Mill Area", state=random.choice(["Madhya Pradesh", "Maharashtra", "Gujarat"]), party_type="Mill", mobile="9999999999")
        for i in range(1, 6)
    ]
    
    sellers = [
        PartyMaster.objects.create(tenant=tenant1, party_code=f"S{i}", company_name=f"Ginner Industries {i}", station=random.choice(["Khandwa", "Rajkot", "Jalgaon"]), address="Ginning Area", state=random.choice(["Madhya Pradesh", "Gujarat", "Maharashtra"]), party_type="Ginner", mobile="8888888888")
        for i in range(1, 6)
    ]

    print("Creating Bargains, Deliveries, and Bills over the last 6 months...")
    today = datetime.today().date()
    
    bill_counter = 1
    for month_offset in range(6):
        target_month = today - timedelta(days=30 * month_offset)
        
        # 5 to 10 deals per month
        num_deals = random.randint(5, 10)
        for i in range(num_deals):
            deal_date = target_month - timedelta(days=random.randint(1, 28))
            buyer = random.choice(buyers)
            seller = random.choice(sellers)
            bales = random.choice([100, 200, 300, 500])
            rate = Decimal(random.randint(55000, 65000))
            
            bargain = BargainEntry.objects.create(
                tenant=tenant1,
                bargain_date=deal_date,
                seller=seller, buyer=buyer,
                station=seller.station, state=seller.state,
                bales=bales, rate=rate, unit="Candy",
                payment_condition=15, payment_by="Dispatch Date",
                delivery_terms="Ready", delivery_type="Spot", deal_type="Pakka Sauda"
            )
            
            # Create a passing
            passing = PassingEntry.objects.create(
                tenant=tenant1,
                bargain=bargain,
                approval_date=deal_date + timedelta(days=2),
                lot_no=f"LOT-{random.randint(100, 999)}",
                approved_by="Inspector"
            )
            
            # Create Deliveries (1 truck per 100 bales roughly)
            trucks = bales // 100
            deliveries = []
            for t in range(trucks):
                delivery_date = passing.approval_date + timedelta(days=t)
                cotton_val = Decimal(100) * rate # Approximation
                deliv = DeliveryDetails.objects.create(
                    tenant=tenant1,
                    bargain=bargain, passing=passing,
                    bill_no=f"INV-{bargain.deal_no}-{t}",
                    bill_date=delivery_date,
                    truck_no=f"MH-12-AB-{random.randint(1000, 9999)}",
                    quantity_bales=100,
                    rate=rate, net_weight=Decimal('16500'),
                    cotton_value=cotton_val,
                    gst_percent=Decimal('5.0'),
                    gst_amount=cotton_val * Decimal('0.05'),
                    total_bill_amount=cotton_val * Decimal('1.05'),
                    seller_billed=True, buyer_billed=True
                )
                deliveries.append(deliv)
                
            # Create Brokerage Bill for this deal (simplified: 1 bill per deal for the buyer)
            gross = Decimal(bales * 60) # 60 rs per bale brokerage
            bill = BrokerageBill.objects.create(
                tenant=tenant1,
                bill_no=f"BB-{bill_counter}", bill_date=deliveries[-1].bill_date + timedelta(days=5),
                party=buyer, firm=firm1, total_bales=bales, rate=Decimal('60'),
                gross_amount=gross, gst_percent=Decimal('18'),
                igst_amount=gross * Decimal('0.18'),
                net_amount=gross * Decimal('1.18')
            )
            bill.deliveries.set(deliveries)
            bill_counter += 1

    print("Dummy data successfully populated!")

if __name__ == '__main__':
    run()
