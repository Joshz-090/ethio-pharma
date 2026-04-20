# 🛡️ Ethio-Pharma Backend Core

### Overview
This is the heart of the Ethio-Pharma ecosystem. It is a **multi-tenant Django REST Framework** project designed to handle thousands of pharmacies with strict data isolation.

### 🛠️ Technical Stack
- **Framework**: Django 4.2+ & Django REST Framework
- **Primary Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (SimpleJWT) with multi-tenant claims
- **Isolation**: Custom `PharmacyManager` for logical data partitioning

### 📂 Directory Structure
- `accounts/`: Custom user models supporting roles (Admin, Owner, Cashier) and pharmacy linkage.
- `pharmacies/`: The tenant core. Manages pharmacy profiles, licenses, and subscriptions.
- `inventory/`: 
    - `GlobalMedicine`: Shared Registry for verified medicines (EFDA synced).
    - `Inventory`: Tenant-specific stock records.
- `sales/`: Atomic transaction engine for high-speed POS sales.
- `analytics/`: Data aggregation for AI stock prediction and daily business insights.
- `core/`: Project configuration, URL routing, and security settings.

### 🚀 Developer Setup
1. **Virtual Environment**: 
   ```bash
   python -m venv venv
   source venv/bin/activate # Windows: venv\Scripts\activate
   ```
2. **Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Database Reset & Sync**:
   ```bash
   python reset_db.py           # Required for UUID Migration (Development only)
   python manage.py makemigrations
   python manage.py migrate
   python inventory/scripts/import_efda.py # Import EFDA catalog
   ```
4. **Run Server**:
   ```bash
   python manage.py runserver
   ```

### 📋 Integration Notes
- All endpoints are strictly multi-tenant.
- Use the `X-Pharmacy-ID` header or JWT claims for tenant awareness.
- Precision decimals are used for all currency calculations.
