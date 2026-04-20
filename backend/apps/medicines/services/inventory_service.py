from django.db import transaction
from medicines.models import Inventory

def adjust_stock(inventory_id: str, quantity: int):
    """
    Adjusts the stock of a specific inventory item.
    Use quantity > 0 to add stock, and quantity < 0 to subtract.
    Uses select_for_update to prevent race conditions.
    """
    with transaction.atomic():
        inventory = Inventory.objects.select_for_update().get(id=inventory_id)
        
        if inventory.quantity + quantity < 0:
            raise ValueError("Insufficient stock for this operation.")
            
        inventory.quantity += quantity
        inventory.save()
        
    return inventory
