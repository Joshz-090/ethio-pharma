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
    print("Generating test data for Arba Minch...")
    
    # 1. Ensure medicines exist
    medicines = Medicine.objects.all()
    if not medicines.exists():
        print("[Error] No medicines found. Please run import_efda.py first!")
        return

    # 2. Create Pharmacies
    PHARMACIES = [
        {
            "name": "Arba Minch Sikela Pharmacy",
            "license_number": "AM-001",
            "address": "Sikela Market Area, Arba Minch",
            "phone_number": "0911223344",
            "location_lat": 6.0329,
            "location_lon": 37.5501
        },
        {
            "name": "Secha General Pharmacy",
            "license_number": "AM-002",
            "address": "Secha Hill, near University Entrance",
            "phone_number": "0911556677",
            "location_lat": 6.0215,
            "location_lon": 37.5582
        },
        {
            "name": "Abaya Lake Meds",
            "license_number": "AM-003",
            "address": "Lake-side Road, Arba Minch",
            "phone_number": "0911889900",
            "location_lat": 6.0450,
            "location_lon": 37.5610
        },
        {
            "name": "Nechisar Health Hub",
            "license_number": "AM-004",
            "address": "Opposite Nechisar Park Entrance",
            "phone_number": "0911001122",
            "location_lat": 6.0150,
            "location_lon": 37.5800
        }
    ]
    
    pharmacies = []
    for data in PHARMACIES:
        pharmacy, created = Pharmacy.objects.get_or_create(
            name=data["name"],
            defaults={
                "license_number": data["license_number"],
                "address": data["address"],
                "phone_number": data["phone_number"],
                "location_lat": data["location_lat"],
                "location_lon": data["location_lon"],
                "is_active": True,
                "status": "approved"
            }
        )
        pharmacies.append(pharmacy)
        if created: print(f"Created Pharmacy: {data['name']}")

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
        print(f"Stocked {pharm.name} with all medicines.")

    print("\nSuccess! Your database is now populated with real-looking data.")
    print("You can now test search and reservations manually.")

if __name__ == "__main__":
    generate_data()
