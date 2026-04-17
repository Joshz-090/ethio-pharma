from django.db import models
from pharmacies.models import Pharmacy
from pharmacies.managers import PharmacyManager

class GlobalMedicine(models.Model):
    """Global Registry: A synchronized catalog of approved medicines in Ethiopia."""
    generic_name = models.CharField(max_length=255)
    scientific_name = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True) # 'Antibiotic', etc.
    dosage_form = models.CharField(max_length=100, null=True, blank=True) # 'Tablet', etc.
    strength = models.CharField(max_length=50, null=True, blank=True) # '500mg'
    manufacturer = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.generic_name} ({self.strength})"

    class Meta:
        verbose_name_plural = "Global Medicines"
        indexes = [
            models.Index(fields=['generic_name']),
        ]

class Inventory(models.Model):
    """Pharmacy Specific Inventory (Tenant Isolated)"""
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='inventory_items')
    medicine = models.ForeignKey(GlobalMedicine, on_delete=models.CASCADE, related_name='stock_at_pharmacies')
    
    custom_name = models.CharField(max_length=255, null=True, blank=True)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    
    quantity_on_hand = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    min_stock_level = models.IntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)

    objects = PharmacyManager()

    class Meta:
        verbose_name_plural = "Inventories"
        indexes = [
            models.Index(fields=['pharmacy']),
            models.Index(fields=['pharmacy', 'medicine']),
        ]

    def __str__(self):
        return f"{self.medicine.generic_name} at {self.pharmacy.name} ({self.quantity_on_hand})"
