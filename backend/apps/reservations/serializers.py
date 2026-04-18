from rest_framework import serializers
from .models import Reservation
from users.serializers import UserSerializer
from medicines.serializers import InventorySerializer

class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    inventory_item = InventorySerializer(read_only=True)
    
    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'expires_at']
