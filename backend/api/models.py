import datetime
from django.db import models

class PartyMaster(models.Model):
    PARTY_TYPES = [
        ('Mill', 'Mill'),
        ('Trader', 'Trader'),
        ('Ginner', 'Ginner'),
        ('Buyer', 'Buyer'),
        ('Seller', 'Seller'),
        ('Other', 'Other'),
    ]

    party_code = models.CharField(max_length=50, unique=True)
    company_name = models.CharField(max_length=255)
    station = models.CharField(max_length=100)
    address = models.TextField()
    state = models.CharField(max_length=100)
    party_type = models.CharField(max_length=20, choices=PARTY_TYPES)
    
    contact_person = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15)
    whatsapp_no = models.CharField(max_length=15, blank=True, null=True)
    email1 = models.EmailField(blank=True, null=True)
    email2 = models.EmailField(blank=True, null=True)
    
    pan_no = models.CharField(max_length=20, blank=True, null=True)
    gst_no = models.CharField(max_length=20, blank=True, null=True)
    ho_unit = models.CharField(max_length=50, blank=True, null=True)
    
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)
    bank_ac_no = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.company_name

class FirmMaster(models.Model):
    firm_name = models.CharField(max_length=255)
    title = models.CharField(max_length=50, blank=True, null=True)
    firm_no = models.CharField(max_length=50, blank=True, null=True)
    
    address = models.TextField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    state = models.CharField(max_length=100)
    
    tele_o = models.CharField(max_length=20, blank=True, null=True)
    mobile = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    website = models.CharField(max_length=100, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    
    cin_no = models.CharField(max_length=30, blank=True, null=True)
    pan_no = models.CharField(max_length=20, blank=True, null=True)
    gst_no = models.CharField(max_length=20, blank=True, null=True)
    tan_no = models.CharField(max_length=20, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)
    bank_ac_no = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    
    letterhead = models.ImageField(upload_to='letterheads/', blank=True, null=True)

    def __str__(self):
        return self.firm_name

class BargainEntry(models.Model):
    # Field Options based on your screenshots
    STATUS_CHOICES = [
        ('Pending Passing', 'Pending Passing'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled')
    ]
    
    deal_no = models.AutoField(primary_key=True)
    bargain_date = models.DateField()
    
    seller = models.ForeignKey(PartyMaster, on_delete=models.CASCADE, related_name='sales')
    buyer = models.ForeignKey(PartyMaster, on_delete=models.CASCADE, related_name='purchases')
    
    station = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, null=True) # Added State
    
    bales = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, default="Candy") # Added Unit
    
    payment_condition = models.IntegerField(help_text="Days")
    # Updated Payment By to match your screenshot (Dispatch Date, etc.)
    payment_by = models.CharField(max_length=100) 
    
    # Auto-Dropdowns
    cash_disc = models.CharField(max_length=100, blank=True, null=True)
    cotton_certificate = models.CharField(max_length=100, blank=True, null=True)
    
    # Dropdowns from screenshot
    delivery_terms = models.CharField(max_length=255)
    delivery_type = models.CharField(max_length=100) # Spot, MD-FOR...
    deal_type = models.CharField(max_length=100) # Pakka Sauda, Sub to Passing...
    
    delivery_from = models.CharField(max_length=100, blank=True, null=True)
    
    # Weight Terms (Radio Button)
    weight_terms = models.CharField(max_length=50, default="Mill Weight")
    
    # Bottom Section (Quality & Manual Fields)
    qc_seller = models.CharField(max_length=100, blank=True, null=True)
    qc_buyer = models.CharField(max_length=100, blank=True, null=True)
    bargain_type = models.CharField(max_length=100, blank=True, null=True) # Bottom dropdown
    bargain_no_manual = models.CharField(max_length=50, blank=True, null=True) # Manual book no
    
    advised_by = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending Passing')
    remarks = models.TextField(blank=True, null=True)

    @property
    def smart_deal_id(self):
        date = self.bargain_date
        if date.month >= 4:
            fy = f"{date.year % 100}-{(date.year + 1) % 100}"
        else:
            fy = f"{(date.year - 1) % 100}-{date.year % 100}"
        return f"{fy}/{self.deal_no}"

    def __str__(self):
        return self.smart_deal_id

class PassingEntry(models.Model):
    bargain = models.ForeignKey(BargainEntry, on_delete=models.CASCADE)
    passing_no = models.CharField(max_length=50)
    approval_date = models.DateField()
    due_date = models.DateField(blank=True, null=True)
    lot_no = models.CharField(max_length=50)
    approved_by = models.CharField(max_length=100)
    remarks = models.TextField(blank=True, null=True)

class DeliveryDetails(models.Model):
    bargain = models.ForeignKey(BargainEntry, on_delete=models.CASCADE)
    passing = models.ForeignKey(PassingEntry, on_delete=models.SET_NULL, null=True, blank=True)
    bill_no = models.CharField(max_length=50)
    bill_date = models.DateField()
    truck_no = models.CharField(max_length=20)
    transport_name = models.CharField(max_length=100, blank=True, null=True)
    quantity_bales = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    net_weight = models.DecimalField(max_digits=10, decimal_places=2)
    cotton_value = models.DecimalField(max_digits=12, decimal_places=2)
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_bill_amount = models.DecimalField(max_digits=12, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)

    # --- NEW: Billing Flags (To track commission status) ---
    # We track Buyer and Seller separately so you can bill them at different times
    seller_billed = models.BooleanField(default=False) 
    buyer_billed = models.BooleanField(default=False)

    def __str__(self):
        return f"Bill #{self.bill_no}"

class BrokerageBill(models.Model):
    bill_no = models.CharField(max_length=50, unique=True)
    bill_date = models.DateField()
    
    # Who are we billing?
    party = models.ForeignKey(PartyMaster, on_delete=models.CASCADE)
    firm = models.ForeignKey(FirmMaster, on_delete=models.CASCADE) # The Broker Firm issuing the bill
    
    # The list of truck deliveries included in this bill
    deliveries = models.ManyToManyField(DeliveryDetails)

    # Calculations
    total_bales = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2) # Brokerage Rate (e.g. 60)
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2) # Bales * Rate
    
    # Tax Logic
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    cgst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sgst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    igst_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    net_amount = models.DecimalField(max_digits=12, decimal_places=2) # Final Amount
    amount_in_words = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Brokerage Bill #{self.bill_no}"