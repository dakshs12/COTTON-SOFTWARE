import random
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from .models import (
    Tenant, CustomUser, FirmMaster, PartyMaster, BargainEntry, PassingEntry,
    DeliveryDetails, BrokerageBill, PartyPaymentReceipt, PaymentAllocation
)

INDIAN_COTTON_FIRMS = [
    {"name": "Shree Ram Ginning & Pressing Factory", "station": "Khandwa", "state": "Madhya Pradesh", "type": "Ginner", "city": "Khandwa"},
    {"name": "Tirupati Spinning Mills Pvt Ltd", "station": "Coimbatore", "state": "Tamil Nadu", "type": "Mill", "city": "Coimbatore"},
    {"name": "Mahalaxmi Cottons & Agro Industries", "station": "Rajkot", "state": "Gujarat", "type": "Trader", "city": "Rajkot"},
    {"name": "Balaji Cotton Traders", "station": "Sendhwa", "state": "Madhya Pradesh", "type": "Trader", "city": "Sendhwa"},
    {"name": "Vardhman Textiles Ltd", "station": "Ludhiana", "state": "Punjab", "type": "Mill", "city": "Ludhiana"},
    {"name": "Kishan Agro Ginning Factory", "station": "Kadi", "state": "Gujarat", "type": "Ginner", "city": "Kadi"},
    {"name": "Shubham Cotton Industries", "station": "Amravati", "state": "Maharashtra", "type": "Ginner", "city": "Amravati"},
    {"name": "Om Sai Spinners", "station": "Guntur", "state": "Andhra Pradesh", "type": "Mill", "city": "Guntur"},
    {"name": "Maruti Cotton Corporation", "station": "Khargone", "state": "Madhya Pradesh", "type": "Trader", "city": "Khargone"},
    {"name": "Narmada Ginning & Pressing", "station": "Dhamnod", "state": "Madhya Pradesh", "type": "Ginner", "city": "Dhamnod"},
]

