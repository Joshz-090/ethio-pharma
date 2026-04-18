# 🛠️ Backend Development Plan: Eyasu

Eyasu, the core infrastructure is now ready with Django + Supabase (PostgreSQL). Your job is to finish the internal logic (Services) so the apps can talk.

## 🚀 Setup Instructions
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. Create `.env` based on `.env.example` (Get Supabase credentials from your team).
6. `python manage.py migrate`
7. `python manage.py runserver`

## 🎯 Your Coding Tasks for Today
You MUST follow the **Service-Selector Pattern**:
*   **Users & Auth**: Implement `services.py` in the `users` app to handle user registration vs pharmacist association. 
*   **Reservations (COMPLEX)**: Implement the logic in `reservations/services.py` so that when a patient reserves a medicine:
    *   It checks if stock > quantity.
    *   It creates the reservation and sets an expiry in 60 minutes.
    *   It *decrements* the stock count temporarily.
*   **Prescriptions**: Ensure the `prescriptions/views.py` allows image URL uploads.

## 📄 Key Files to Work On
- `apps/reservations/services.py`
- `apps/medicines/services/inventory_service.py`
- `apps/users/views.py` (Finish the Profile registration logic)

## 📡 Deliverable
Confirm that `GET /api/inventory/` and `POST /api/reservations/` work on your local machine using Postman.
