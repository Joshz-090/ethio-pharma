from rest_framework import viewsets, permissions
from .models import Pharmacy
from .serializers import PharmacySerializer
class PharmacyViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacySerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        # Save the pharmacy and mark status as pending
        pharmacy = serializer.save(status='pending')
        
        # Link the pharmacy to the authenticated user's profile
        user = self.request.user
        if hasattr(user, 'profile'):
            user.profile.pharmacy = pharmacy
            user.profile.save()

    def get_queryset(self):
        # Admins or patients can see all active pharmacies
        # Note: We can implement logic so patients only see active pharmacies
        user = self.request.user
        
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Pharmacy.objects.all()
            
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            # Pharmacists can only see their own pharmacy
            if user.profile.pharmacy:
                return Pharmacy.objects.filter(id=user.profile.pharmacy.id)
            return Pharmacy.objects.none()
            
        # Patients
        return Pharmacy.objects.filter(is_active=True, status='approved')
