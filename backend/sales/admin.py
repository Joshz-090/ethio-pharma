from django.contrib import admin
from .models import Sale, SaleItem

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ('subtotal',)

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'pharmacy', 'total_amount', 'vat_amount', 'payment_method', 'created_at')
    list_filter = ('pharmacy', 'created_at', 'payment_method')
    inlines = [SaleItemInline]
    search_fields = ('id', 'cashier_name')
