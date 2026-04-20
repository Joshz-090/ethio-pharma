"""
Run this once on the server to create the MedLink admin superuser.

From the backend directory, run:
    python create_admin.py
Or via Render shell:
    python manage.py shell < create_admin.py
"""
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'MedLink@2026'
ADMIN_EMAIL    = 'admin@medlink.am'

if User.objects.filter(username=ADMIN_USERNAME).exists():
    print(f'[!] Admin user "{ADMIN_USERNAME}" already exists. Skipping.')
else:
    User.objects.create_superuser(
        username=ADMIN_USERNAME,
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
    )
    print(f'[✓] Admin created: username="{ADMIN_USERNAME}"  password="{ADMIN_PASSWORD}"')
