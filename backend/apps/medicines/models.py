import uuid
from django.db import models
from pharmacies.models import Pharmacy
from users.models import User

class Medicine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    requires_prescription = models.BooleanField(default=False)  # MUST-HAVE
    
    def __str__(self):
        return self.name

class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='inventory')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='inventories')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    
    @property
    def is_low_stock(self):
        return self.quantity < 10
    
    def __str__(self):
        return f"{self.medicine.name} at {self.pharmacy.name}"
