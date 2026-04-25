from rest_framework import serializers
from .models import User, UserProfile
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']

class UserProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    is_active = serializers.BooleanField(source='user.is_active', required=False)
    date_joined = serializers.ReadOnlyField(source='user.date_joined')
    
    pharmacy_status = serializers.ReadOnlyField(source='pharmacy.status')
    subscription_tier = serializers.ReadOnlyField(source='pharmacy.subscription_tier')
    days_until_expiry = serializers.ReadOnlyField(source='pharmacy.days_until_expiry')
    is_subscription_valid = serializers.ReadOnlyField(source='pharmacy.is_subscription_valid')
    needs_subscription_warning = serializers.ReadOnlyField(source='pharmacy.needs_warning')
    warning_sent = serializers.ReadOnlyField(source='pharmacy.warning_sent')
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_details', 'role', 'language', 'pharmacy', 
            'pharmacy_status', 'subscription_tier', 'days_until_expiry',
            'is_subscription_valid', 'needs_subscription_warning', 'warning_sent',
            'phone_number', 'username', 'email', 'is_active', 'date_joined'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        is_active = user_data.get('is_active')
        
        if is_active is not None:
            instance.user.is_active = is_active
            instance.user.save()
            
        return super().update(instance, validated_data)

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='patient')
    phone_number = serializers.CharField(max_length=20, required=False)
    pharmacy_id = serializers.UUIDField(required=False)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'patient')
        phone_number = validated_data.pop('phone_number', '')
        pharmacy_id = validated_data.pop('pharmacy_id', None)
        
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        
        UserProfile.objects.create(
            user=user,
            role=role,
            phone_number=phone_number,
            pharmacy_id=pharmacy_id
        )
        
        return user
