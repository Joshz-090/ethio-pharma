# Ethio-Pharma: Technical Architecture Specification

This document outlines the architectural standards and system design for the Ethio-Pharma ecosystem. All team members must adhere to these patterns to ensure system integrity and multi-tenant security.

---

## 1. High-Level System Design
Ethio-Pharma is a distributed ecosystem consisting of a centralized Django core and specialized client consumers.

### System Components:
- **Core API (The Heart)**: Django/DRF managing multi-tenancy, auth, and business logic.
- **Public Web (The Outreach)**: Next.js portal for medicine discovery.
- **Desktop POS (The Engine)**: Flutter Windows app for pharmaceutical operations.
- **AI Analytics (The Insight)**: Python services for demand prediction and anomaly detection.

---

## 2. Multi-Tenancy Engine
We utilize **Logical Data Isolation**.

- **Isolation Strategy**: Shared Database, Shared Schema.
- **Security Rule**: Every transaction and query *must* be scoped by `pharmacy_id`.
- **Implementation**: Implementation of a `PharmacyManager(models.Manager)` that enforces filtering at the ORM level is mandatory for all tenant-specific models.

---

## 3. Data Strategy
To support global search while maintaining private inventory, we use a two-tier catalog:

1. **Global Registry**: A synchronized catalog of approved medicines in Ethiopia.
2. **Local Inventory**: Pharmacy-specific records (linked to Global Registry) containing Batch IDs, Expiry Dates, and custom pricing.

---

## 4. Development Standards
- **Database**: PostgreSQL (Supabase) as primary; SQLite for local desktop caching.
- **Currency**: Use `DecimalField` for all financial data (VAT, price, discount).
- **Concurrency**: Use `select_for_update()` during stock deductions to prevent racing.
- **Architecture**: Keep business logic in `services/`, not in `views.py`.

---

## 5. Deployment & DevOps
- **Backend**: Koyeb / Render
- **Frontend**: Vercel
- **Database**: Supabase
- **Monitoring**: Sentry
