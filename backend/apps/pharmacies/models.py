import uuid
from django.db import models

class Pharmacy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    
    subscription_plan = models.CharField(max_length=50, default='free') # 'free', 'pro', 'enterprise'
    subscription_expiry = models.DateField(null=True, blank=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    is_active = models.BooleanField(default=True)
    
    # New Fields for Advanced Management
    owner = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_pharmacies')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    verification_doc = models.URLField(max_length=500, null=True, blank=True)
    payment_receipt = models.URLField(max_length=500, null=True, blank=True)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    opening_hours = models.JSONField(null=True, blank=True) # Format: [{"day": "Monday", "open": "08:00", "close": "20:00"}]
    last_inventory_sync = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_subscription_valid(self):
        from datetime import date
        if self.status != 'approved':
            return False
        if self.subscription_expiry and self.subscription_expiry < date.today():
            return False
        return True

    class Meta:
        verbose_name_plural = "Pharmacies"

    def __str__(self):
        return f"{self.name} ({self.license_number})"

class PharmacyLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.OneToOneField(Pharmacy, on_delete=models.CASCADE, related_name='location')
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    SECTOR_CHOICES = [
        ('Sikela', 'Sikela'),
        ('Secha', 'Secha'),
        ('Other', 'Other'),
    ]
    sector = models.CharField(max_length=50, choices=SECTOR_CHOICES, default='Sikela')
    
    def __str__(self):
        return f"Location for {self.pharmacy.name} ({self.sector})"
