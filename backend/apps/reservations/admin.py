from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'inventory_item', 'quantity', 'status', 'expires_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'inventory__medicine__name')
