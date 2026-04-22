import math
from django.db.models import Q
from medicines.models import Inventory, Medicine

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth."""
    p = math.pi/180
    a = 0.5 - math.cos((lat2-lat1)*p)/2 + math.cos(lat1*p) * math.cos(lat2*p) * (1-math.cos((lon2-lon1)*p))/2
    return 12742 * math.asin(math.sqrt(a)) # 2*R*asin...

def search_medicines_by_sector(query: str, sector: str = None, user_lat: float = None, user_long: float = None):
    """
    Searches for medicines and optionally filters by sector.
    If GPS is provided, sorts by distance using Haversine formula.
    """
    queryset = Inventory.objects.select_related('medicine', 'pharmacy')
    
    if query:
        queryset = queryset.filter(
            Q(medicine__name__icontains=query) |
            Q(medicine__category__icontains=query)
        )
        
    if sector and sector != 'All':
        queryset = queryset.filter(pharmacy__location__sector=sector)
        
    results = list(queryset)

    # Sort by distance if GPS is provided
    if user_lat is not None and user_long is not None:
        for item in results:
            if item.pharmacy.latitude and item.pharmacy.longitude:
                item.distance = haversine_distance(
                    float(user_lat), float(user_long), 
                    float(item.pharmacy.latitude), float(item.pharmacy.longitude)
                )
            else:
                item.distance = 999999 # Far away fallback
        
        results.sort(key=lambda x: x.distance)
    else:
        # Default sort by price
        results.sort(key=lambda x: x.price)
        
    return results

def get_medicine_details(medicine_id: str):
    """
    Fetches detailed info for a specific medicine.
    """
    return Medicine.objects.prefetch_related('inventories__pharmacy').get(id=medicine_id)
