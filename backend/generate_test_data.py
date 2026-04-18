import os
import sys
import django
import random
from uuid import uuid4
from django.utils import timezone

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
from prescriptions.models import Prescription
from reservations.models import Reservation
from sales.models import Sale

User = get_user_model()

def generate_data():
    print("Enriching database with more test data...")
    
    # 1. Ensure medicines exist
    medicines = Medicine.objects.all()
    if not medicines.exists():
        print("[Error] No medicines found. Please run import_efda.py first!")
        return

    # 2. Add More Diverse Pharmacies
    ADDITIONAL_PHARMACIES = [
        {"name": "Unity Pharmacy", "license_number": "AM-005", "address": "University Main Gate", "lat": 6.0200, "lon": 37.5500},
        {"name": "Sikela Health Care", "license_number": "AM-006", "address": "Sikela Bus Station", "lat": 6.0350, "lon": 37.5450},
        {"name": "Gamo Gofa Meds", "license_number": "AM-007", "address": "City Center, Arba Minch", "lat": 6.0250, "lon": 37.5600},
    ]
    
    pharmacies = list(Pharmacy.objects.all())
    for data in ADDITIONAL_PHARMACIES:
        pharm, created = Pharmacy.objects.get_or_create(
            license_number=data["license_number"],
            defaults={
                "name": data["name"],
                "address": data["address"],
                "location_lat": data["lat"],
                "location_lon": data["lon"],
                "is_active": True,
                "status": "approved"
            }
        )
        if created:
            print(f"Created Pharmacy: {pharm.name}")
            pharmacies.append(pharm)

    # 3. Create Test Patients
    patients = []
    for i in range(1, 6):
        email = f"patient{i}@gmail.com"
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email}
        )
        if created:
            user.set_password("password123")
            user.save()
            print(f"Created Patient User: {email}")
        
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"role": "patient"})
        patients.append(user)

    # 4. Ensure Inventory is stocked for new pharmacies
    for pharm in pharmacies:
        count = Inventory.objects.filter(pharmacy=pharm).count()
        if count < 5: # If empty or low, add random stock
            for med in random.sample(list(medicines), min(len(medicines), 20)):
                Inventory.objects.get_or_create(
                    pharmacy=pharm,
                    medicine=med,
                    defaults={
                        "quantity": random.randint(10, 100),
                        "price": random.uniform(20.0, 450.0)
                    }
                )
            print(f"Stocked {pharm.name} with sample inventory.")

    # 5. Create some Prescriptions
    print("Generating Prescriptions...")
    for patient in patients:
        Prescription.objects.get_or_create(
            user=patient,
            image_url="https://images.sample-scripts.com/prescription_scan.jpg",
            defaults={"status": random.choice(['pending', 'approved'])}
        )

    # 6. Create Reservations & Sales
    print("Generating Reservations and Sales records...")
    for patient in patients:
        pharm = random.choice(pharmacies)
        inv_items = Inventory.objects.filter(pharmacy=pharm, quantity__gt=5)
        
        if inv_items.exists():
            item = random.choice(inv_items)
            res, created = Reservation.objects.get_or_create(
                user=patient,
                inventory_item=item,
                defaults={
                    "pharmacy": pharm,
                    "quantity": random.randint(1, 3),
                    "status": random.choice(['pending', 'active', 'fulfilled'])
                }
            )
            
            # If reservation is fulfilled, create a corresponding Sale record
            if res.status == 'fulfilled':
                Sale.objects.get_or_create(
                    reservation=res,
                    defaults={
                        "pharmacy": pharm,
                        "patient": patient,
                        "medicine": item.medicine,
                        "quantity_sold": res.quantity,
                        "unit_price": item.price,
                        "total_amount": item.price * res.quantity,
                        "sold_at": timezone.now() - timezone.timedelta(days=random.randint(0, 5))
                    }
                )

    print("\nSuccess! Database now has a rich set of data for testing.")

if __name__ == "__main__":
    generate_data()
