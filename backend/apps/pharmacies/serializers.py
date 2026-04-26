from rest_framework import serializers
from .models import Pharmacy

class PharmacySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(required=False, allow_null=True)
    owner_email = serializers.SerializerMethodField()
    contact_phone = serializers.ReadOnlyField(source='phone_number')
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Pharmacy
        fields = [
            'id', 'name', 'license_number', 'address', 'phone_number', 
            'status', 'is_active', 'owner_name', 'contact_phone', 'owner_email', 'tax_id', 
            'latitude', 'longitude', 'verification_doc', 'payment_receipt',
            'average_rating', 'created_at', 'subscription_tier', 
            'subscription_expiry', 'trial_expiry', 'days_until_expiry', 'needs_warning',
            'is_subscription_valid', 'warning_sent'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Ensure owner_name is populated from the User model
        if instance.owner:
            ret['owner_name'] = f"{instance.owner.first_name} {instance.owner.last_name}".strip() or instance.owner.username
        return ret

    def update(self, instance, validated_data):
        owner_name = validated_data.pop('owner_name', None)
        pharmacy = super().update(instance, validated_data)
        
        if owner_name and pharmacy.owner:
            names = owner_name.strip().split(' ', 1)
            pharmacy.owner.first_name = names[0] if len(names) > 0 else ''
            pharmacy.owner.last_name = names[1] if len(names) > 1 else ''
            pharmacy.owner.save()
            
        return pharmacy

    def get_owner_email(self, obj):
        try:
            if obj.owner:
                return obj.owner.email
        except Exception:
            pass
        return None
