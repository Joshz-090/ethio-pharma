from django.contrib import admin
from .models import Pharmacy

@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ('name', 'license_number', 'status', 'is_active', 'created_at')
    list_filter = ('status', 'is_active')
    search_fields = ('name', 'license_number')
    actions = ['approve_pharmacies']

    def approve_pharmacies(self, request, queryset):
        queryset.update(status='approved')
    approve_pharmacies.short_description = "Approve selected pharmacies"
