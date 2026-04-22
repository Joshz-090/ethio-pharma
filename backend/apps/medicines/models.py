import uuid
from django.db import models
from pharmacies.models import Pharmacy
from users.models import User

class Category(models.Model):
    id = models.CharField(max_length=50, primary_key=True) # e.g., 'cat-001'
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, null=True, blank=True) # e.g., 'bi-pill'
    
    def __str__(self):
        return self.name

class Medicine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicines')
    description = models.TextField(null=True, blank=True)
    requires_prescription = models.BooleanField(default=False)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    
    def __str__(self):
        return self.name

class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='inventory')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='inventories')
    
    # Pricing & Quantity
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    
    # Professional Medical Details
    brand = models.CharField(max_length=255, null=True, blank=True) # e.g., Panadol, GS-Amox
    strength = models.CharField(max_length=50, null=True, blank=True) # e.g., 500mg, 1g
    route = models.CharField(max_length=50, null=True, blank=True)     # e.g., PO, IV/IM, Topical
    frequency = models.CharField(max_length=100, null=True, blank=True) # e.g., BID, TID, PRN
    recommended_duration = models.CharField(max_length=100, null=True, blank=True) # e.g., 5 days
    usage_instructions = models.TextField(null=True, blank=True) 
    
    # Safety & Tracking
    expiry_date = models.DateField(null=True, blank=True)
    manufacture_date = models.DateField(null=True, blank=True)
    batch_number = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return f"{self.medicine.name} ({self.strength}) at {self.pharmacy.name}"

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5) # 1-5 stars
    comment = models.TextField()
    likes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.rating} stars for {self.medicine.name} by {self.user.email}"

class Sale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='sales')
    inventory_item = models.ForeignKey(Inventory, on_delete=models.SET_NULL, null=True, related_name='sales')
    quantity_sold = models.IntegerField()
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity_sold}x sold at {self.pharmacy.name} for {self.total_price}"
