from django.contrib import admin
from .models import GlobalMedicine, Inventory

@admin.register(GlobalMedicine)
class GlobalMedicineAdmin(admin.ModelAdmin):
    list_display = ('generic_name', 'scientific_name', 'strength', 'category')
    search_fields = ('generic_name', 'scientific_name')

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('medicine', 'quantity_on_hand', 'unit_price', 'pharmacy', 'expiry_date')
    list_filter = ('pharmacy', 'expiry_date')
    search_fields = ('medicine__generic_name', 'custom_name', 'batch_number')
