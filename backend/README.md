# 🛡️ MedLink Arba Minch: Backend Core

### Overview
This is the heart of the MedLink ecosystem. It is a **multi-tenant Django REST Framework** project designed to handle pharmacies with strict data isolation.

### 🛠️ Technical Stack
- **Framework**: Django 4.2+ & Django REST Framework
- **Primary Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (SimpleJWT)
- **Design Pattern**: Service-Selector Pattern (Decouples logic from database queries).

### 🚀 Developer Setup (Quick Start)
1. **Virtual Environment**: 
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
2. **Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configuration**:
   Copy `.env.example` to `.env` and fill in the Supabase details provided in Telegram.

4. **Initialize Data** (CRITICAL for testing):
   ```bash
   python manage.py migrate
   python apps/medicines/scripts/import_efda.py  # Loads medicine catalog
   python generate_test_data.py                  # Generates fake pharmacies & stock
   ```

5. **Run Server**:
   ```bash
   python manage.py runserver
   ```

### 📡 API Testing
- **Search Inventory**: `GET /api/inventory/`
- **Register User**: `POST /api/auth/register/`
- **Admin Panel**: `http://127.0.0.1:8000/admin/` (User: `admin` / `admin123`)

---

### 👥 Team Contribution
If you change a model, run `python manage.py makemigrations`. **Always pull before you push.**
