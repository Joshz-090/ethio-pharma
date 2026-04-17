# Ethio-Pharma: Intelligent Pharmaceutical Ecosystem

## 🇪🇹 The Problem
In Ethiopia, patients manually travel from pharmacy to pharmacy searching for critical medicines, often failing to find them. Conversely, pharmacies struggle with inventory management and predicting when to restock.

## 💊 The Solution
Ethio-Pharma is a multi-tenant SaaS platform that connects pharmacies to patients.
1. **Public Portal (Next.js)**: Patients search for medicine and see real-time availability and location.
2. **Pharmacy POS (Flutter Desktop)**: A robust Windows application for inventory and sales (Offline-First).
3. **Core API (Django)**: A secure, multi-tenant backend managing all data and AI insights.

---

## 🏗️ System Architecture
*   **Multi-Tenancy**: Shared Database, Shared Schema with Logical Isolation (via `pharmacy_id`).
*   **Database**: PostgreSQL (Supabase) for the cloud, SQLite for local Flutter caching.
*   **AI Engine**: Statistical and ML models for stock prediction.

---

## 🛠️ Tech Stack
- **Backend**: Django 4.2+ / DRF
- **Database**: Supabase (PostgreSQL)
- **Web**: Next.js 14+ / Tailwind CSS
- **Desktop**: Flutter 3.x (Windows target)
- **Infrastructure**: Vercel (Web), Koyeb/Render (API), Supabase (DB)

---

## 📂 Project Structure
```text
ethio-pharma/
├── backend/           # Django REST Framework (Dev 1)
├── pos_app/           # Flutter Desktop App (Dev 3)
├── web_portal/        # Next.js Public Site (Dev 2)
├── README.md          # Global Project Guide
├── ARCHITECTURE.md    # Multi-tenancy & System Design
└── TEAM_SPRINT_WEEK.md # 7-Day Sprint Plan
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # For Windows
pip install -r requirements.txt
python reset_db.py           # Required for UUID Migration (Development only)
python manage.py migrate
python inventory/scripts/import_efda.py # Import verified medicine catalog
python manage.py runserver
```

### 2. Desktop Setup (Flutter)
```bash
cd pos_app
flutter pub get
flutter run -d windows
```

### 3. Web Setup (Next.js)
```bash
cd web_portal
npm install
npm run dev
```

---

## 🔑 Key Technical Decisions
- **UUID Primary Keys**: All models use `UUID v4` for IDs to ensure data portability, secure public URLs, and easy merging if we ever move to a distributed/offline-first local DB sync for rural pharmacies.
- **Logical Multi-Tenancy**: We use a `pharmacy` ForeignKey on all tenant-specific models. Data isolation is strictly enforced via a custom `PharmacyManager`.
- **Global Medicine Catalog**: A shared registry of medicines ensures data consistency across the ecosystem, while each pharmacy maintains its own `Inventory` linked to this registry.

## 🏛️ Production Architecture (Team Rules)
All developers must follow these strict architectural rules:
1. **Service Layer Enforcement**: NO business logic is allowed in views. All logic belongs in `services/`.
2. **Selector Pattern**: NO direct `.all()` or complex queries in views. Use `selectors/` for all DB reads.
3. **Strict Isolation**: No tenant model should ever be queried without filtering by `pharmacy`.
4. **Standard Responses**: All API responses must follow the `{ success: bool, data: any, error: string }` format.
5. **Atomic Consistency**: Sales and stock movements must be wrapped in `transaction.atomic`.

---

## 📂 Backend Structure
```text
backend/
├── common/            # Shared exceptions, permissions, utils
├── accounts/          # User & Auth (JWT)
├── pharmacies/        # Tenant management
├── inventory/         # Product catalog & stock
├── sales/             # Transaction engine
└── analytics/         # AI-ready data summaries
```

---

## 📂 Flutter Architecture
```text
lib/
├── core/              # Theme, config, global constants
├── api/               # Dio-based clean API layer
├── models/            # Data entities
├── providers/         # Riverpod state management
├── widgets/           # Reusable UI components
└── screens/           # Feature-specific pages
```

---

## 📈 Analytics & Roadmap (Week 3/4)
- **Dead Stock Detection**: Identifying medicine with 0 sales in 30+ days.
- **Supply Chains Predictions**: Data pipes ready for ML demand forecasting.
- **Multi-Store Dashboard**: Unified view for pharmacy owners.
