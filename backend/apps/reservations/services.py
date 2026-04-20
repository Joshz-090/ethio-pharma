from django.db import transaction
from django.utils import timezone
from .models import Reservation
from medicines.services.inventory_service import adjust_stock

def create_reservation(user, inventory_item, quantity):
    """
    Creates a reservation and decrements inventory stock.
    """
    with transaction.atomic():
        # 1. Decrement stock (this handles stock validation)
        adjust_stock(inventory_item.id, -quantity)
        
        # 2. Create reservation
        reservation = Reservation.objects.create(
            user=user,
            pharmacy=inventory_item.pharmacy,
            inventory_item=inventory_item,
            quantity=quantity,
            status='pending'
        )
        
    return reservation

def fulfill_reservation(reservation_id):
    """
    Marks a reservation as fulfilled.
    Stock was already decremented at reservation time.
    """
    reservation = Reservation.objects.get(id=reservation_id)
    if reservation.status != 'pending':
        raise ValueError("Only pending reservations can be fulfilled.")
        
    reservation.status = 'fulfilled'
    reservation.save()
    return reservation

def cancel_reservation(reservation_id):
    """
    Cancels a reservation and restores the inventory stock.
    """
    with transaction.atomic():
        reservation = Reservation.objects.select_for_update().get(id=reservation_id)
        if reservation.status != 'pending':
            raise ValueError("Only pending reservations can be cancelled.")
            
        # Restore stock
        adjust_stock(reservation.inventory_item.id, reservation.quantity)
        
        reservation.status = 'cancelled'
        reservation.save()
        
    return reservation
