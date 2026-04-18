from django.db import transaction
from django.core.exceptions import ValidationError
from medicines.models import Inventory

def update_inventory_stock(pharmacy, medicine_id, quantity_change, price=None):
    """
    Updates or creates stock for a specific medicine in a pharmacy.
    """
    with transaction.atomic():
        inventory, created = Inventory.objects.select_for_update().get_or_create(
            pharmacy=pharmacy,
            medicine_id=medicine_id,
            defaults={'quantity': 0}
        )
        
        inventory.quantity += quantity_change
        
        if inventory.quantity < 0:
            raise ValidationError("Quantity cannot be negative.")
            
        if price is not None:
            inventory.price = price
            
        inventory.save()
        return inventory

def get_low_stock_items(pharmacy, threshold=10):
    """
    Returns items that are below the threshold for a pharmacy.
    """
    return Inventory.objects.filter(pharmacy=pharmacy, quantity__lt=threshold)
