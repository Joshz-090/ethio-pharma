import os
import sys
import django

# Add the project root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, 'apps'))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from medicines.models import Medicine

def import_efda_data():
    """
    Sample script to import verified medicine data from EFDA (Ethiopian Food & Drug Authority).
    In production, this would parse a CSV or API from EFDA.
    """
    initial_catalog = [
        {
            "name": "Amoxicillin",
            "category": "Antibacterial",
            "description": "Used to treat various bacterial infections.",
            "requires_prescription": True
        },
        {
            "name": "Paracetamol",
            "category": "Analgesic",
            "description": "Pain reliever and fever reducer.",
            "requires_prescription": False
        },
        {
            "name": "Metformin",
            "category": "Antidiabetic",
            "description": "Controls blood sugar levels in type 2 diabetes.",
            "requires_prescription": True
        },
    ]

    for item in initial_catalog:
        Medicine.objects.update_or_create(
            name=item['name'],
            defaults=item
        )
        print(f"Imported/Updated: {item['name']}")

if __name__ == "__main__":
    import_efda_data()
