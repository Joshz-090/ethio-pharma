# Reservation & Booking Module

## 📝 Responsibilities
- Handling user reservations (Hold) for specific medicines.
- Auto-expiring holds after 2 hours.
- Tracking fulfilled vs. cancelled reservations.

## 📊 Models
- `Reservation`: Link between Patient, Pharmacy, and Inventory item. Includes status (Pending, Fulfilled, Expired) and timestamp.

## 🛠️ To-Implement (1-Week Goal)
- [ ] Create reservation logic (checks stock first).
- [ ] Auto-expiry background task (simple logic).
- [ ] Status updates interface for Pharmacists.
