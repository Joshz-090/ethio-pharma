# 🌐 Web Application Plan: Misiker

Misiker, you are building the **MedLink Pharmacy & Admin Portal** using Next.js. This is where Pharmacists manage their business and Admins monitor the system.

## 🚀 Setup Instructions
1. `cd frontend`
2. Run `npx create-next-app@latest ./ --typescript --tailwind --eslint`. (Use these options when asked).
3. `npm install axios framer-motion lucide-react`
4. `npm run dev`

## ✅ Day 1-2 Progress Audit
- [x] Project environment initialized (Next.js + Tailwind).
- [x] Dashboard Shell & Sidebar navigation created.
- [x] API client service (`/services/api.ts`) skeleton built.
- [x] Basic UI components for Stock Tables designed.

## 🎯 Day 3: Search Engine & API Binding (TODAY)
Today we go live. The portal must talk to Eyasu's backend and look beautiful.

1.  **Public Search Engine**:
    *   Build `/app/search/page.tsx`.
    *   Implement a "Sector Toggle" (Sikela/Secha/All).
    *   Display results as cards: `[Medicine Name] - [Price] - [Pharmacy Location]`.
2.  **Reservation Flow**:
    *   A "Reserve Now" button on each medicine card.
    *   Show a countdown timer for the 1-hour hold.
3.  **Real API Integration**:
    *   Switch from mock data to real Axios calls in `/services/api.ts`.
    *   Handle loading states with nice spinners (use Framer Motion).
4.  **Responsive Polish**:
    *   Ensure the site looks "Native" on mobile browsers (judges will check on their phones).

## 📄 Final Deliverables
- [ ] Working "Search by Location" feature.
- [ ] End-to-end Reservation flow (Patient POV).
- [ ] Pharmacist Dashboard showing real-time inventory updates.
