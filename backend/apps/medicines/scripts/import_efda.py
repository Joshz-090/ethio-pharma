import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from inventory.models import GlobalMedicine

def import_efda_data():
    """
    Sample script to import verified medicine data from EFDA (Ethiopian Food & Drug Authority).
    In production, this would parse a CSV or API from EFDA.
    """
    initial_catalog = [
        {
            "generic_name": "Amoxicillin",
            "scientific_name": "Amoxicillinum",
            "category": "Antibacterial",
            "dosage_form": "Capsule",
            "strength": "500mg"
        },
        {
            "generic_name": "Paracetamol",
            "scientific_name": "Paracetamolum",
            "category": "Analgesic",
            "dosage_form": "Tablet",
            "strength": "500mg"
        },
        {
            "generic_name": "Metformin",
            "scientific_name": "Metforminum",
            "category": "Antidiabetic",
            "dosage_form": "Tablet",
            "strength": "850mg"
        },
    ]

    for item in initial_catalog:
        GlobalMedicine.objects.update_or_create(
            generic_name=item['generic_name'],
            strength=item['strength'],
            defaults=item
        )
        print(f"Imported/Updated: {item['generic_name']}")

if __name__ == "__main__":
    import_efda_data()
