from django.db import models
from pharmacies.models import Pharmacy
from inventory.models import Inventory
from pharmacies.managers import PharmacyManager

class Sale(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='sales')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2) # 15% VAT compliance
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    payment_method = models.CharField(max_length=50, default='Cash') # 'Cash', 'CBE Birr', 'Telebirr'
    cashier_name = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    objects = PharmacyManager()

    def __str__(self):
        return f"Sale {self.id} - {self.pharmacy.name}"

    class Meta:
        indexes = [
            models.Index(fields=['pharmacy']),
            models.Index(fields=['created_at']),
        ]

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    inventory_item = models.ForeignKey(Inventory, on_delete=models.PROTECT, related_name='sold_items')
    
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.inventory_item.medicine.generic_name}"
