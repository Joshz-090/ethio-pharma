from django.contrib import admin
from .models import Sale

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'medicine', 'pharmacy', 'patient', 'quantity_sold', 'total_amount', 'sold_at')
    list_filter = ('pharmacy', 'sold_at')
    search_fields = ('medicine__name', 'pharmacy__name', 'patient__email')
    readonly_fields = ('id', 'total_amount', 'sold_at')
