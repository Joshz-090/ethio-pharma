from django.contrib import admin
from .models import DailyPharmacyInsights

@admin.register(DailyPharmacyInsights)
class DailyPharmacyInsightsAdmin(admin.ModelAdmin):
    list_display = ('pharmacy', 'date', 'total_sales', 'most_sold_medicine', 'stockout_risk_count')
    list_filter = ('pharmacy', 'date')
    readonly_fields = ('created_at',)
