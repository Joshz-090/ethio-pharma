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

## 📅 Day 2: Advanced Logic & Analytics (DONE)
1.  **Inventory Alert System**: 
    *   Create an endpoint `GET /api/inventory/alerts/` (Done).
    *   Add `is_low_stock` property to model (Done).
2.  **Prescription Approval Flow**: 
    *   Build status update endpoint (Done).
    *   Link approval to reservation activation (Done).
3.  **Business Intelligence Endpoints**: 
    *   Create `daily-sales` and `weekly-sales` (Done).
    *   Implemented source-of-truth `Sale` model (Done).
4.  **Pharmacy Onboarding**: 
    *   Created `onboard` endpoint for license submissions (Done).

## 📅 Day 3: AI Integration & Final Handover
1.  **AI OCR Data Pipe**:
    *   Create `POST /api/prescriptions/{id}/process-ocr/` for Hanan's AI.
    *   Store extracted medicine names and verify against inventory.
2.  **Notification Hub**:
    *   Create a simple log/notification model to track when a patient is notified of an approval.
    *   Endpoint: `GET /api/users/notifications/`.
3.  **Dynamic Map Data**:
    *   Ensure Arba Minch pharmacies show correct `location_lat/lon` (Done).
    *   Optimize `search` query to filter by name and distance.
4.  **End-to-End Stress Test**:
    *   Verify the full loop with Yadesa (POS) and Misiker (Web):
        *   Patient Search -> Reservation -> Prescription Upload -> Pharmacist Approval -> POS Fulfillment -> Sale Record -> Analytics Update.
5.  **Official Handover**:
    *   Clean up all dev logs.
    *   Ensure `README.md` has the final production URL: `https://ethio-pharma.onrender.com/api/`.
