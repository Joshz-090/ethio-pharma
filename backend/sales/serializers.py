from rest_framework import serializers
from .models import Sale, SaleItem

class SaleItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.ReadOnlyField(source='inventory_item.medicine.generic_name')
    
    class Meta:
        model = SaleItem
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('pharmacy', 'created_at', 'total_amount', 'vat_amount')
