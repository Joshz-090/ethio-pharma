# Ethio-Pharma: Intelligent Pharmaceutical Ecosystem

## 🇪🇹 The Problem
In Ethiopia, patients manually travel from pharmacy to pharmacy searching for critical medicines, often failing to find them. Conversely, pharmacies struggle with inventory management, VAT compliance, and predicting when to restock.

## 💊 The Solution
Ethio-Pharma is a multi-tenant SaaS platform that connects pharmacies to patients.
1. **Public Portal (Next.js)**: Patients search for medicine and see real-time availability and location.
2. **Pharmacy POS (Flutter Desktop)**: A robust Windows application for inventory, sales, and VAT compliance.
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
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
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

## 📜 Development Rules
1. **Isolation**: Never query models without filtering by `pharmacy`.
2. **Atomic**: All sales must be wrapped in `transaction.atomic`.
3. **Commits**: Use clear messages (e.g., `feat(sales): added VAT calculation`).
