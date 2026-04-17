from django.db import models

class Pharmacy(models.Model):
    name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    
    # Location for patient search
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    subscription_plan = models.CharField(max_length=50, default='free') # 'free', 'pro', 'enterprise'
    is_active = models.BooleanField(default=True)
    
    # Legacy fields (keep for now or migrate)
    owner_name = models.CharField(max_length=255, blank=True)
    owner_phone = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Pharmacies"

    def __str__(self):
        return f"{self.name} ({self.license_number})"
