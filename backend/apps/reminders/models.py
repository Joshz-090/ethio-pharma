from django.db import models
from users.models import User
from medicines.models import Medicine
import uuid

class Reminder(models.Model):
    """Patient dosage schedules"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    medicine_name = models.CharField(max_length=255) # Can be free-text or linked to Medicine
    medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, blank=True)
    
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100) # e.g. "3 times a day"
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reminder for {self.user.email}: {self.medicine_name}"
