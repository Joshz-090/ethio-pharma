import os
import sys
import django
import random
from uuid import uuid4

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from pharmacies.models import Pharmacy
from medicines.models import Medicine, Inventory
from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()

def generate_data():
    print("🚀 Generating test data for Arba Minch...")
    
    # 1. Ensure medicines exist
    medicines = Medicine.objects.all()
    if not medicines.exists():
        print("❌ No medicines found. Please run import_efda.py first!")
        return

    # 2. Create Pharmacies
    pharmacy_names = ["Arba Minch Sikela Pharmacy", "Secha General Pharmacy", "Abaya Lake Meds", "Nechisar Health Hub"]
    pharmacies = []
    
    for name in pharmacy_names:
        pharmacy, created = Pharmacy.objects.get_or_create(
            name=name,
            defaults={
                "address": f"Main Street, {name.split()[-2]} Sector",
                "phone_number": "+251911000000",
                "is_active": True,
                "status": "approved"
            }
        )
        pharmacies.append(pharmacy)
        if created: print(f"✅ Created Pharmacy: {name}")

    # 3. Create Inventory
    for pharm in pharmacies:
        for med in medicines:
            Inventory.objects.get_or_create(
                pharmacy=pharm,
                medicine=med,
                defaults={
                    "quantity": random.randint(5, 50),
                    "price": random.uniform(50.0, 500.0)
                }
            )
        print(f"📦 Stocked {pharm.name} with all medicines.")

    print("\n✨ Success! Your database is now populated with real-looking data.")
    print("You can now test search and reservations manually.")

if __name__ == "__main__":
    generate_data()
