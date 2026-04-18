import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from pharmacies.models import Pharmacy

class User(AbstractUser):
    """
    Base User model using UUIDs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username

class UserProfile(models.Model):
    """
    Extended profile for Roles and Pharmacy association.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Arba Minch Roles: 'patient', 'pharmacist', 'admin'
    ROLE_CHOICES = [
        ('patient', 'Patient'),
        ('pharmacist', 'Pharmacist'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    
    # Localization
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('am', 'Amharic'),
    ]
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    
    # Pharmacy association (Only for Pharmacists/Admins)
    pharmacy = models.ForeignKey(
        Pharmacy, 
        on_delete=models.SET_NULL, 
        related_name='staff_profiles',
        null=True,
        blank=True
    )
    
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.role})"

