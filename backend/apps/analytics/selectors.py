from django.db.models import Count
from analytics.models import SearchHistory

def get_personalized_trends(user=None, limit=5):
    """
    Returns both Global Trending medicines and the User's Recent Searches.
    """
    trends = {
        "global_trending": [],
        "user_recent": []
    }
    
    # 1. Global Trending (Top searches by everyone)
    global_qs = SearchHistory.objects.values('query').annotate(
        count=Count('query')
    ).order_by('-count')[:limit]
    trends["global_trending"] = [item['query'].title() for item in global_qs]
    
    # 2. User Recent (Last few unique searches by this user)
    if user and user.is_authenticated:
        user_qs = SearchHistory.objects.filter(user=user).values('query').order_by('-created_at')
        seen = set()
        recent = []
        for item in user_qs:
            name = item['query'].title()
            if name not in seen:
                recent.append(name)
                seen.add(name)
            if len(recent) >= limit:
                break
        trends["user_recent"] = recent
        
    return trends
