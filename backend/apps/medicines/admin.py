from django.contrib import admin
from .models import Medicine, Inventory

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'requires_prescription')
    list_filter = ('category', 'requires_prescription')
    search_fields = ('name',)

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('pharmacy', 'medicine', 'quantity', 'price')
    list_filter = ('pharmacy',)
    search_fields = ('medicine__name', 'pharmacy__name')
