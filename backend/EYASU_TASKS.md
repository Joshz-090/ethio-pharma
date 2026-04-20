# 🦁 Eyasu's Backend Roadmap — Final Phase

This document tracks the final technical requirements for the Ethio-Pharma Production Backend.

## ✅ Completed Tasks (The Foundation)
- [x] **Architecture**: Implemented Service-Selector pattern across all apps.
- [x] **Inventory**: Atomic stock management with `select_for_update()`.
- [x] **Reservations**: 60-min holding logic with restorative cancellation.
- [x] **Localization**: Sector-based search for Sikela/Secha (Arba Minch).
- [x] **Security**: Full RBAC (Pharmacist, Patient, Admin roles).
- [x] **Docs**: Automated OpenAPI 3.0 schema and Swagger UI (`/api/docs/`).

## 🚀 Priority 1: Advanced Business Logic (Immediate Next)
- [ ] **AI Insights API**: Build a prediction endpoint `GET /api/analytics/predict/` to calculate demand based on historic search fails.
- [ ] **Notification Engine**: Integration with SMS gateway (AfricasTalking/Twilio) for reservation confirmation.
- [ ] **Rate Limiting**: Implementation of DRF Throttling to prevent inventory spam.

## 🧠 Priority 2: AI & Pipeline Integration
- [ ] **OCR Prescriptions**: Data pipeline to handle uploaded images and extract medicine metadata.
- [ ] **Admin Global Dashboard**: Aggregate cross-pharmacy revenue and stock alerts for the SaaS owner.
- [ ] **Cache Layer**: Redis integration for high-traffic medicine searches.

## ☁️ Priority 3: Deployment & DevOps
- [ ] **Static Assets**: Configure WhiteNoise or S3 for production asset serving.
- [ ] **Database Optimization**: Connection pooling (already started via Supabase/pgBouncer).
- [ ] **CI/CD**: Setup GitHub Actions for automated testing and deployment.

---

### 📝 Notes for Integration:
- **Frontend (Misiker)**: Point the portal to the new reservation fulfillment endpoints.
- **AI (Hanan)**: The `SearchHistory` model is now live; start pulling data for the demand predictor.
- **Mobile (Eyasu/Team)**: Ensure the JWT Auth endpoint is using the production-ready `users` model.
