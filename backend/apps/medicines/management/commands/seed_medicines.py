from django.core.management.base import BaseCommand
from medicines.models import Medicine

class Command(BaseCommand):
    help = 'Seeds the database with common Ethiopian medicines'

    def handle(self, *args, **kwargs):
        data = [
            {
                "category": "Pain & Inflammation (Analgesics)",
                "medicines": ["Paracetamol", "Ibuprofen", "Diclofenac", "Tramadol", "Aspirin"]
            },
            {
                "category": "Anti-Infectives (Antibiotics/Antifungals)",
                "medicines": ["Amoxicillin", "Ciprofloxacin", "Azithromycin", "Ceftriaxone", "Doxycycline", "Metronidazole"]
            },
            {
                "category": "Diabetes & Endocrine",
                "medicines": ["Metformin", "Glibenclamide", "Insulin (Human)", "Thyroxine"]
            },
            {
                "category": "Cardiovascular (Heart/Blood Pressure)",
                "medicines": ["Amlodipine", "Enalapril", "Hydrochlorothiazide", "Atorvastatin", "Losartan"]
            },
            {
                "category": "Gastrointestinal (Stomach)",
                "medicines": ["Omeprazole", "Aluminum Hydroxide + Magnesium Trisilicate", "Hyoscine", "ORS (Oral Rehydration Salts)"]
            },
            {
                "category": "Respiratory (Asthma/Cough)",
                "medicines": ["Salbutamol", "Beclomethasone", "Guaiacol (Cough Syrup)", "Cetirizine"]
            }
        ]

        count = 0
        for entry in data:
            category = entry["category"]
            for med_name in entry["medicines"]:
                obj, created = Medicine.objects.get_or_create(
                    name=med_name,
                    defaults={'category': category}
                )
                if created:
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f'Added: {med_name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Skipped (exists): {med_name}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully added {count} new medicines!'))
