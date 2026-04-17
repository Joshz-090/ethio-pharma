# WEEK 1: Detailed Technical Breakdown (Core SaaS + Multi-Tenant Foundation)

**Goal**: Solidify the backend, implement tenant isolation, and enable basic medicine management.

---

### Day 1: Multi-Tenancy Engine & Middleware
- **Focus**: Logical isolation.
- **Tasks**:
  1. Create a custom Django Manager `PharmacyManager` that automatically filters by `pharmacy_id`.
  2. Implement a `TenantMiddleware` that extracts `pharmacy_id` from the JWT or Header.
  3. Update `inventory` and `sales` models to use the `PharmacyManager`.
- **Outcome**: `Medicine.objects.all()` only returns medicines for the active pharmacy.

### Day 2: Advanced Account & Auth Setup
- **Focus**: Role-based access.
- **Tasks**:
  1. Refine `User` model roles: `SuperAdmin`, `PharmacyOwner`, `Cashier`.
  2. Setup `RegisterPharmacy` endpoint (Automates creation of Pharmacy + Admin User).
  3. Implement Login with JWT that includes the `pharmacy_id` in the payload.
- **Outcome**: Secure, multi-tenant authentication.

### Day 3: Global Catalog vs. Local Stock
- **Focus**: Data structure.
- **Tasks**:
  1. Separate `GlobalMedicine` (Generic name, scientific name) from `Inventory` (Batch, Expiry, Price).
  2. Create a "linkage" system so pharmacies can "Add" a medicine from the global catalog to their local stock.
  3. Basic CRUD endpoints for Pharmacy Inventory.
- **Outcome**: Controlled inventory management.

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
