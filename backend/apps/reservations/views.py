from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer
from .services import create_reservation, fulfill_reservation, cancel_reservation
from core.common.permissions import IsAdmin, IsPharmacist, IsPatient

class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Reservation.objects.all()

        if IsAdmin().has_permission(self.request, self):
            return qs

        if IsPharmacist().has_permission(self.request, self):
            if user.profile.pharmacy:
                return qs.filter(pharmacy=user.profile.pharmacy)
            return qs.none()

        # Patients
        return qs.filter(user=user)

    def create(self, request, *args, **kwargs):
        """
        Atomic reservation creation. Decrements stock instantly.
        """
        inventory_item_id = request.data.get('inventory_item')
        quantity = int(request.data.get('quantity', 1))
        
        from medicines.models import Inventory
        try:
            inventory_item = Inventory.objects.get(id=inventory_item_id)
            reservation = create_reservation(
                user=request.user,
                inventory_item=inventory_item,
                quantity=quantity
            )
            serializer = self.get_serializer(reservation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsPharmacist])
    def fulfill(self, request, pk=None):
        """Pharmacist marks reservation as picked up."""
        try:
            reservation = fulfill_reservation(pk)
            return Response({"status": "fulfilled"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Patient or Pharmacist cancels reservation. Restores stock."""
        try:
            reservation = cancel_reservation(pk)
            return Response({"status": "cancelled"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
