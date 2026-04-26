// ============================================================
// MOCK DATA — Smart Med Tracker Pharmacist Dashboard
// Realistic data for Arba Minch, Ethiopia context
// ============================================================

export type ReservationStatus = 'pending' | 'fulfilled' | 'expired' | 'cancelled';
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon';

export interface InventoryItem {
  id: string;
  medicineName: string;
  genericName: string;
  category: string;
  dosageForm: string;
  quantityOnHand: number;
  unitPrice: number;
  costPrice?: number;
  reorderLevel?: number;
  expiryDate: string;
  batchNumber: string;
  isAvailable: boolean;
  isOcrVerified?: boolean;
  status: InventoryStatus;
}

export interface Reservation {
  id: string;
  patientCode: string; // anonymized e.g. PAT-0042
  patientName?: string;
  patientPhone?: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string;
}

export interface DailyReservationStat {
  date: string;
  pending: number;
  fulfilled: number;
  expired: number;
}

export interface MedicinePopularity {
  name: string;
  reservations: number;
  searches: number;
}

export interface CategorySplit {
  name: string;
  value: number;
  color: string;
}

export interface ExpiryTimeline {
  period: string;
  count: number;
}

export interface RevenueStat {
  date: string;
  revenue: number;
  cumulative: number;
}

