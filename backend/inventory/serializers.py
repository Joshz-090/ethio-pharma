from rest_framework import serializers
from .models import GlobalMedicine, Inventory

class GlobalMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalMedicine
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    medicine_name = serializers.ReadOnlyField(source='medicine.generic_name')
    medicine_detail = GlobalMedicineSerializer(source='medicine', read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'
        read_only_fields = ('pharmacy',)
