from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Prescription
from .serializers import PrescriptionSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Admin: All
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Prescription.objects.all().order_by('-created_at')
            
        # Pharmacist: Only those assigned to their pharmacy
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return Prescription.objects.filter(pharmacy=user.profile.pharmacy).order_by('-created_at')
            return Prescription.objects.none()
            
        # Patient: Their own
        return Prescription.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
