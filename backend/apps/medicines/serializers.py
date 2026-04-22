from rest_framework import serializers
from .models import Medicine, Inventory, Review, Category, Sale
from pharmacies.serializers import PharmacySerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'user_email', 'rating', 'comment', 'likes', 'created_at']

    def get_user_email(self, obj):
        try:
            return obj.user.email
        except AttributeError:
            return "unknown@medlink.com"

class MedicineSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'image_url', 'category', 'description', 'requires_prescription', 'reviews', 'average_rating']

    def get_average_rating(self, obj):
        try:
            reviews = obj.reviews.all()
            if not reviews:
                return 0.0
            total = sum(r.rating for r in reviews if r.rating is not None)
            return round(total / len(reviews), 1)
        except Exception:
            return 0.0

class InventorySerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(read_only=True)
    medicine_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.all(), source='medicine', write_only=True
    )
    pharmacy = PharmacySerializer(read_only=True)
    price = serializers.FloatField()
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventory
        fields = [
            'id', 'price', 'quantity', 'is_available', 'medicine', 'medicine_id', 'pharmacy', 
            'brand', 'strength', 'route', 'expiry_date', 'batch_number'
        ]

    def get_is_available(self, obj):
        return obj.quantity > 0

class SaleSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    medicine_name = serializers.CharField(source='inventory_item.medicine.name', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'pharmacy_name', 'medicine_name', 'quantity_sold', 'total_price', 'created_at']
