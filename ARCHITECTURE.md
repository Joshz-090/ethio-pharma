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
- **Onboarding**: Pharmacies register and provide registration data (License, GPS). Access is restricted until **Admin Approval** (`status='approved'`).
- **Subscriptions**: The system automatically monitors and controls yearly subscription status via `subscription_expiry`.

---

## 3. Data Strategy
To support global search while maintaining private inventory, we use a two-tier catalog:

1. **Global Registry**: A verified catalog synchronized with the **EFDA (Ethiopian Food & Drug Authority)** database.
2. **Local Inventory**: Pharmacy-specific records.

---

## 4. Development Standards
- **Database**: PostgreSQL (Supabase) as primary.
- **Offline POS**: The Flutter application follows an **Offline-First** architecture. Sales are stored locally on the PC's memory and synced to the cloud whenever an internet connection is available.
- **Currency**: Use `DecimalField` for all prices. (VAT implementation is currently deferred).
- **Architecture**: Keep business logic in `services/`, not in `views.py`.

---

## 5. Deployment & DevOps
- **Backend**: Koyeb / Render
- **Frontend**: Vercel
- **Database**: Supabase
- **Monitoring**: Sentry
