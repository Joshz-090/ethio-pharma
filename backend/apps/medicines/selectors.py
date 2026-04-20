from django.db.models import Q
from medicines.models import Inventory, Medicine

def search_medicines_by_sector(query: str, sector: str = None):
    """
    Searches for medicines by name and optionally filters by sector (Sikela/Secha).
    Returns a queryset of Inventory items that match the search.
    """
    queryset = Inventory.objects.select_related('medicine', 'pharmacy', 'pharmacy__location')
    
    if query:
        queryset = queryset.filter(
            Q(medicine__name__icontains=query) |
            Q(medicine__category__icontains=query)
        )
        
    if sector and sector != 'All':
        queryset = queryset.filter(pharmacy__location__sector=sector)
        
    return queryset.order_by('price')

def get_medicine_details(medicine_id: str):
    """
    Fetches detailed info for a specific medicine.
    """
    return Medicine.objects.prefetch_related('inventories__pharmacy').get(id=medicine_id)
