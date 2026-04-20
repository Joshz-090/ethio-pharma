from rest_framework import serializers
from .models import Medicine, Inventory, Review
from pharmacies.serializers import PharmacySerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_email', 'rating', 'comment', 'likes', 'created_at']

class MedicineSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'category', 'description', 'requires_prescription', 'reviews', 'average_rating']

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return sum(r.rating for r in reviews) / len(reviews)

class InventorySerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)
    pharmacy = PharmacySerializer(read_only=True)
    
    class Meta:
        model = Inventory
        fields = ['id', 'pharmacy', 'medicine', 'price', 'quantity', 'usage_instructions']
