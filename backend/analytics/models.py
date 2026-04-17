from django.db import models
from pharmacies.models import Pharmacy
from inventory.models import GlobalMedicine
from pharmacies.managers import PharmacyManager

class DailyPharmacyInsights(models.Model):
    """Analytics Data Pipe for AI insights"""
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='insights')
    date = models.DateField()
    
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    most_sold_medicine = models.ForeignKey(GlobalMedicine, on_delete=models.SET_NULL, null=True, blank=True)
    
    stockout_risk_count = models.IntegerField(default=0)
    predicted_revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    objects = PharmacyManager()

    class Meta:
        unique_together = ('pharmacy', 'date')
        indexes = [
            models.Index(fields=['pharmacy', 'date']),
        ]

    def __str__(self):
        return f"Insights for {self.pharmacy.name} on {self.date}"
