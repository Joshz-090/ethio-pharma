from django.db.models import Sum
from django.utils import timezone
from sales.models import Sale
from .models import DailyMedicineStats
from pharmacies.models import Pharmacy

def aggregate_daily_medicine_stats(pharmacy_id, date=None):
    """
    Summarizes sales per medicine for a specific pharmacy and date.
    Ensures multi-tenant safety by filtering by pharmacy_id.
    """
    if date is None:
        date = timezone.now().date()

    # Get the pharmacy instance to ensure it exists
    try:
        pharmacy = Pharmacy.objects.get(id=pharmacy_id)
    except Pharmacy.DoesNotExist:
        return

    # Aggregate sales data from the Sale model
    # Note: If Sale model is updated to have separate SaleItem, this logic should be adjusted.
    sales_data = Sale.objects.filter(
        pharmacy=pharmacy,
        created_at__date=date
    ).values('medicine_id').annotate(
        total_qty=Sum('quantity'),
        total_price=Sum('total_price')
    )

    for data in sales_data:
        DailyMedicineStats.objects.update_or_create(
            pharmacy=pharmacy,
            medicine_id=data['medicine_id'],
            date=date,
            defaults={
                'quantity_sold': data['total_qty'],
                'total_revenue': data['total_price']
            }
        )
