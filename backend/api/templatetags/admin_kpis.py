import json
from django import template
from api.models import Tenant, CustomUser, BargainEntry, UserSubscription

register = template.Library()

@register.simple_tag
def get_admin_kpis():
    subs = UserSubscription.objects.all()
    active = 0
    expiring = 0
    read_only = 0
    locked_out = 0
    
    for sub in subs:
        st = sub.subscription_status
        if st == 'ACTIVE':
            active += 1
        elif st == 'EXPIRING_WARNING':
            expiring += 1
        elif st == 'READ_ONLY_GRACE':
            read_only += 1
        else:
            locked_out += 1
            
    # Include users without a subscription as locked out
    total_users = CustomUser.objects.filter(is_staff=False).count()
    users_with_subs = subs.count()
    locked_out += (total_users - users_with_subs)
    
    chart_data = {
        'labels': ['Active', 'Expiring Soon', 'Read Only Grace', 'Locked Out'],
        'data': [active, expiring, read_only, locked_out],
        'colors': ['#6366f1', '#f59e0b', '#f97316', '#ef4444']
    }
    
    return {
        'total_tenants': Tenant.objects.count(),
        'active_subs': active,
        'suspended_subs': locked_out,
        'total_users': CustomUser.objects.count(),
        'total_bargains': BargainEntry.objects.count(),
        'chart_data_json': json.dumps(chart_data)
    }
