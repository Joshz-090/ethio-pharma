from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import Reservation
from .serializers import ReservationSerializer
from .services import create_reservation, cancel_reservation
from core.common.permissions import IsPatient

class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Reservation.objects.all().order_by('-created_at')

        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return qs

        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return qs.filter(pharmacy=user.profile.pharmacy)
            return qs.none()

        # Patients see their own
        return qs.filter(user=user)

    def create(self, request, *args, **kwargs):
        """
        Custom create to use our atomic service.
        Expects: {'inventory_item_id': UUID, 'quantity': INT}
        """
        user = request.user
        inventory_id = request.data.get('inventory_item_id')
        qty = int(request.data.get('quantity', 1))

        try:
            reservation = create_reservation(user, inventory_id, qty)
            serializer = self.get_serializer(reservation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_VALUE)
        except Exception as e:
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """
        Endpoint: /api/reservations/{id}/cancel/
        """
        try:
            reservation = cancel_reservation(pk, request.user)
            return Response({"status": "Reservation cancelled successfully."})
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_VALUE)
