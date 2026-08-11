import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
from .core_models import BaseModel

class Tenant(models.Model):
    SUBSCRIPTION_STATUS = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
    ]
    company_name = models.CharField(max_length=255)
    subscription_status = models.CharField(max_length=50, choices=SUBSCRIPTION_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Firm"
        verbose_name_plural = "Firms"

    def __str__(self):
        return self.company_name

class UserSubscription(models.Model):
    PLAN_CHOICES = [
        ('TRIAL', '14-Day Free Trial'),
        ('1_YEAR', '1 Year Plan'),
        ('3_YEAR', '3 Year Plan'),
        ('5_YEAR', '5 Year Plan'),
    ]
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE, related_name='subscription')
    plan_type = models.CharField(max_length=50, choices=PLAN_CHOICES, default='1_YEAR')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    base_firm_limit = models.IntegerField(default=2)
    
    @property
    def days_remaining(self):
        from django.utils import timezone
        import math
        if not self.end_date:
            return 0
        delta = self.end_date - timezone.now()
        total_seconds = delta.total_seconds()
        if total_seconds <= 0:
            return 0
        return math.ceil(total_seconds / 86400)
        
    @property
    def subscription_status(self):
        if not self.is_active:
            return 'LOCKED_OUT'
            
        days = self.days_remaining
        if days <= 0:
            return 'LOCKED_OUT'
        elif days <= 3:
            return 'EXPIRING_WARNING'
        else:
            return 'ACTIVE'
            
    class Meta:
        verbose_name = "User Subscription"
        verbose_name_plural = "User Subscriptions"

    def __str__(self):
        return f"Sub - {self.subscription_status}"

class CustomUser(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT, null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    failed_login_attempts = models.IntegerField(default=0)
    lockout_until = models.DateTimeField(null=True, blank=True)

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

@receiver(post_save, sender=CustomUser)
def create_user_subscription(sender, instance, created, **kwargs):
    if created:
        UserSubscription.objects.create(
            user=instance,
            plan_type='TRIAL',
            end_date=timezone.now() + timedelta(days=14),
            is_active=True,
            base_firm_limit=2
        )

class PartyMaster(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
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
    pincode = models.CharField(max_length=20, blank=True, null=True)
    party_type = models.CharField(max_length=20, choices=PARTY_TYPES)
    
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    contact_person_designation = models.CharField(max_length=100, blank=True, null=True)
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

class FirmMaster(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    firm_name = models.CharField(max_length=255)
    title = models.CharField(max_length=50, blank=True, null=True)
    firm_no = models.CharField(max_length=50, blank=True, null=True)
    tagline = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. Cotton Broker & Commission Agent")
    jurisdiction = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Indore")
    
    address = models.TextField()
    branch_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    state = models.CharField(max_length=100)
    
    tele_o = models.CharField(max_length=20, blank=True, null=True)
    mobile = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    website = models.CharField(max_length=100, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    contact_person_designation = models.CharField(max_length=100, blank=True, null=True)
    
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

class BargainEntry(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    # Field Options based on your screenshots
    STATUS_CHOICES = [
        ('Pending Passing', 'Pending Passing'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled')
    ]
    
    deal_no = models.AutoField(primary_key=True)
    bargain_date = models.DateField()
    
    seller = models.ForeignKey(PartyMaster, on_delete=models.PROTECT, related_name='sales')
    buyer = models.ForeignKey(PartyMaster, on_delete=models.PROTECT, related_name='purchases')
    
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
    quality_condition = models.CharField(max_length=100, blank=True, null=True)
    
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

    class Meta:
        verbose_name = "Bargain"
        verbose_name_plural = "Bargains"

    def __str__(self):
        return self.smart_deal_id

class PassingEntry(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    bargain = models.ForeignKey(BargainEntry, on_delete=models.PROTECT)
    approval_date = models.DateField()
    due_date = models.DateField(blank=True, null=True)
    bales = models.IntegerField(default=0)
    lot_no = models.CharField(max_length=50)
    pr_no = models.CharField(max_length=50, blank=True, null=True)
    book_bargain_no = models.CharField(max_length=50, blank=True, null=True)
    approved_by = models.CharField(max_length=100)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Passing"
        verbose_name_plural = "Passings"

class BargainSplit(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    bargain = models.ForeignKey(BargainEntry, related_name='splits', on_delete=models.CASCADE)
    bales = models.IntegerField()
    status = models.CharField(max_length=50, choices=BargainEntry.STATUS_CHOICES, default='Pending Passing')
    
    def __str__(self):
        return f"Split: {self.bales} Bales (Deal #{self.bargain.deal_no})"

class DeliveryDetails(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    bargain = models.ForeignKey(BargainEntry, on_delete=models.PROTECT)
    passing = models.ForeignKey(PassingEntry, on_delete=models.SET_NULL, null=True, blank=True)
    bill_no = models.CharField(max_length=50)
    bill_date = models.DateField()
    truck_no = models.CharField(max_length=20)
    lr_no = models.CharField(max_length=50, blank=True, null=True)
    transport_name = models.CharField(max_length=100, blank=True, null=True)
    quantity_bales = models.IntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
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

    class Meta:
        verbose_name = "Delivery"
        verbose_name_plural = "Deliveries"

    def __str__(self):
        return f"Bill #{self.bill_no}"

class BrokerageBill(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    bill_no = models.CharField(max_length=50) # Removed unique=True to allow different tenants to have same bill_no
    bill_date = models.DateField()
    
    # Who are we billing?
    party = models.ForeignKey(PartyMaster, on_delete=models.PROTECT)
    firm = models.ForeignKey(FirmMaster, on_delete=models.PROTECT) # The Broker Firm issuing the bill
    
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
    
    # Payment Tracking
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Brokerage Bill"
        verbose_name_plural = "Brokerage Bills"

    def __str__(self):
        return f"Brokerage Bill #{self.bill_no}"

class PartyPaymentReceipt(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    party = models.ForeignKey(PartyMaster, on_delete=models.PROTECT, related_name='payments')
    receipt_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_mode = models.CharField(max_length=50) # Cash, NEFT, Cheque, RTGS, UPI
    reference_no = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt #{self.id} - {self.party.company_name}"

    class Meta:
        verbose_name = "Payment Receipt"
        verbose_name_plural = "Payment Receipts"

class PaymentAllocation(BaseModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.PROTECT)
    receipt = models.ForeignKey(PartyPaymentReceipt, on_delete=models.PROTECT, related_name='allocations')
    bill = models.ForeignKey(BrokerageBill, on_delete=models.PROTECT, related_name='allocations')
    allocated_amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Allocation: {self.allocated_amount} to Bill {self.bill.bill_no}"

    class Meta:
        verbose_name = "Payment Allocation"
        verbose_name_plural = "Payment Allocations"

class OTPVerification(models.Model):
    email = models.EmailField(unique=True)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"OTP for {self.email}"

class AuditLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        user_display = self.user.username if self.user else "Unknown User"
        return f"{user_display} - {self.action} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"