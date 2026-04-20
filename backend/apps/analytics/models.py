from django.db import models
from pharmacies.models import Pharmacy
from medicines.models import Medicine
import uuid

class SearchHistory(models.Model):
    """Logs every search for AI demand analysis"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.CharField(max_length=255)
    sector = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Search Histories"

class DailyPharmacyInsights(models.Model):
    """Analytics Data Pipe for AI insights"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='insights')
    date = models.DateField()
    
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    most_sold_medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, blank=True)
    
    stockout_risk_count = models.IntegerField(default=0)
    predicted_revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('pharmacy', 'date')
        indexes = [
            models.Index(fields=['pharmacy', 'date']),
        ]

    def __str__(self):
        return f"Insights for {self.pharmacy.name} on {self.date}"
