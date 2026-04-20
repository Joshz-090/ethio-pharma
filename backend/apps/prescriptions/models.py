import uuid
from django.db import models
from users.models import User
from pharmacies.models import Pharmacy

class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prescriptions')
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='prescriptions', null=True, blank=True)
    image_url = models.URLField(max_length=500)
    detected_medicines = models.JSONField(default=list, blank=True)  # Store names found by Hanan's AI
    
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription {self.id} for {self.user.email}"
