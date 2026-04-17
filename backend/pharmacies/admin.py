from django.contrib import admin
from .models import Pharmacy

@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_name', 'owner_phone', 'created_at')
    search_fields = ('name', 'owner_name')
