from rest_framework import serializers
from .models import Prescription
from users.serializers import UserSerializer
from pharmacies.serializers import PharmacySerializer

class PrescriptionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    pharmacy = PharmacySerializer(read_only=True)
    
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['status', 'created_at']
