import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.urls import get_resolver
resolver = get_resolver()
for url in resolver.url_patterns:
    if hasattr(url, 'url_patterns'):
        for sub_url in url.url_patterns:
            print(sub_url)
    else:
        print(url)
