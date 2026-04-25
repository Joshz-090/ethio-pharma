import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from medicines.models import Category, Medicine, Inventory
from pharmacies.models import Pharmacy

def seed():
    print("Seeding database...")
    
    # Create categories
    cat_pain, _ = Category.objects.get_or_create(name="Pain Relief")
    cat_antibiotic, _ = Category.objects.get_or_create(name="Antibiotics")
    
    # Create pharmacy
    pharmacy, _ = Pharmacy.objects.get_or_create(name="Ethio-Pharma Main Pharmacy", address="Arba Minch")
    
    # Create medicines
    med1, _ = Medicine.objects.get_or_create(
        name="Paracetamol", 
        defaults={"category": cat_pain, "description": "For pain relief and fever."}
    )
    med2, _ = Medicine.objects.get_or_create(
        name="Amoxicillin", 
        defaults={"category": cat_antibiotic, "description": "Common antibiotic."}
    )
    med3, _ = Medicine.objects.get_or_create(
        name="Ibuprofen", 
        defaults={"category": cat_pain, "description": "Anti-inflammatory pain killer."}
    )
    
    # Create inventory
    Inventory.objects.get_or_create(
        medicine=med1, pharmacy=pharmacy, 
        defaults={"price": 15.00, "quantity": 100}
    )
    Inventory.objects.get_or_create(
        medicine=med2, pharmacy=pharmacy, 
        defaults={"price": 120.00, "quantity": 50}
    )
    Inventory.objects.get_or_create(
        medicine=med3, pharmacy=pharmacy, 
        defaults={"price": 25.00, "quantity": 75}
    )
    
    print("Database seeded successfully with 3 medicines!")

if __name__ == '__main__':
    seed()
