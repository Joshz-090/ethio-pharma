# API Design: MedLink REST Specification

## 👤 Users App
- `POST /api/token/`: Get JWT Access/Refresh tokens.
- `GET /api/users/profile/`: Retrieve current user details and role.

## 💊 Medicines App
- `GET /api/medicines/search/`: Global search with location filtering (`?query=...&lat=...&lon=...`).
- `GET /api/medicines/{id}/`: Detail view (includes prescription requirement flag).

## 📦 Reservations App
- `POST /api/reservations/reserve/`: Create a 60-min hold.
- `PATCH /api/reservations/{id}/cancel/`: Instant cancellation.

## 🏥 Pharmacies App
- `GET /api/pharmacies/nearby/`: List of pharmacies in Arba Minch.
- `POST /api/pharmacies/register/`: Pharmacy self-registration (Pending status).

## 📄 Prescriptions App
- `POST /api/prescriptions/upload/`: Multi-part form for image upload.
- `GET /api/prescriptions/status/`: Check approval state.
