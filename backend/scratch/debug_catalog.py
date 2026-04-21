import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

from medicines.models import Medicine
from medicines.serializers import MedicineSerializer

try:
    print("Testing Medicine.objects.all()...")
    medicines = Medicine.objects.all()
    print(f"Found {medicines.count()} medicines.")
    
    print("Testing MedicineSerializer...")
    serializer = MedicineSerializer(medicines, many=True)
    data = serializer.data
    print("Success! Serializer data generated.")
except Exception as e:
    print(f"FAILED: {str(e)}")
    import traceback
    traceback.print_exc()
