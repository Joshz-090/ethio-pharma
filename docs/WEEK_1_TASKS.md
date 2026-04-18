# WEEK 1: Detailed Technical Breakdown (Core SaaS + Multi-Tenant Foundation)

**Goal**: Solidify the backend, implement tenant isolation, and enable basic medicine management.

---

### ✅ Day 1: Multi-Tenancy Engine & Middleware (Core Ready)
- **Status**: Core logic (Manager/UUIDs) done. Middleware next.
- **Tasks**:
  1. [DONE] Create custom `PharmacyManager` for logical isolation.
  2. [PENDING] Implement `TenantMiddleware` to extract `pharmacy_id` from JWT.
  3. [DONE] Update `inventory` and `sales` models to use the `PharmacyManager` and `UUID` Primary Keys.
- **Outcome**: `Medicine.objects.all()` only returns medicines for the active pharmacy.

### Day 2: Advanced Account & Auth Setup
- **Focus**: Role-based access.
- **Tasks**:
  1. [TODO] Refine `User` model roles in `accounts/models.py`: `SuperAdmin`, `PharmacyOwner`, `Cashier`.
  2. [TODO] Setup `RegisterPharmacy` endpoint (Automates creation of Pharmacy + Admin User).
  3. [TODO] Implement Login with JWT that includes the `pharmacy_id` in the payload.
- **Outcome**: Secure, multi-tenant authentication.

### ✅ Day 3: Global Catalog vs. Local Stock (Models Mapped)
- **Status**: Models align with `SCHEMA_DESIGN.sql`. Linkage logic next.
- **Tasks**:
  1. [DONE] Separate `GlobalMedicine` (Generic) from `Inventory` (Specific Stock).
  2. [TODO] Create a "linkage" system in `InventoryService` so pharmacies can "Add" a medicine from the global catalog.
  3. [TODO] CRUD endpoints for Pharmacy Inventory in `InventoryViewSet`.
- **Outcome**: Controlled inventory management following the two-tier registry pattern.

---

### ⚠️ IMPORTANT: Database Reset Required
Since we have switched all Primary Keys to **UUID v4** to match the team's production SQL standard, existing migrations must be reset.
1. Clear your local DB or Supabase project.
2. Run `python manage.py makemigrations`.
3. Run `python manage.py migrate`.

---

### Day 4: The Public Search API
... (rest of the file remains similar) ...

### Day 4: The Public Search API
- **Focus**: Web portal backend.
- **Tasks**:
  1. Build a high-performance search endpoint using `django-filter` or `TrigramSimilarity`.
  2. The endpoint must return: Medicine Name + Pharmacy Name + Location + Price + Stock Availability.
  3. Implement Rate Limiting (to prevent scraping).
- **Outcome**: The public can find medicines.

### Day 5: Sales Transaction Engine (The Atomic Core)
- **Focus**: Reliability.
- **Tasks**:
  1. Build the `POST /sales/` endpoint.
  2. Use `transaction.atomic()` to Wrap:
     - Record Sale record.
     - Deduct Inventory quantity.
     - Calculate VAT (15%).
- **Outcome**: No "double-spelling" or inventory drift.

### Day 6: Testing & Validation
- **Focus**: Quality.
- **Tasks**:
  1. Write Unit Tests for the Multi-Tenancy (Ensure User A cannot see Pharmacy B's stock).
  2. Test the Sales endpoint under load (concurrent requests).
  3. Validate VAT calculations.
- **Outcome**: A stable, production-ready core.

### Day 7: Documentation & Handoff
- **Focus**: Team alignment.
- **Tasks**:
  1. Generate Swagger/OpenAPI docs (`drf-spectacular`).
  2. Create a "Postman Collection" for the team to test endpoints.
  3. Brief the Flutter team on the Auth and Inventory flows.
- **Outcome**: Ready for Week 2 (POS).
