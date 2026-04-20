from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from .models import SearchHistory, DailyPharmacyInsights

def log_search(query: str, user=None, sector: str = None):
    """
    Logs a user search query for trend analysis.
    """
    return SearchHistory.objects.create(query=query, user=user, sector=sector)

def get_top_searched_medicines(sector: str = None, days: int = 7):
    """
    Returns the top medicines searched in a specific sector or overall.
    Useful for AI demand prediction.
    """
    start_date = timezone.now() - timedelta(days=days)
    queryset = SearchHistory.objects.filter(created_at__gte=start_date)
    
    if sector and sector != 'All':
        queryset = queryset.filter(sector=sector)
        
    return queryset.values('query').annotate(search_count=Count('query')).order_by('-search_count')

def generate_daily_insights(pharmacy):
    """
    Stub for daily insight generation (Sales, stockout risks).
    To be expanded with real transaction data.
    """
    today = timezone.now().date()
    insights, created = DailyPharmacyInsights.objects.get_or_create(
        pharmacy=pharmacy,
        date=today
    )
    return insights
