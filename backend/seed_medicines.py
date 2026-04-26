import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
sys.path.insert(0, os.path.join(os.getcwd(), 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from medicines.models import Medicine, Category

def seed_medicines():
    # Define Categories
    categories_data = [
        ('antibiotics', 'Antibiotics', 'bi-shield-check'),
        ('pain-relief', 'Pain Relief', 'bi-capsule'),
        ('diabetes', 'Diabetes', 'bi-droplet-half'),
        ('hypertension', 'Hypertension', 'bi-heart-pulse'),
        ('vitamins', 'Vitamins & Supplements', 'bi-flower1'),
        ('gastro', 'Gastrointestinal', 'bi-life-preserver'),
        ('allergy', 'Allergy', 'bi-wind'),
        ('respiratory', 'Respiratory', 'bi-lungs'),
        ('cardiac', 'Cardiac', 'bi-activity'),
        ('steroids', 'Steroids', 'bi-layers'),
    ]

    categories = {}
    for cat_id, name, icon in categories_data:
        cat, created = Category.objects.get_or_create(id=cat_id, defaults={'name': name, 'icon': icon})
        categories[cat_id] = cat
        if created:
            print(f"Created category: {name}")

    # Define Medicines
    medicines_data = [
        # Pain Relief
        ('Paracetamol', 'pain-relief', 'Common pain reliever and fever reducer.', False),
        ('Ibuprofen', 'pain-relief', 'Nonsteroidal anti-inflammatory drug (NSAID).', False),
        ('Diclofenac', 'pain-relief', 'Strong pain reliever for joint pain.', False),
        ('Tramadol', 'pain-relief', 'Opioid pain medication.', True),
        ('Morphine', 'pain-relief', 'Strong opioid medication.', True),
        ('Codeine', 'pain-relief', 'Used to treat mild to moderate pain.', True),
        ('Naproxen', 'pain-relief', 'Long-acting NSAID.', False),
        ('Aspirin', 'pain-relief', 'Pain relief and blood thinner.', False),
        
        # Antibiotics
        ('Amoxicillin', 'antibiotics', 'Broad-spectrum penicillin antibiotic.', True),
        ('Azithromycin', 'antibiotics', 'Used for various bacterial infections.', True),
        ('Ceftriaxone', 'antibiotics', 'Third-generation cephalosporin.', True),
        ('Ciprofloxacin', 'antibiotics', 'Fluoroquinolone antibiotic.', True),
        ('Metronidazole', 'antibiotics', 'Used for anaerobic bacteria and protozoa.', True),
        ('Doxycycline', 'antibiotics', 'Tetracycline antibiotic.', True),
        ('Clarithromycin', 'antibiotics', 'Macrolide antibiotic.', True),
        ('Levofloxacin', 'antibiotics', 'Advanced fluoroquinolone.', True),
        ('Nitrofurantoin', 'antibiotics', 'Specifically for urinary tract infections.', True),
        
        # Diabetes
        ('Metformin', 'diabetes', 'First-line medication for Type 2 Diabetes.', True),
        ('Glibenclamide', 'diabetes', 'Sulfonylurea for blood sugar control.', True),
        ('Insulin Glargine', 'diabetes', 'Long-acting basal insulin.', True),
        ('Sitagliptin', 'diabetes', 'DPP-4 inhibitor.', True),
        ('Empagliflozin', 'diabetes', 'SGLT2 inhibitor.', True),
        ('Pioglitazone', 'diabetes', 'Thiazolidinedione medication.', True),
        ('Glimepiride', 'diabetes', 'Strong blood sugar lowering agent.', True),
        
        # Hypertension / Cardiac
        ('Amlodipine', 'hypertension', 'Calcium channel blocker for high blood pressure.', True),
        ('Metoprolol', 'hypertension', 'Beta-blocker for heart rate and BP.', True),
        ('Furosemide', 'hypertension', 'Loop diuretic (water pill).', True),
        ('Losartan', 'hypertension', 'Angiotensin II receptor blocker (ARB).', True),
        ('Lisinopril', 'hypertension', 'ACE inhibitor.', True),
        ('Hydrochlorothiazide', 'hypertension', 'Thiazide diuretic.', True),
        ('Spironolactone', 'hypertension', 'Potassium-sparing diuretic.', True),
        ('Bisoprolol', 'hypertension', 'Selective beta-1 blocker.', True),
        ('Valsartan', 'hypertension', 'Effective ARB for heart failure.', True),
        ('Atorvastatin', 'cardiac', 'Statins for lowering cholesterol.', True),
        ('Rivaroxaban', 'cardiac', 'New generation blood thinner.', True),
        ('Warfarin', 'cardiac', 'Traditional anticoagulant.', True),
        ('Clopidogrel', 'cardiac', 'Anti-platelet medication.', True),
        
        # Gastrointestinal
        ('Omeprazole', 'gastro', 'Proton pump inhibitor for acid reflux.', False),
        ('Ranitidine', 'gastro', 'H2 blocker for stomach ulcers.', False),
        ('Famotidine', 'gastro', 'Treats GERD and heartburn.', False),
        ('Pantoprazole', 'gastro', 'Strong acid blocker.', True),
        ('Domperidone', 'gastro', 'Anti-nausea and motility agent.', False),
        ('Ondansetron', 'gastro', 'Prevents nausea and vomiting.', True),
        
        # Respiratory / Allergy
        ('Salbutamol', 'respiratory', 'Bronchodilator for asthma relief.', True),
        ('Cetirizine', 'allergy', 'Non-drowsy antihistamine.', False),
        ('Loratadine', 'allergy', 'Long-acting allergy relief.', False),
        ('Montelukast', 'respiratory', 'Leukotriene receptor antagonist.', True),
        
        # Vitamins
        ('Vitamin C', 'vitamins', 'Immune system support.', False),
        ('Vitamin D3', 'vitamins', 'Bone and immune health.', False),
        ('Zinc Sulfate', 'vitamins', 'Essential mineral supplement.', False),
        ('Multivitamin', 'vitamins', 'Comprehensive daily supplement.', False),
        ('Iron Supplement', 'vitamins', 'Treats and prevents anemia.', False),
    ]

    for name, cat_id, desc, req_pres in medicines_data:
        med, created = Medicine.objects.get_or_create(
            name=name,
            defaults={
                'category': categories.get(cat_id),
                'description': desc,
                'requires_prescription': req_pres,
                'image_url': f"https://source.unsplash.com/400x300/?medicine,pill,{name.lower()}"
            }
        )
        if created:
            print(f"Added medicine: {name}")
        else:
            print(f"Medicine already exists: {name}")

    print("\nSeeding completed! 50+ medicines are now in the catalog.")

if __name__ == "__main__":
    seed_medicines()
