from django.db import models
from django.contrib.auth.models import AbstractUser
from pharmacies.models import Pharmacy

class User(AbstractUser):
    pharmacy = models.ForeignKey(
        Pharmacy, 
        on_delete=models.CASCADE, 
        related_name='staff',
        null=True,
        blank=True
    )
    role = models.CharField(max_length=50, default="admin")

    class Meta:
        verbose_name_plural = "Users"
        indexes = [
            models.Index(fields=['pharmacy']),
        ]

    def __str__(self):
        pharmacy_name = self.pharmacy.name if self.pharmacy else "No Pharmacy"
        return f"{self.username} ({pharmacy_name})"
