import math
from django.db.models import Q
from medicines.models import Inventory, Medicine

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth."""
    p = math.pi/180
    a = 0.5 - math.cos((lat2-lat1)*p)/2 + math.cos(lat1*p) * math.cos(lat2*p) * (1-math.cos((lon2-lon1)*p))/2
    return 12742 * math.asin(math.sqrt(a)) # 2*R*asin...

from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from analytics.models import SearchHistory

def get_cached_trends():
    """Cache trending queries for 5 minutes to improve performance."""
    trends = cache.get('trending_queries')
    if trends is None:
        three_days_ago = timezone.now() - timedelta(days=3)
        # Get top 20 trending query strings
        trends = list(SearchHistory.objects.filter(
            created_at__gte=three_days_ago
        ).values_list('query', flat=True).distinct()[:20])
        cache.set('trending_queries', trends, 300) # 5 minutes
    return trends

def search_medicines_by_sector(query: str, sector: str = None, user_lat: float = None, user_long: float = None, user=None):
    """
    Highly optimized search with caching and efficient ranking.
    """
    queryset = Inventory.objects.select_related('medicine', 'pharmacy')
    
    if query:
        queryset = queryset.filter(
            Q(medicine__name__icontains=query) |
            Q(medicine__category__icontains=query) |
            Q(brand__icontains=query)
        )
        
    if sector and sector != 'All':
        queryset = queryset.filter(pharmacy__location__sector=sector)
        
    # Use only required fields to speed up list conversion
    results = list(queryset)

    # --- Fast Trend & History Lookup ---
    trending_queries = set(q.lower() for q in get_cached_trends())
    
    user_history_queries = set()
    if user and user.is_authenticated:
        # Cache user history for 1 minute
        cache_key = f'user_history_{user.id}'
        user_history_queries = cache.get(cache_key)
        if user_history_queries is None:
            user_history_queries = set(q.lower() for q in SearchHistory.objects.filter(
                user=user
            ).values_list('query', flat=True)[:50])
            cache.set(cache_key, user_history_queries, 60)

    # --- High Speed Ranking Logic ---
    u_lat = float(user_lat) if user_lat else None
    u_long = float(user_long) if user_long else None

    for item in results:
        rank_score = 0
        med_name = item.medicine.name.lower()
        
        # 1. Personal History Boost
        if any(h_q in med_name for h_q in user_history_queries):
            rank_score += 100
        
        # 2. Trending Boost
        if any(t_q in med_name for t_q in trending_queries):
            rank_score += 50

        # 3. Fast Distance Calculation
        distance = 0
        if u_lat is not None and u_long is not None:
            p_lat = item.pharmacy.latitude
            p_long = item.pharmacy.longitude
            if p_lat and p_long:
                distance = haversine_distance(u_lat, u_long, float(p_lat), float(p_long))
            else:
                distance = 1000
        
        item.distance = distance
        item.rank_score = rank_score - (distance * 2)

    # Sort descending by rank score
    results.sort(key=lambda x: x.rank_score, reverse=True)
    return results

def get_medicine_details(medicine_id: str):
    """
    Fetches detailed info for a specific medicine.
    """
    return Medicine.objects.prefetch_related('inventories__pharmacy').get(id=medicine_id)
