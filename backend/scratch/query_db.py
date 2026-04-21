import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()
from users.models import User
from pharmacies.models import Pharmacy

print('--- USERS ---')
for u in User.objects.all():
    role = u.profile.role if hasattr(u, 'profile') else 'Superadmin'
    print(f"User: {u.username} | Role: {role} | Email: {u.email}")

print('\n--- PHARMACIES ---')
for p in Pharmacy.objects.all():
    print(f"Pharmacy: {p.name} | Status: {p.status} | Owner: {p.owner.username}")
