from rest_framework import viewsets, permissions
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

    def perform_create(self, serializer):
        # Create the pharmacy with pending status
        pharmacy = serializer.save(status='pending', is_active=True)
        
        # Automatically link this pharmacy to the Pharmacist's profile
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            profile = user.profile
            profile.pharmacy = pharmacy
            profile.save()
