from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Reservation
from medicines.models import Inventory

def create_reservation(user, inventory_item_id, quantity):
    """
    Atomically creates a reservation and updates inventory.
    """
    with transaction.atomic():
        try:
            inventory = Inventory.objects.select_for_update().get(id=inventory_item_id)
        except Inventory.DoesNotExist:
            raise ValidationError("Inventory item not found.")

        # 1. Validation: Enough stock?
        if inventory.quantity < quantity:
            raise ValidationError(f"Insufficient stock for {inventory.medicine.name}. Only {inventory.quantity} left.")

        # 2. Validation: Pharmacy active?
        if not inventory.pharmacy.is_active or inventory.pharmacy.status != 'approved':
             raise ValidationError("This pharmacy is currently not taking orders.")

        # 3. Validation: User profile check
        if user.profile.role != 'patient':
            raise ValidationError("Only patients can make reservations.")

        # 4. Create Reservation
        reservation = Reservation.objects.create(
            user=user,
            pharmacy=inventory.pharmacy,
            inventory_item=inventory,
            quantity=quantity,
            status='pending'
        )

        # 5. Decrement Stock (Atomic)
        inventory.quantity -= quantity
        inventory.save()

        return reservation

def cancel_reservation(reservation_id, user):
    """
    Cancels a reservation and returns stock to inventory.
    """
    with transaction.atomic():
        try:
            reservation = Reservation.objects.select_for_update().get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError("Reservation not found.")

        # Only owner or admin can cancel
        if reservation.user != user and user.profile.role != 'admin':
             raise ValidationError("You do not have permission to cancel this reservation.")

        if reservation.status != 'pending':
            raise ValidationError(f"Cannot cancel a reservation that is already {reservation.status}.")

        # Update Status
        reservation.status = 'cancelled'
        reservation.save()

        # Return stock
        inventory = reservation.inventory_item
        inventory.quantity += reservation.quantity
        inventory.save()

        return reservation
