from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from datetime import timedelta
from django.contrib import messages
from unfold.admin import ModelAdmin
from unfold.decorators import action, display

from django import forms
from django.http import HttpResponse
from django.shortcuts import redirect
from unfold.forms import BaseDialogForm

from .models import (
    Tenant, CustomUser, PartyMaster, FirmMaster, BargainEntry, 
    PassingEntry, DeliveryDetails, BrokerageBill, PartyPaymentReceipt, PaymentAllocation,
    UserSubscription, AuditLog
)

def action_redirect_response(request, fallback_url):
    referer = request.META.get('HTTP_REFERER') or fallback_url
    if request.headers.get('HX-Request') or request.META.get('HTTP_HX_REQUEST') == 'true':
        response = HttpResponse()
        response['HX-Redirect'] = referer
        return response
    return redirect(referer)

class ExtendTrialForm(BaseDialogForm):
    days = forms.IntegerField(
        label="Number of Days to Extend",
        initial=7,
        min_value=1,
        max_value=365,
        help_text="Enter the number of trial days to add to this subscription."
    )

# --- Custom Filters ---
class ExpiringSubscriptionFilter(admin.SimpleListFilter):
    title = 'subscription ending soon'
    parameter_name = 'expiring_soon'

    def lookups(self, request, model_admin):
        return (
            ('7_days', 'Next 7 Days'),
        )

    def queryset(self, request, queryset):
        if self.value() == '7_days':
            pass
        return queryset

class TenantUsageFilter(admin.SimpleListFilter):
    title = 'usage level'
    parameter_name = 'usage_level'

    def lookups(self, request, model_admin):
        return (
            ('high', 'High (>100 Deals)'),
            ('low', 'Low (<10 Deals)'),
        )

class SubscriptionStatusFilter(admin.SimpleListFilter):
    title = 'status'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('ACTIVE', 'Active'),
            ('EXPIRING_WARNING', 'Expiring Soon'),
            ('LOCKED_OUT', 'Locked Out'),
        )

    def queryset(self, request, queryset):
        from django.utils import timezone
        from django.db import models
        val = self.value()
        now = timezone.now()
        if val == 'LOCKED_OUT':
            return queryset.filter(models.Q(is_active=False) | models.Q(end_date__lte=now))
        elif val == 'EXPIRING_WARNING':
            from datetime import timedelta
            warning_cutoff = now + timedelta(days=3)
            return queryset.filter(is_active=True, end_date__gt=now, end_date__lte=warning_cutoff)
        elif val == 'ACTIVE':
            from datetime import timedelta
            warning_cutoff = now + timedelta(days=3)
            return queryset.filter(is_active=True, end_date__gt=warning_cutoff)
        return queryset

# --- Admins ---
@admin.register(Tenant)
class TenantAdmin(ModelAdmin):
    list_display = ('company_name', 'status_badge', 'days_left', 'created_at', 'total_deals', 'total_bales')
    list_filter = ('subscription_status', ExpiringSubscriptionFilter)
    search_fields = ('company_name',)
    readonly_fields = ('created_at', 'total_deals', 'total_bales')
    ordering = ('-created_at',)  # Show newest first (Notification for new users)

    @display(description="Status", label={
        "ACTIVE": "success",
        "EXPIRING_WARNING": "warning",
        "LOCKED_OUT": "danger",
    })
    def status_badge(self, obj):
        try:
            return obj.subscription.subscription_status
        except:
            return "LOCKED_OUT"

    def days_left(self, obj):
        try:
            return obj.subscription.days_remaining
        except:
            return 0
    days_left.short_description = "Days Remaining"

    def total_deals(self, obj):
        return BargainEntry.objects.filter(tenant=obj).count()
    total_deals.short_description = "Total Deals"

    def total_bales(self, obj):
        from django.db.models import Sum
        bales = BargainEntry.objects.filter(tenant=obj).aggregate(Sum('bales'))['bales__sum']
        return bales or 0
    total_bales.short_description = "Total Bales"

from .demo_data import generate_demo_data_for_user

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('SaaS Info', {'fields': ('tenant', 'phone_number', 'failed_login_attempts', 'lockout_until')}),
    )
    list_display = ('username', 'email', 'tenant', 'phone_number', 'is_staff')
    list_filter = ('tenant', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'phone_number')
    actions = ['populate_demo_data']
    actions_row = ('populate_demo_data',)

    @action(description="Populate with Demo Data")
    def populate_demo_data(self, request, queryset=None, object_id=None):
        if object_id:
            users = CustomUser.objects.filter(pk=object_id)
        elif queryset is not None:
            users = queryset
        else:
            users = CustomUser.objects.none()

        count = 0
        total_bargains = 0
        for user in users:
            stats = generate_demo_data_for_user(user)
            count += 1
            total_bargains += stats.get('bargains', 0)
        
        self.message_user(
            request,
            f"Successfully generated demo data (parties, deals, passings, deliveries, bills) for {count} user(s) ({total_bargains} bargains created).",
            messages.SUCCESS
        )
        return action_redirect_response(request, '/admin/api/customuser/')

