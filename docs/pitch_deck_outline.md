# MedLink 5-Slide Pitch Deck Outline

Use this structure to create your final Google Slides or PowerPoint.

## Slide 1: The Problem
- In Arba Minch, patients waste time moving pharmacy to pharmacy.
- Medicine stock visibility is low and prescription workflows are slow.
- Impact: treatment delay, transport cost, poor health outcomes.

## Slide 2: The Solution (MedLink)
- Search medicine availability across pharmacies.
- Reserve medicine before traveling.
- Upload prescriptions and receive pharmacist approval.
- Clear user roles: patient, pharmacist, admin.

## Slide 3: Technology
- Backend: Django + DRF + JWT
- Mobile/POS: Flutter
- Web Portal: Next.js (planned/ongoing)
- Database: PostgreSQL (local dev / Supabase cloud)
- Include architecture diagram from `README.md`.

## Slide 4: Team
- Eyasu: Backend APIs and security
- Yadesa: Mobile app implementation
- Misiker: Web dashboard implementation
- Hanan: Documentation, AI strategy, technical storytelling

## Slide 5: Live Demo
- Show live endpoint QR linking to:
  - `https://ethio-pharma.onrender.com/api/`
- Demo flow:
  - Register patient -> search inventory -> reserve -> pharmacist fulfill
- Closing statement:
  - "MedLink makes medicine access faster, safer, and smarter for Arba Minch."
