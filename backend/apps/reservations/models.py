import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta
from users.models import User
from pharmacies.models import Pharmacy
from medicines.models import Inventory

class Reservation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='reservations')
    inventory_item = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('fulfilled', 'Fulfilled'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # 60 min expiry
            self.expires_at = timezone.now() + timedelta(minutes=60)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reservation {self.id} for {self.user.email}"
