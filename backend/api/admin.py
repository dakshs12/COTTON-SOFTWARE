from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from datetime import timedelta
from .models import (
    Tenant, CustomUser, PartyMaster, FirmMaster, BargainEntry, 
    PassingEntry, DeliveryDetails, BrokerageBill, PartyPaymentReceipt, PaymentAllocation
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
            # Assuming we add an `end_date` to Tenant. For now we filter on active but maybe add logic here later.
            # Dodo might not give an end date, just a status, but if we have one we can filter.
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

    def queryset(self, request, queryset):
        # Could annotate and filter if we needed
        return queryset

# --- Admins ---
@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'subscription_status', 'dodo_customer_id', 'created_at', 'total_deals', 'total_bales')
    list_filter = ('subscription_status', ExpiringSubscriptionFilter)
    search_fields = ('company_name', 'dodo_customer_id')
    readonly_fields = ('created_at', 'total_deals', 'total_bales')

    def total_deals(self, obj):
        return BargainEntry.objects.filter(tenant=obj).count()
    total_deals.short_description = "Total Deals"

    def total_bales(self, obj):
        from django.db.models import Sum
        bales = BargainEntry.objects.filter(tenant=obj).aggregate(Sum('bales'))['bales__sum']
        return bales or 0
    total_bales.short_description = "Total Bales"

    def changelist_view(self, request, extra_context=None):
        from django.db.models import Sum
        total_brokers = Tenant.objects.count()
        active = Tenant.objects.filter(subscription_status='active').count()
        suspended = Tenant.objects.filter(subscription_status__in=['suspended', 'past_due']).count()
        total_bales_platform = BargainEntry.objects.aggregate(Sum('bales'))['bales__sum'] or 0

        extra_context = extra_context or {}
        extra_context['custom_kpis'] = {
            'total_brokers': total_brokers,
            'active_subs': active,
            'suspended_subs': suspended,
            'total_bales': total_bales_platform
        }
        return super().changelist_view(request, extra_context=extra_context)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('SaaS Info', {'fields': ('tenant',)}),
    )
    list_display = ('username', 'email', 'tenant', 'is_staff')
    list_filter = ('tenant', 'is_staff', 'is_superuser')

# Registering Business Models (Just basic registration for now, to ensure they show up)
@admin.register(PartyMaster)
class PartyMasterAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'party_type', 'tenant', 'is_deleted')
    list_filter = ('tenant', 'party_type', 'is_deleted')

@admin.register(BargainEntry)
class BargainEntryAdmin(admin.ModelAdmin):
    list_display = ('smart_deal_id', 'seller', 'buyer', 'bales', 'rate', 'tenant', 'is_deleted')
    list_filter = ('tenant', 'status', 'is_deleted')

admin.site.register(FirmMaster)
admin.site.register(PassingEntry)
admin.site.register(DeliveryDetails)
admin.site.register(BrokerageBill)
admin.site.register(PartyPaymentReceipt)
admin.site.register(PaymentAllocation)