from rest_framework import serializers
from .models import Pharmacy

class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = '__all__'
        read_only_fields = ('created_at',)
