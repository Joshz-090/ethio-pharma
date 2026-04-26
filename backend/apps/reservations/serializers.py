from rest_framework import serializers
from .models import Reservation
from users.serializers import UserSerializer
from medicines.serializers import InventorySerializer

class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    inventory_item = InventorySerializer(read_only=True)
    patient_name = serializers.SerializerMethodField()
    patient_phone = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'pharmacy', 'inventory_item', 'quantity', 
            'created_at', 'expires_at', 'status', 'patient_name', 'patient_phone'
        ]
        read_only_fields = ['status', 'created_at', 'expires_at']

    def get_patient_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username

    def get_patient_phone(self, obj):
        try:
            return obj.user.profile.phone_number
        except Exception:
            return "N/A"
