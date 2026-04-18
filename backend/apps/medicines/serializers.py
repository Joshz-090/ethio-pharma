from rest_framework import serializers
from .models import Medicine, Inventory
from pharmacies.serializers import PharmacySerializer

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)
    pharmacy = PharmacySerializer(read_only=True)
    
    class Meta:
        model = Inventory
        fields = '__all__'
