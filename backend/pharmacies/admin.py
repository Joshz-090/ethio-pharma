from django.contrib import admin
from .models import Pharmacy

@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ('name', 'license_number', 'status', 'subscription_expiry', 'is_active')
    search_fields = ('name', 'license_number')
    list_filter = ('status', 'subscription_plan', 'is_active')
