import { ReactNode } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata = {
  title: 'MedLink — Pharmacist Portal',
  description: 'Smart Med Tracker Pharmacist Dashboard — Inventory, Reservations & Analytics for Arba Minch Pharmacies',
};

export default function PharmacistLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
