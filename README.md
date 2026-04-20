# MedLink: Arba Minch

[![MedLink](https://img.shields.io/badge/MedLink-Arba%20Minch-2e7d32?style=for-the-badge&logo=leaflet&logoColor=white)](README.md)
[![Backend](https://img.shields.io/badge/API-Django%20REST-092E20?style=for-the-badge&logo=django&logoColor=white)](backend/)
[![Mobile](https://img.shields.io/badge/Mobile-Flutter%203.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)](pos_app/)
[![Data](https://img.shields.io/badge/Data-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](backend/)
[![Docs](https://img.shields.io/badge/Docs-Technical%20Reference-1565C0?style=for-the-badge&logo=readthedocs&logoColor=white)](docs/)

**A pharmaceutical ecosystem for fast medicine discovery, reservation, and prescription handling in Arba Minch.**

MedLink connects patients, pharmacists, and admins through a secure Django REST API, a Flutter mobile app, and a web dashboard for pharmacy operations. The goal is simple: reduce medicine search time, make reservations reliable, and keep prescription handling safe.

## Why MedLink Matters

- Patients can search across pharmacies instead of walking from store to store.
- Pharmacists can manage inventory, reservations, and prescription approvals in one place.
- Admins can monitor system activity and sales with a clean role-based flow.
- The product is designed around a realistic workflow with clear operational value.

## System at a Glance

```mermaid
flowchart LR
    P[Patient - Flutter Mobile] -->|Search / reserve / upload prescription| API[Django REST API]
    W[Pharmacist/Admin - Web Dashboard] -->|Manage stock / approve requests| API
    API --> DB[(PostgreSQL)]

    subgraph Backend Modules
        U[users]
        PH[pharmacies]
        M[medicines]
        R[reservations]
        PR[prescriptions]
        S[sales]
        A[analytics]
    end

    API --> U
    API --> PH
    API --> M
    API --> R
    API --> PR
    API --> S
    API --> A
```

## User Journey Flow

```mermaid
sequenceDiagram
    participant Patient
    participant App as Flutter App
    participant API as Django API
    participant Pharmacy as Pharmacist

    Patient->>App: Search medicine or upload prescription
    App->>API: Send authenticated request
    API->>API: Validate role and inventory availability
    API-->>App: Return search results or reservation status
    App-->>Patient: Show matches and next action
    Pharmacy->>API: Approve prescription or fulfill reservation
    API-->>App: Update patient-facing status
```

## Core Capabilities

- Medicine inventory search across pharmacies
- Reservation holds with expiry windows
- Prescription upload and approval workflow
- Sales tracking for fulfilled reservations
- Analytics endpoints for daily and weekly summaries

## Tech Stack

- Backend: Django 4.2 + Django REST Framework
- Auth: JWT with role-aware permissions
- Database: PostgreSQL locally or in Supabase
- Mobile: Flutter 3.x
- AI/docs prototypes: Python helpers under `docs/ai/`

## Live API Surface

- Register: `POST /api/auth/register/`
- Token: `POST /api/token/`
- Inventory: `GET /api/inventory/`
- Reservations: `POST /api/reservations/`
- Prescriptions: `POST /api/prescriptions/`
- Analytics: `GET /api/analytics/daily-sales/`

For the full API specification, see [docs/api_design.md](docs/api_design.md).

## Demo Flow

1. Register a patient or use a test account.
2. Search medicine availability.
3. Reserve a medicine item.
4. Upload a prescription if the medicine requires one.
5. Approve or fulfill the request from the pharmacist side.
6. Show the updated reservation and sales trail.

## Project Docs

- [docs/setup_guide.md](docs/setup_guide.md)
- [docs/api_design.md](docs/api_design.md)
- [docs/HANAN_TASKS.md](docs/HANAN_TASKS.md)
- [docs/pitch_deck_outline.md](docs/pitch_deck_outline.md)
- [docs/ai/README.md](docs/ai/README.md)

## Local Run

Backend:

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

Flutter app:

```bash
cd pos_app
flutter pub get
flutter run
```

## Presentation Notes

- Keep the demo short and visual.
- Show the problem, the search flow, and the role-based action path.
- Use the documentation links above as your support material.