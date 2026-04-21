import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from users.models import User
from pharmacies.models import Pharmacy

with open('scratch/out.txt', 'w') as f:
    f.write("=============================\n")
    f.write("           USERS             \n")
    f.write("=============================\n")
    for u in reversed(User.objects.all().order_by('-pk')):
        try:
            role = u.profile.role
        except Exception:
            role = 'Superadmin/No Profile'
            
        f.write(f"Username: {u.username}\n")
        f.write(f"Role: {role}\n")
        f.write(f"Email: {u.email}\n")
        f.write("-----------------------------\n")

    f.write("\n=============================\n")
    f.write("        PHARMACIES           \n")
    f.write("=============================\n")
    for p in reversed(Pharmacy.objects.all().order_by('-created_at')):
        f.write(f"Name: {p.name}\n")
        f.write(f"Status: {p.status}\n")
        f.write(f"Plan: {p.subscription_plan}\n")
        staff = [prof.user.username for prof in p.staff_profiles.all()]
        f.write(f"Staff linked: {', '.join(staff) if staff else 'None'}\n")
        f.write("-----------------------------\n")
