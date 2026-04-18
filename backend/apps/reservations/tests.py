from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from users.models import UserProfile
from pharmacies.models import Pharmacy
from medicines.models import Medicine, Inventory
from reservations.models import Reservation
from reservations.services import create_reservation, cancel_reservation

User = get_user_model()

class ReservationServiceTest(TestCase):
    def setUp(self):
        # Create Patient
        self.patient_user = User.objects.create_user(username='patient', email='patient@test.com', password='pass')
        self.patient_profile, _ = UserProfile.objects.get_or_create(user=self.patient_user)
        self.patient_profile.role = 'patient'
        self.patient_profile.save()

        # Create Pharmacy
        self.pharmacy = Pharmacy.objects.create(name="Arba Minch Central", is_active=True, status='approved')
        
        # Create Medicine
        self.medicine = Medicine.objects.create(name="Amoxicillin", requires_prescription=True)
        
        # Create Inventory
        self.inventory = Inventory.objects.create(
            pharmacy=self.pharmacy,
            medicine=self.medicine,
            quantity=10,
            price=150.0
        )

    def test_create_reservation_success(self):
        # Act
        reservation = create_reservation(self.patient_user, self.inventory.id, 2)
        
        # Assert
        self.assertEqual(reservation.quantity, 2)
        self.assertEqual(reservation.status, 'pending')
        
        # Check stock decrement
        self.inventory.refresh_from_db()
        self.assertEqual(self.inventory.quantity, 8)

    def test_create_reservation_insufficient_stock(self):
        # Act & Assert
        with self.assertRaises(ValidationError) as cm:
            create_reservation(self.patient_user, self.inventory.id, 15)
        
        self.assertIn("Insufficient stock", str(cm.exception))

    def test_cancel_reservation(self):
        # Arrange
        reservation = create_reservation(self.patient_user, self.inventory.id, 3)
        initial_stock = 7 # 10 - 3
        
        # Act
        cancel_reservation(reservation.id, self.patient_user)
        
        # Assert
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 'cancelled')
        
        # Check stock return
        self.inventory.refresh_from_db()
        self.assertEqual(self.inventory.quantity, 10)
