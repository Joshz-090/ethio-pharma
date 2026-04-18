from rest_framework import viewsets, permissions
from .models import Reservation
from .serializers import ReservationSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Reservation.objects.all()

        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return qs

        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return qs.filter(pharmacy=user.profile.pharmacy)
            return qs.none()

        # Patients
        return qs.filter(user=user)

    def perform_create(self, serializer):
        # Additional logic needed later to decrement inventory holding quantities
        serializer.save(user=self.request.user)
