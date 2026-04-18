import uuid
from django.db import models
from users.models import User
from pharmacies.models import Pharmacy
from medicines.models import Medicine, Inventory
from reservations.models import Reservation

class Sale(models.Model):
    """
    Records a confirmed financial transaction.
    Created when a pharmacist marks a reservation as 'fulfilled'.
    This is the source of truth for all analytics and reporting.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Links
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='sales')
    patient = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchases')
    reservation = models.OneToOneField(Reservation, on_delete=models.SET_NULL, null=True, blank=True, related_name='sale')
    medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, related_name='sales')

    # Transaction Details
    quantity_sold = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # When did this happen
    sold_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sold_at']

    def __str__(self):
        return f"Sale of {self.quantity_sold}x {self.medicine.name} at {self.pharmacy.name}"

    def save(self, *args, **kwargs):
        # Auto-calculate total if not set
        if not self.total_amount:
            self.total_amount = self.unit_price * self.quantity_sold
        super().save(*args, **kwargs)
