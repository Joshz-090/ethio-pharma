from rest_framework import serializers
from .models import Pharmacy

class PharmacySerializer(serializers.ModelSerializer):
    owner_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Pharmacy
        fields = [
            'id', 'name', 'license_number', 'address', 'phone_number', 
            'status', 'is_active', 'owner_email', 'tax_id', 
            'latitude', 'longitude', 'verification_doc', 'payment_receipt',
            'average_rating'
        ]

    def get_owner_email(self, obj):
        try:
            if obj.owner:
                return obj.owner.email
        except Exception:
            pass
        return None
