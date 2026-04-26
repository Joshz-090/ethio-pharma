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
        
        trends["user_recent"] = recent
        
    return trends

def get_admin_dashboard_stats():
    """
    Returns high-level stats for the Admin Dashboard.
    """
    from django.apps import apps
    Pharmacy = apps.get_model('pharmacies', 'Pharmacy')
    User = apps.get_model('users', 'User')
    Sale = apps.get_model('medicines', 'Sale')
    Inventory = apps.get_model('medicines', 'Inventory')
    from django.db.models import Sum
    from datetime import date
    from dateutil.relativedelta import relativedelta

    # 1. Pharmacies
    total_pharmacies = Pharmacy.objects.count()
    active_pharmacies = Pharmacy.objects.filter(is_active=True, status='approved').count()
    pending_pharmacies = Pharmacy.objects.filter(status='pending').count()
    
    # 2. Users
    total_pharmacists = User.objects.filter(profile__role='pharmacist').count()
    
    # 3. Revenue (Current Month)
    start_of_month = date.today().replace(day=1)
    monthly_revenue = Sale.objects.filter(created_at__gte=start_of_month).aggregate(total=Sum('total_price'))['total'] or 0
    total_revenue = Sale.objects.aggregate(total=Sum('total_price'))['total'] or 0
    
    # 4. Inventory
    total_items = Inventory.objects.count()
    
    return {
        "pharmacies": {
            "total": total_pharmacies,
            "active": active_pharmacies,
            "pending": pending_pharmacies,
        },
        "users": {
            "pharmacists": total_pharmacists,
        },
        "revenue": {
            "monthly": float(monthly_revenue),
            "total": float(total_revenue),
        },
        "inventory": {
            "total_items": total_items,
        },
        "system_status": "Healthy",
        "last_updated": date.today().isoformat()
    }
def get_pharmacist_revenue_stats(user):
    """
    Returns revenue analytics for a specific pharmacist's pharmacy.
    """
    from django.apps import apps
    from django.db.models import Sum, F
    from django.utils import timezone
    from datetime import timedelta
    
    Sale = apps.get_model('medicines', 'Sale')
    Inventory = apps.get_model('medicines', 'Inventory')
    
    pharmacy = user.profile.pharmacy
    if not pharmacy:
        return {"error": "User has no pharmacy associated"}
        
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    
    # 1. Today's Revenue
    today_rev = Sale.objects.filter(pharmacy=pharmacy, created_at__gte=today_start).aggregate(total=Sum('total_price'))['total'] or 0
    
    # 2. Today's Sales Count
    today_sales_count = Sale.objects.filter(pharmacy=pharmacy, created_at__gte=today_start).count()
    
    # 3. Weekly & Monthly Revenue
    weekly_rev = Sale.objects.filter(pharmacy=pharmacy, created_at__gte=week_start).aggregate(total=Sum('total_price'))['total'] or 0
    monthly_rev = Sale.objects.filter(pharmacy=pharmacy, created_at__gte=month_start).aggregate(total=Sum('total_price'))['total'] or 0
    
    # 4. Profit Margin Estimation (Today)
    # This assumes we have cost_price on Inventory (which we just added)
    today_sales = Sale.objects.filter(pharmacy=pharmacy, created_at__gte=today_start)
    total_cost = 0
    for sale in today_sales:
        if sale.inventory_item:
            total_cost += sale.inventory_item.cost_price * sale.quantity_sold
            
    today_profit = float(today_rev) - float(total_cost)
    
    # 5. Trends (Daily for last 7 days)
    trends = []
    for i in range(7):
        day = today_start - timedelta(days=i)
        next_day = day + timedelta(days=1)
        day_rev = Sale.objects.filter(pharmacy=pharmacy, created_at__gte=day, created_at__lt=next_day).aggregate(total=Sum('total_price'))['total'] or 0
        trends.append({
            "date": day.strftime("%b %d"),
            "revenue": float(day_rev)
        })
    trends.reverse()
    
    return {
        "today_revenue": float(today_rev),
        "today_sales_count": today_sales_count,
        "today_profit": today_profit,
        "weekly_revenue": float(weekly_rev),
        "monthly_revenue": float(monthly_rev),
        "trends": trends,
        "last_updated": now.isoformat()
    }