// ---- INVENTORY ----
export const mockInventory: InventoryItem[] = [
  { id: 'inv-001', medicineName: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Painkiller', dosageForm: 'Tablet', quantityOnHand: 320, unitPrice: 4.50, expiryDate: '2026-12-01', batchNumber: 'BCH-2024-001', isAvailable: true, status: 'in_stock' },
  { id: 'inv-002', medicineName: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', dosageForm: 'Capsule', quantityOnHand: 7, unitPrice: 12.00, expiryDate: '2026-09-15', batchNumber: 'BCH-2024-002', isAvailable: true, status: 'low_stock' },
  { id: 'inv-003', medicineName: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', dosageForm: 'Tablet', quantityOnHand: 150, unitPrice: 8.75, expiryDate: '2027-03-20', batchNumber: 'BCH-2024-003', isAvailable: true, status: 'in_stock' },
  { id: 'inv-004', medicineName: 'ORS Sachet', genericName: 'Oral Rehydration Salts', category: 'Hydration', dosageForm: 'Powder', quantityOnHand: 0, unitPrice: 3.00, expiryDate: '2026-06-30', batchNumber: 'BCH-2024-004', isAvailable: false, status: 'out_of_stock' },
  { id: 'inv-005', medicineName: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Painkiller', dosageForm: 'Tablet', quantityOnHand: 5, unitPrice: 6.00, expiryDate: '2025-12-01', batchNumber: 'BCH-2024-005', isAvailable: true, status: 'expiring_soon' },
  { id: 'inv-006', medicineName: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastric', dosageForm: 'Capsule', quantityOnHand: 88, unitPrice: 15.00, expiryDate: '2027-01-10', batchNumber: 'BCH-2024-006', isAvailable: true, status: 'in_stock' },
  { id: 'inv-007', medicineName: 'Chloroquine 250mg', genericName: 'Chloroquine', category: 'Antimalarial', dosageForm: 'Tablet', quantityOnHand: 200, unitPrice: 9.00, expiryDate: '2027-05-18', batchNumber: 'BCH-2024-007', isAvailable: true, status: 'in_stock' },
  { id: 'inv-008', medicineName: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', category: 'Vitamin', dosageForm: 'Tablet', quantityOnHand: 8, unitPrice: 2.50, expiryDate: '2026-08-01', batchNumber: 'BCH-2024-008', isAvailable: true, status: 'low_stock' },
  { id: 'inv-009', medicineName: 'Insulin Glargine', genericName: 'Insulin', category: 'Diabetes', dosageForm: 'Injection', quantityOnHand: 22, unitPrice: 180.00, expiryDate: '2026-11-30', batchNumber: 'BCH-2024-009', isAvailable: true, status: 'in_stock' },
  { id: 'inv-010', medicineName: 'Doxycycline 100mg', genericName: 'Doxycycline', category: 'Antibiotic', dosageForm: 'Capsule', quantityOnHand: 3, unitPrice: 18.00, expiryDate: '2025-11-15', batchNumber: 'BCH-2024-010', isAvailable: true, status: 'expiring_soon' },
  { id: 'inv-011', medicineName: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Respiratory', dosageForm: 'Inhaler', quantityOnHand: 14, unitPrice: 95.00, expiryDate: '2027-02-28', batchNumber: 'BCH-2024-011', isAvailable: true, status: 'in_stock' },
  { id: 'inv-012', medicineName: 'Ferrous Sulfate', genericName: 'Iron Supplement', category: 'Vitamin', dosageForm: 'Tablet', quantityOnHand: 120, unitPrice: 3.50, expiryDate: '2027-06-01', batchNumber: 'BCH-2024-012', isAvailable: true, status: 'in_stock' },
];

// ---- RESERVATIONS ----
const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

export const mockReservations: Reservation[] = [
  { id: 'res-001', patientCode: 'PAT-0042', patientName: 'Abebe Bikila', patientPhone: '0911223344', medicineName: 'Paracetamol 500mg', quantity: 2, unitPrice: 4.50, status: 'pending', reservedAt: hoursAgo(1), expiresAt: hoursFromNow(1) },
  { id: 'res-002', patientCode: 'PAT-0119', patientName: 'Mulugeta Tesfaye', patientPhone: '0922334455', medicineName: 'Amoxicillin 250mg', quantity: 1, unitPrice: 12.00, status: 'pending', reservedAt: hoursAgo(0.5), expiresAt: hoursFromNow(1.5) },
  { id: 'res-003', patientCode: 'PAT-0007', patientName: 'Tadesse Lemma', patientPhone: '0933445566', medicineName: 'Metformin 500mg', quantity: 3, unitPrice: 8.75, status: 'fulfilled', reservedAt: hoursAgo(5), expiresAt: hoursAgo(3) },
  { id: 'res-004', patientCode: 'PAT-0088', patientName: 'Chala Beyene', patientPhone: '0944556677', medicineName: 'Chloroquine 250mg', quantity: 1, unitPrice: 9.00, status: 'fulfilled', reservedAt: hoursAgo(8), expiresAt: hoursAgo(6) },
  { id: 'res-005', patientCode: 'PAT-0033', patientName: 'Hirut Melaku', patientPhone: '0955667788', medicineName: 'Ibuprofen 400mg', quantity: 2, unitPrice: 6.00, status: 'expired', reservedAt: hoursAgo(10), expiresAt: hoursAgo(8) },
  { id: 'res-006', patientCode: 'PAT-0211', patientName: 'Almaz Ayana', patientPhone: '0911998877', medicineName: 'Vitamin C 500mg', quantity: 5, unitPrice: 2.50, status: 'pending', reservedAt: hoursAgo(0.2), expiresAt: hoursFromNow(1.8) },
  { id: 'res-007', patientCode: 'PAT-0055', patientName: 'Kebede Balcha', patientPhone: '0922110099', medicineName: 'Omeprazole 20mg', quantity: 1, unitPrice: 15.00, status: 'cancelled', reservedAt: hoursAgo(6), expiresAt: hoursAgo(4) },
  { id: 'res-008', patientCode: 'PAT-0099', patientName: 'Senait Giday', patientPhone: '0933442211', medicineName: 'Insulin Glargine', quantity: 1, unitPrice: 180.00, status: 'pending', reservedAt: hoursAgo(0.3), expiresAt: hoursFromNow(1.7) },
  { id: 'res-009', patientCode: 'PAT-0144', patientName: 'Derartu Tulu', patientPhone: '0911224466', medicineName: 'Salbutamol Inhaler', quantity: 1, unitPrice: 95.00, status: 'fulfilled', reservedAt: hoursAgo(12), expiresAt: hoursAgo(10) },
  { id: 'res-010', patientCode: 'PAT-0066', patientName: 'Kenenisa Bekele', patientPhone: '0922335577', medicineName: 'Doxycycline 100mg', quantity: 2, unitPrice: 18.00, status: 'expired', reservedAt: hoursAgo(14), expiresAt: hoursAgo(12) },
];

// ---- ANALYTICS ----
export const mockDailyReservations: DailyReservationStat[] = [
  { date: 'Apr 12', pending: 3, fulfilled: 8, expired: 2 },
  { date: 'Apr 13', pending: 5, fulfilled: 11, expired: 1 },
  { date: 'Apr 14', pending: 2, fulfilled: 14, expired: 3 },
  { date: 'Apr 15', pending: 7, fulfilled: 9, expired: 0 },
  { date: 'Apr 16', pending: 4, fulfilled: 16, expired: 2 },
  { date: 'Apr 17', pending: 6, fulfilled: 12, expired: 1 },
  { date: 'Apr 18', pending: 4, fulfilled: 7, expired: 0 },
];

export const mockMedicinePopularity: MedicinePopularity[] = [
  { name: 'Paracetamol', reservations: 42, searches: 120 },
  { name: 'Amoxicillin', reservations: 35, searches: 98 },
  { name: 'Chloroquine', reservations: 28, searches: 85 },
  { name: 'Metformin', reservations: 22, searches: 67 },
  { name: 'Insulin', reservations: 18, searches: 54 },
];

export const mockCategorySplit: CategorySplit[] = [
  { name: 'Painkiller', value: 28, color: '#0ea5e9' },
  { name: 'Antibiotic', value: 22, color: '#14b8a6' },
  { name: 'Diabetes', value: 18, color: '#6366f1' },
  { name: 'Antimalarial', value: 15, color: '#f59e0b' },
  { name: 'Vitamin', value: 10, color: '#22c55e' },
  { name: 'Other', value: 7, color: '#94a3b8' },
];

export const mockExpiryTimeline: ExpiryTimeline[] = [
  { period: '≤ 30 days', count: 3 },
  { period: '31-60 days', count: 2 },
  { period: '61-90 days', count: 5 },
  { period: '> 90 days', count: 8 },
];

export const mockRevenueTrend: RevenueStat[] = [
  { date: 'Apr 12', revenue: 480, cumulative: 480 },
  { date: 'Apr 13', revenue: 720, cumulative: 1200 },
  { date: 'Apr 14', revenue: 1050, cumulative: 2250 },
  { date: 'Apr 15', revenue: 630, cumulative: 2880 },
  { date: 'Apr 16', revenue: 940, cumulative: 3820 },
  { date: 'Apr 17', revenue: 810, cumulative: 4630 },
  { date: 'Apr 18', revenue: 570, cumulative: 5200 },
];

// ---- KPI HELPERS ----
export function getKpiData(inventory: InventoryItem[], reservations: Reservation[]) {
  const totalItems = inventory.length;
  const activeReservations = reservations.filter(r => r.status === 'pending').length;
  const lowStockAlerts = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock' || i.status === 'expiring_soon').length;
  const todayRevenue = reservations
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);
  return { totalItems, activeReservations, lowStockAlerts, todayRevenue };
}
