from rest_framework import viewsets, permissions
from .models import Prescription
from .serializers import PrescriptionSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Prescription.objects.all()

        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return qs

        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return qs.filter(pharmacy=user.profile.pharmacy)
            return qs.none()

        # Patients
        return qs.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
