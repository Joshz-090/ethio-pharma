# 🚩 PROJECT HANDOVER: Ethio-Pharma Sprint

**Context for the AI Agent:**
You are working on Ethio-Pharma, an intelligent pharmaceutical ecosystem for the Ethiopian market. The goal is to finish the MVP in **1 week** with a team of 4 developers.

## 🏗️ System Overview
- **Structure**: Monorepo with `backend/` (Django), `pos_app/` (Flutter Desktop), and `web_portal/` (Next.js).
- **Core Principle**: Logical Multi-tenancy. No query or transaction should happen without a `pharmacy_id` filter.
- **Strategic Goal**: Connect patients searching for medicine (Web) to pharmacy inventory (POS) via a centralized API (Backend).

## 📂 Key Documents to Read
1. **README.md**: Infrastructure, setup, and team roles.
2. **ARCHITECTURE.md**: Deep dive into the data isolation and catalog strategy.
3. **TEAM_SPRINT_WEEK.md**: The 7-day roadmap.
4. **WINDSURF_SYSTEM_PROMPT.md**: Fundamental coding rules (Atomic sales, Decimal math, Multi-tenant Managers).

## 🎯 Current Status
- Backend core is initiated.
- Flutter POS is built but needs multi-tenant API integration.
- Next.js Web Portal is at the boilerplate stage.
- Documentation and Sprint Plan are finalized.

**Next Immediate Task**: Assist the user in re-aligning the Django models with the `GlobalMedicine` and `Inventory` separation defined in the architecture.
