# 🛡️ Eyasu: Backend Technical Tasks

## 📅 Day 1: System Core & Deployment (DONE)
1.  **Project Modularization**: Move all apps into an `apps/` directory and update `sys.path` in `settings.py`.
2.  **UUID Implementation**: Update all models to use `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
3.  **Authentication Engine**: 
    *   Set up `AuthViewSet` with `/api/auth/register/` and `/api/auth/login/`.
    *   Configure `SimpleJWT` with 60-minute access tokens.
4.  **Atomic Reservation Service**: 
    *   Create `reservations/services.py` with `create_reservation()` using `transaction.atomic()`.
    *   Implement logic to decrement `Inventory.quantity` during reservation.
5.  **Render Deployment**: Configure `DATABASES` with Supabase credentials and enable `Whitenoise` for static files.

## 📅 Day 2: Advanced Logic & Analytics (TOMORROW)
1.  **Inventory Alert System**: 
    *   Create an endpoint `GET /api/inventory/alerts/` that filters `Inventory` where `quantity < 10`.
    *   Add a `is_low_stock` boolean property to the `Inventory` model.
2.  **Prescription Approval Flow**: 
    *   Build `PATCH /api/prescriptions/{id}/status/` specifically for pharmacists.
    *   Update logic so a `pending` reservation becomes `active` only after prescription approval.
3.  **Business Intelligence Endpoints**: 
    *   Create `GET /api/analytics/daily-sales/` to sum all fulfilled reservations for the current pharmacy.
    *   Use `django.db.models.Sum` and `Count` for high-speed aggregation.
4.  **Security Hardening**: 
    *   Implement `IsPharmacist` and `IsPatient` custom permissions in `core/common/permissions.py`.
    *   Ensure every queryset is filtered by `pharmacy_id` to prevent data leaks.
