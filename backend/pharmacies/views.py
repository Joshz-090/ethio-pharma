from rest_framework import viewsets, permissions
from .models import Pharmacy
from .serializers import PharmacySerializer

class PharmacyViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Strict Isolation: User only sees their own pharmacy
        user_pharmacy = self.request.user.pharmacy
        if user_pharmacy:
            # We use filter instead of get to keep it as a queryset
            return Pharmacy.objects.filter(id=user_pharmacy.id)
        return Pharmacy.objects.none()
