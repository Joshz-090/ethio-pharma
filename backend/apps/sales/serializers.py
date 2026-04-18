from rest_framework import serializers
from .models import Sale

class SaleSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    patient_email = serializers.CharField(source='patient.email', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'pharmacy_name', 'patient_email', 'medicine_name',
            'quantity_sold', 'unit_price', 'total_amount', 'sold_at'
        ]
        read_only_fields = ['id', 'sold_at', 'total_amount']