@admin.register(PartyMaster)
class PartyMasterAdmin(ModelAdmin):
    list_display = ('company_name', 'party_code', 'party_type', 'station', 'tenant', 'is_deleted')
    list_filter = ('tenant', 'party_type', 'station', 'is_deleted')
    search_fields = ('company_name', 'party_code', 'station')

@admin.register(BargainEntry)
class BargainEntryAdmin(ModelAdmin):
    list_display = ('smart_deal_id', 'bargain_date', 'seller', 'buyer', 'bales', 'rate', 'status', 'tenant')
    list_filter = ('tenant', 'status', 'is_deleted', 'bargain_date')
    search_fields = ('smart_deal_id', 'seller__company_name', 'buyer__company_name')

@admin.register(FirmMaster)
class FirmMasterAdmin(ModelAdmin):
    list_display = ('firm_name', 'title', 'city', 'state', 'mobile', 'tenant')
    list_filter = ('tenant', 'state')
    search_fields = ('firm_name', 'city', 'state')

@admin.register(PassingEntry)
class PassingEntryAdmin(ModelAdmin):
    list_display = ('bargain', 'approval_date', 'bales', 'lot_no', 'tenant')
    list_filter = ('tenant',)

@admin.register(DeliveryDetails)
class DeliveryDetailsAdmin(ModelAdmin):
    list_display = ('passing', 'bill_no', 'truck_no', 'quantity_bales', 'tenant')
    list_filter = ('tenant',)

@admin.register(BrokerageBill)
class BrokerageBillAdmin(ModelAdmin):
    list_display = ('bill_no', 'bill_date', 'firm', 'party', 'net_amount', 'tenant')
    list_filter = ('tenant', 'bill_date')
    search_fields = ('bill_no', 'party__company_name')

@admin.register(PartyPaymentReceipt)
class PartyPaymentReceiptAdmin(ModelAdmin):
    list_display = ('id', 'receipt_date', 'party', 'amount', 'tenant')
    list_filter = ('tenant', 'receipt_date')

@admin.register(PaymentAllocation)
class PaymentAllocationAdmin(ModelAdmin):
    list_display = ('receipt', 'bill', 'allocated_amount', 'tenant')
    list_filter = ('tenant',)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(ModelAdmin):
    list_display = ('user', 'plan_type', 'start_date', 'end_date', 'status_badge', 'is_active', 'days_left')
    list_filter = (SubscriptionStatusFilter, 'plan_type', 'is_active', 'start_date', 'end_date')
    search_fields = ('user__username', 'user__email', 'user__phone_number')
    
    actions_row = ('approve_renewal', 'extend_trial', 'suspend_account')
    actions_detail = ('approve_renewal', 'extend_trial', 'suspend_account')

    @display(description="Status", label={
        "ACTIVE": "success",
        "EXPIRING_WARNING": "warning",
        "LOCKED_OUT": "danger",
    })
    def status_badge(self, obj):
        return obj.subscription_status

    def days_left(self, obj):
        return obj.days_remaining
    days_left.short_description = "Days Remaining"

    @action(description="Approve 1-Year Renewal")
    def approve_renewal(self, request, object_id=None):
        if object_id:
            sub = UserSubscription.objects.get(pk=object_id)
            sub.end_date = timezone.now() + timedelta(days=365)
            sub.is_active = True
            sub.save()
            messages.success(request, f"Successfully renewed {sub.user.username} for 1 year.")
        return action_redirect_response(request, '/admin/api/usersubscription/')
            
    @action(
        description="Extend Trial",
        dialog={
            "title": "Extend Trial Period",
            "description": "Enter the number of days you would like to extend this user's trial.",
            "form_class": ExtendTrialForm,
            "form_submit_text": "Extend Trial",
        }
    )
    def extend_trial(self, request, form, object_id=None):
        days = form.cleaned_data.get("days", 7)
        if object_id:
            sub = UserSubscription.objects.get(pk=object_id)
            now = timezone.now()
            base_date = max(sub.end_date, now) if sub.end_date else now
            sub.end_date = base_date + timedelta(days=days)
            sub.is_active = True
            sub.save()
            messages.success(
                request,
                f"Successfully extended trial for {sub.user.username} by {days} days (New End Date: {sub.end_date.strftime('%d %b %Y')})."
            )
        return action_redirect_response(request, '/admin/api/usersubscription/')
            
    @action(description="Suspend Account")
    def suspend_account(self, request, object_id=None):
        if object_id:
            sub = UserSubscription.objects.get(pk=object_id)
            sub.is_active = False
            sub.save()
            messages.warning(request, f"Suspended account: {sub.user.username}.")
        return action_redirect_response(request, '/admin/api/usersubscription/')

@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    list_display = ('user', 'action', 'ip_address', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__username', 'action', 'ip_address')
    readonly_fields = ('user', 'action', 'ip_address', 'timestamp', 'details')