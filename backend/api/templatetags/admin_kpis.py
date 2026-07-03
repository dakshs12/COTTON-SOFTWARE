from django import template
from api.models import Tenant, CustomUser, BargainEntry
from django.db.models import Sum

register = template.Library()

@register.simple_tag
def get_admin_kpis():
    return {
        'total_tenants': Tenant.objects.count(),
        'active_subs': Tenant.objects.filter(subscription_status='active').count(),
        'suspended_subs': Tenant.objects.filter(subscription_status__in=['suspended', 'past_due']).count(),
        'total_users': CustomUser.objects.count(),
        'total_bargains': BargainEntry.objects.count(),
    }
