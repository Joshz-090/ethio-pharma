from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Pharmacy
from .serializers import PharmacySerializer

class PharmacyViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Pharmacy.objects.all()
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return Pharmacy.objects.filter(id=user.profile.pharmacy.id)
            return Pharmacy.objects.none()
        return Pharmacy.objects.filter(is_active=True, status='approved')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        if not request.user.profile.role == 'admin':
            return Response({"detail": "Only admins can approve pharmacies."}, status=status.HTTP_403_FORBIDDEN)
            
        pharmacy = self.get_object()
        pharmacy.status = 'approved'
        pharmacy.is_active = True
        pharmacy.save()
        
        # Activate the owner
        if pharmacy.owner:
            pharmacy.owner.is_active = True
            pharmacy.owner.save()
            
        return Response({"message": f"Pharmacy {pharmacy.name} approved and owner activated."})

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def apply(self, request):
        import json
        from users.models import User, UserProfile
        from django.contrib.auth.hashers import make_password
        from django.db import transaction

        data = request.data
        
        try:
            with transaction.atomic():
                # 1. Create the User (Inactive until approved)
                user = User.objects.create(
                    username=data.get('username'),
                    email=data.get('email'),
                    password=make_password(data.get('password')),
                    is_active=False 
                )
                
                # 2. Parse opening_hours
                opening_hours = data.get('opening_hours')
                if isinstance(opening_hours, str):
                    try:
                        opening_hours = json.loads(opening_hours)
                    except:
                        opening_hours = None

                # 3. Create the Pharmacy
                pharmacy = Pharmacy.objects.create(
                    name=data.get('name'),
                    license_number=data.get('license_number'),
                    phone_number=data.get('phone_number'),
                    address=data.get('address'),
                    tax_id=data.get('tax_id'),
                    latitude=data.get('latitude') if data.get('latitude') else None,
                    longitude=data.get('longitude') if data.get('longitude') else None,
                    opening_hours=opening_hours,
                    verification_doc=data.get('verification_doc'),
                    payment_receipt=data.get('payment_receipt'),
                    subscription_plan=data.get('subscription_plan', 'basic'),
                    status='pending',
                    owner=user
                )

                # 4. Create User Profile
                UserProfile.objects.create(
                    user=user,
                    role='pharmacist',
                    pharmacy=pharmacy,
                    phone_number=data.get('phone_number')
                )

                return Response({
                    "message": "Application submitted successfully. Waiting for admin approval.",
                    "pharmacy_id": pharmacy.id
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        # Default perform_create for admin actions
        serializer.save(status='pending', is_active=True)

