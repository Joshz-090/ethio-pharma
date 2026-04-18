from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Sale
from .serializers import SaleSerializer
from reservations.models import Reservation
from core.common.permissions import IsPharmacist

class SaleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Only pharmacists and admins can view sales.
    Sales are created automatically when a reservation is fulfilled.
    """
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Sale.objects.all().select_related('medicine', 'pharmacy', 'patient')
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Sale.objects.all().select_related('medicine', 'pharmacy', 'patient')
        if hasattr(user, 'profile') and user.profile.role == 'pharmacist':
            if user.profile.pharmacy:
                return Sale.objects.filter(
                    pharmacy=user.profile.pharmacy
                ).select_related('medicine', 'pharmacy', 'patient')
        return Sale.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[IsPharmacist],
            url_path='fulfill-reservation')
    def fulfill_reservation(self, request):
        """
        POST /api/sales/fulfill-reservation/
        Body: { "reservation_id": UUID }
        
        Pharmacist uses this to:
        1. Mark the reservation as 'fulfilled'
        2. Automatically create a Sale record
        """
        reservation_id = request.data.get('reservation_id')
        if not reservation_id:
            return Response({"error": "reservation_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                reservation = Reservation.objects.select_for_update().get(
                    id=reservation_id,
                    pharmacy=request.user.profile.pharmacy
                )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Reservation not found or does not belong to your pharmacy."},
                status=status.HTTP_404_NOT_FOUND
            )

        if reservation.status not in ['pending', 'active']:
            return Response(
                {"error": f"Cannot fulfill a reservation with status '{reservation.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # 1. Mark reservation as fulfilled
            reservation.status = 'fulfilled'
            reservation.save()

            # 2. Get the inventory item for pricing
            inventory = reservation.inventory_item

            # 3. Create the Sale record
            sale = Sale.objects.create(
                pharmacy=reservation.pharmacy,
                patient=reservation.user,
                reservation=reservation,
                medicine=inventory.medicine,
                quantity_sold=reservation.quantity,
                unit_price=inventory.price,
                total_amount=inventory.price * reservation.quantity
            )

        serializer = self.get_serializer(sale)
        return Response({
            "message": "Reservation fulfilled and sale recorded successfully!",
            "sale": serializer.data
        }, status=status.HTTP_201_CREATED)
