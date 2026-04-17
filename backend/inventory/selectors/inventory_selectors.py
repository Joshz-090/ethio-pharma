from django.db.models import QuerySet
from inventory.models import Inventory, GlobalMedicine

def inventory_list_selector(pharmacy) -> QuerySet[Inventory]:
    """Returns all inventory items for a specific pharmacy."""
    return Inventory.objects.filter(pharmacy=pharmacy).select_related('medicine')

def inventory_get_selector(pharmacy, inventory_id) -> Inventory:
    """Returns a specific inventory item verified for the given pharmacy."""
    return Inventory.objects.get(id=inventory_id, pharmacy=pharmacy)

def global_medicine_search_selector(query: str) -> QuerySet[GlobalMedicine]:
    """Returns global medicines matching a name or scientific name."""
    if not query:
        return GlobalMedicine.objects.none()
    return GlobalMedicine.objects.filter(generic_name__icontains=query) | \
           GlobalMedicine.objects.filter(scientific_name__icontains=query)
