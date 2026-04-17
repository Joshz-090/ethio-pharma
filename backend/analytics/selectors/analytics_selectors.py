from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from sales.models import SaleItem
from inventory.models import Inventory

def get_fast_moving_medicines(pharmacy, limit=10):
    """Returns top sold medicines by quantity in the last 30 days."""
    last_30_days = timezone.now() - timedelta(days=30)
    return SaleItem.objects.filter(
        sale__pharmacy=pharmacy,
        sale__created_at__gte=last_30_days
    ).values(
        'inventory_item__medicine__generic_name'
    ).annotate(
        total_sold=Sum('quantity')
    ).order_by('-total_sold')[:limit]

def get_dead_stock(pharmacy):
    """Returns inventory items that haven't had a sale in 30+ days."""
    cutoff_date = timezone.now() - timedelta(days=30)
    
    # 1. Get all inventory items for this pharmacy
    # 2. Exclude those that appear in SaleItems since cutoff_date
    items_with_sales = SaleItem.objects.filter(
        sale__pharmacy=pharmacy,
        sale__created_at__gte=cutoff_date
    ).values_list('inventory_item_id', flat=True)
    
    return Inventory.objects.filter(
        pharmacy=pharmacy
    ).exclude(
        id__in=items_with_sales
    ).filter(
        quantity_on_hand__gt=0,
        created_at__lt=cutoff_date # Only older stock
    )

def get_low_stock_alerts(pharmacy):
    """Returns items where quantity is below min_stock_level."""
    return Inventory.objects.filter(
        pharmacy=pharmacy,
        quantity_on_hand__lte=F('min_stock_level')
    ).select_related('medicine')
