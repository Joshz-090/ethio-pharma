# API Design: MedLink Live Endpoint Reference

This document reflects the current Django routes configured in `backend/medlink/urls.py` and app viewsets.

## Base URL
- Local: `http://127.0.0.1:8000`
- Production sample: `https://ethio-pharma.onrender.com`

## Authentication Model
- JWT auth via SimpleJWT
- Most endpoints require `Authorization: Bearer <access_token>`
- Public endpoints:
	- `POST /api/auth/register/`
	- `POST /api/token/`
	- `POST /api/token/refresh/`

## Headers
- JSON request: `Content-Type: application/json`
- Auth request: `Authorization: Bearer <access_token>`

## Endpoint Map

### Auth and Accounts
- `POST /api/auth/register/`
- `POST /api/token/`
- `POST /api/token/refresh/`
- `GET /api/users/profiles/`
- `GET /api/users/profiles/{id}/`

### Pharmacies
- `GET /api/pharmacies/`
- `POST /api/pharmacies/`
- `GET /api/pharmacies/{id}/`
- `PUT /api/pharmacies/{id}/`
- `PATCH /api/pharmacies/{id}/`
- `DELETE /api/pharmacies/{id}/`
- `POST /api/pharmacies/onboard/`

### Medicines and Inventory
- `GET /api/medicines/`
- `POST /api/medicines/`
- `GET /api/medicines/{id}/`
- `PUT /api/medicines/{id}/`
- `PATCH /api/medicines/{id}/`
- `DELETE /api/medicines/{id}/`
- `GET /api/inventory/`
- `POST /api/inventory/`
- `GET /api/inventory/{id}/`
- `PUT /api/inventory/{id}/`
- `PATCH /api/inventory/{id}/`
- `DELETE /api/inventory/{id}/`
- `GET /api/inventory/alerts/`

### Reservations
- `GET /api/reservations/`
- `POST /api/reservations/`
- `GET /api/reservations/{id}/`
- `PUT /api/reservations/{id}/`
- `PATCH /api/reservations/{id}/`
- `DELETE /api/reservations/{id}/`
- `PATCH /api/reservations/{id}/cancel/`
- `PATCH /api/reservations/{id}/fulfill/`

### Prescriptions
- `GET /api/prescriptions/`
- `POST /api/prescriptions/`
- `GET /api/prescriptions/{id}/`
- `PUT /api/prescriptions/{id}/`
- `PATCH /api/prescriptions/{id}/`
- `DELETE /api/prescriptions/{id}/`
- `PATCH /api/prescriptions/{id}/status/`

### Sales and Analytics
- `GET /api/sales/`
- `GET /api/sales/{id}/`
- `POST /api/sales/fulfill-reservation/`
- `GET /api/analytics/daily-sales/`
- `GET /api/analytics/weekly-sales/`

## Focus Endpoint Specs

### 1) Register User
- Method: `POST`
- URL: `/api/auth/register/`
- Headers: `Content-Type: application/json`
- Body:

```json
{
	"email": "patient1@example.com",
	"password": "StrongPass123!",
	"first_name": "Hanan",
	"last_name": "Demo",
	"role": "patient"
}
```

- Example Response (`201`):

```json
{
	"user": {
		"email": "patient1@example.com",
		"first_name": "Hanan",
		"last_name": "Demo"
	},
	"message": "User registered successfully!"
}
```

### 2) Get Inventory
- Method: `GET`
- URL: `/api/inventory/`
- Headers:
	- `Authorization: Bearer <access_token>`
- Optional query:
	- `?search=amoxicillin`
	- `?ordering=price`

- Example Response (`200`, truncated):

```json
[
	{
		"id": "5a89d093-6c7d-4708-b8d0-5f5b4c2fd90d",
		"pharmacy": {
			"id": "28ce8a68-85a5-4903-81cf-f14f76494e6b",
			"name": "Unity Pharmacy",
			"license_number": "AM-005",
			"is_active": true,
			"status": "approved"
		},
		"medicine": {
			"id": "d2f18ab3-8fd5-4cb6-a56a-0bbf7cc51475",
			"name": "Amoxicillin",
			"category": "Antibiotic",
			"requires_prescription": true
		},
		"price": "120.00",
		"quantity": 45
	}
]
```

### 3) Create Reservation
- Method: `POST`
- URL: `/api/reservations/`
- Headers:
	- `Content-Type: application/json`
	- `Authorization: Bearer <access_token>`
- Body:

```json
{
	"inventory_item_id": "5a89d093-6c7d-4708-b8d0-5f5b4c2fd90d",
	"quantity": 2
}
```

- Example Response (`201`, truncated):

```json
{
	"id": "29990bde-1ce8-4318-bf87-3ac99428f6ca",
	"status": "pending",
	"quantity": 2,
	"created_at": "2026-04-19T17:30:25.380266Z",
	"expires_at": "2026-04-19T18:30:25.380272Z",
	"inventory_item": {
		"id": "5a89d093-6c7d-4708-b8d0-5f5b4c2fd90d"
	}
}
```

### 4) Upload Prescription
- Method: `POST`
- URL: `/api/prescriptions/`
- Headers:
	- `Content-Type: application/json`
	- `Authorization: Bearer <access_token>`
- Body:

```json
{
	"image_url": "https://example.com/prescriptions/rx123.jpg"
}
```

- Example Response (`201`, truncated):

```json
{
	"id": "8f2f5f90-39b8-4d58-8cfd-d95d3ac0a8cc",
	"status": "pending",
	"image_url": "https://example.com/prescriptions/rx123.jpg",
	"created_at": "2026-04-19T17:41:11.120384Z",
	"user": {
		"email": "patient1@example.com"
	}
}
```

## cURL Test Commands

```bash
# Register
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
	-H "Content-Type: application/json" \
	-d '{"email":"patient1@example.com","password":"StrongPass123!","first_name":"Hanan","last_name":"Demo","role":"patient"}'

# Token
curl -X POST http://127.0.0.1:8000/api/token/ \
	-H "Content-Type: application/json" \
	-d '{"email":"patient1@example.com","password":"StrongPass123!"}'

# Inventory (replace token)
curl http://127.0.0.1:8000/api/inventory/ \
	-H "Authorization: Bearer <access_token>"
```