def generate_demo_data_for_user(user):
    """
    Generates realistic dummy data for a user's tenant account:
    - Tenant & Firm Master
    - 5 to 10 Parties
    - 15 to 25 Bargains (spread across last 60 days)
    - Passings, Deliveries, Brokerage Bills, Receipts & Allocations
    """
    # 1. Ensure Tenant
    tenant = user.tenant
    if not tenant:
        company_name = f"{user.first_name or user.username.split('@')[0].capitalize()}'s Cotton Agency"
        tenant = Tenant.objects.create(company_name=company_name, subscription_status='active')
        user.tenant = tenant
        user.save()

    # 2. Use existing Broker Firm or create default
    firm = FirmMaster.objects.filter(tenant=tenant).first()
    if not firm:
        firm = FirmMaster.objects.create(
            tenant=tenant,
            firm_name=f"{tenant.company_name} Broking Co.",
            city='Indore',
            state='Madhya Pradesh',
            mobile=user.phone_number or '9826012345',
            email=user.email or 'demo@cottbook.com',
            tagline='Cotton Broker & Commission Agent',
            jurisdiction='Indore'
        )

    # 3. Create Parties (5 to 10)
    existing_parties = list(PartyMaster.objects.filter(tenant=tenant, is_deleted=False))
    if len(existing_parties) < 5:
        num_to_add = random.randint(6, 9)
        sample_firms = random.sample(INDIAN_COTTON_FIRMS, min(num_to_add, len(INDIAN_COTTON_FIRMS)))
        for i, firm_data in enumerate(sample_firms, start=len(existing_parties) + 1):
            p = PartyMaster.objects.create(
                tenant=tenant,
                party_code=f"P-{tenant.id}-{i:02d}-{random.randint(100,999)}",
                company_name=firm_data['name'],
                station=firm_data['station'],
                state=firm_data['state'],
                address=f"Plot No. {random.randint(1,100)}, Industrial Area, {firm_data['city']}",
                party_type=firm_data['type'],
                contact_person=f"Mr. {random.choice(['Rajesh', 'Suresh', 'Anil', 'Vijay', 'Ramesh'])} {random.choice(['Sharma', 'Patel', 'Jain', 'Gupta', 'Shah'])}",
                mobile=f"9{random.randint(100000000, 999999999)}"
            )
            existing_parties.append(p)

    sellers = [p for p in existing_parties if p.party_type in ['Ginner', 'Trader', 'Seller']] or existing_parties
    buyers = [p for p in existing_parties if p.party_type in ['Mill', 'Trader', 'Buyer']] or existing_parties

    # 4. Generate Bargains (15 to 25 spread across last 60 days)
    today = timezone.now().date()
    num_bargains = random.randint(18, 24)
    
    status_weights = [('Approved', 0.50), ('Pending Passing', 0.30), ('Rejected', 0.10), ('Cancelled', 0.10)]
    
    created_bargains = []
    for _ in range(num_bargains):
        days_ago = random.randint(1, 60)
        b_date = today - timedelta(days=days_ago)
        
        seller = random.choice(sellers)
        buyer_candidates = [b for b in buyers if b.id != seller.id]
        buyer = random.choice(buyer_candidates) if buyer_candidates else seller

        status_choice = random.choices([s[0] for s in status_weights], weights=[s[1] for s in status_weights])[0]
        
        bales = random.choice([100, 200, 300, 500, 700, 1000])
        rate = Decimal(random.choice([58000, 60000, 61500, 62000, 63500, 64000]))
        
        bargain = BargainEntry.objects.create(
            tenant=tenant,
            bargain_date=b_date,
            seller=seller,
            buyer=buyer,
            station=seller.station,
            state=seller.state,
            bales=bales,
            rate=rate,
            unit="Candy",
            payment_condition=random.choice([7, 10, 15, 20]),
            payment_by="Dispatch Date",
            delivery_terms="Ex-Mill",
            delivery_type="MD-FOR",
            deal_type="Pakka Sauda",
            status=status_choice,
            advised_by="Broker"
        )
        created_bargains.append(bargain)

    # 5. Generate Passings & Deliveries for Approved bargains
    approved_bargains = [b for b in created_bargains if b.status == 'Approved']
    
    # Ensure existing deliveries for this tenant have unbilled items for demo
    existing_deliveries = list(DeliveryDetails.objects.filter(tenant=tenant))
    for d in existing_deliveries[:max(3, len(existing_deliveries) // 2)]:
        d.seller_billed = False
        d.buyer_billed = False
        d.save()
    
    bills_created = []
    # Leave some approved bargains without passings so user can demo "Select Deal" dropdown
    num_passings = max(1, int(len(approved_bargains) * 0.7)) if approved_bargains else 0
    bargains_with_passings = approved_bargains[:num_passings]

    for i, bargain in enumerate(bargains_with_passings):
        approval_days = random.randint(1, 3)
        app_date = bargain.bargain_date + timedelta(days=approval_days)
        if app_date > today:
            app_date = today

        passing = PassingEntry.objects.create(
            tenant=tenant,
            bargain=bargain,
            approval_date=app_date,
            due_date=app_date + timedelta(days=bargain.payment_condition),
            bales=bargain.bales,
            lot_no=f"LOT-{random.randint(100, 999)}",
            pr_no=f"PR-{random.randint(1000, 9999)}",
            approved_by="Inspector Ram"
        )

        # Create Delivery
        delivery_days = random.randint(1, 4)
        del_date = app_date + timedelta(days=delivery_days)
        if del_date > today:
            del_date = today

        net_weight = Decimal(bargain.bales * 165)
        cotton_val = (bargain.rate * (net_weight / Decimal('355'))).quantize(Decimal('0.01'))
        gst_amt = (cotton_val * Decimal('0.05')).quantize(Decimal('0.01'))
        total_bill = cotton_val + gst_amt

        delivery = DeliveryDetails.objects.create(
            tenant=tenant,
            bargain=bargain,
            passing=passing,
            bill_no=f"INV-{random.randint(1000, 9999)}",
            bill_date=del_date,
            truck_no=f"MP-{random.randint(10, 99)}{random.choice(['AB','CD','EF'])}{random.randint(1000, 9999)}",
            transport_name="Narmada Transport",
            quantity_bales=bargain.bales,
            rate=bargain.rate,
            net_weight=net_weight,
            cotton_value=cotton_val,
            gst_percent=Decimal('5.00'),
            gst_amount=gst_amt,
            total_bill_amount=total_bill,
            seller_billed=False,
            buyer_billed=False
        )

        # Generate Brokerage Bill (Ensure exactly half of the deliveries are left unbilled)
        if i < len(bargains_with_passings) // 2:
            b_rate = Decimal(random.choice([50, 60, 70]))
            gross = Decimal(bargain.bales) * b_rate
            cgst = (gross * Decimal('0.09')).quantize(Decimal('0.01'))
            sgst = (gross * Decimal('0.09')).quantize(Decimal('0.01'))
            net_amt = gross + cgst + sgst

            billed_party = random.choice([bargain.seller, bargain.buyer])

            bill = BrokerageBill.objects.create(
                tenant=tenant,
                bill_no=f"BB-{tenant.id}-{random.randint(1000, 9999)}",
                bill_date=del_date + timedelta(days=1),
                party=billed_party,
                firm=firm,
                total_bales=bargain.bales,
                rate=b_rate,
                gross_amount=gross,
                gst_percent=Decimal('18.00'),
                cgst_amount=cgst,
                sgst_amount=sgst,
                net_amount=net_amt,
                amount_paid=Decimal('0.00'),
                is_paid=False
            )
            bill.deliveries.add(delivery)
            bills_created.append(bill)

            # Update the billed flag for the billed party
            if billed_party == bargain.seller:
                delivery.seller_billed = True
            else:
                delivery.buyer_billed = True
            delivery.save()

    # 6. Generate Receipts & Allocations (~50% of brokerage bills paid)
    for bill in bills_created:
        if random.random() < 0.5:
            rec_date = bill.bill_date + timedelta(days=random.randint(3, 12))
            if rec_date > today:
                rec_date = today

            receipt = PartyPaymentReceipt.objects.create(
                tenant=tenant,
                party=bill.party,
                receipt_date=rec_date,
                amount=bill.net_amount,
                payment_mode=random.choice(['NEFT', 'RTGS', 'UPI', 'Cheque']),
                reference_no=f"REF-{random.randint(10000, 99999)}"
            )

            PaymentAllocation.objects.create(
                tenant=tenant,
                receipt=receipt,
                bill=bill,
                allocated_amount=bill.net_amount
            )

            bill.amount_paid = bill.net_amount
            bill.is_paid = True
            bill.save()

    return {
        'parties': len(existing_parties),
        'bargains': len(created_bargains),
        'bills': len(bills_created)
    }
