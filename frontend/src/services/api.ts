import axios from 'axios';
import {
  mockInventory,
  mockReservations,
  mockDailyReservations,
  mockMedicinePopularity,
  mockCategorySplit,
  mockExpiryTimeline,
  mockRevenueTrend,
  InventoryItem,
  Reservation,
} from '@/lib/mockData';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ---- Inventory ----
export async function getInventory(): Promise<InventoryItem[]> {
  if (USE_MOCK) return Promise.resolve(mockInventory);
  const res = await api.get('/inventory/');
  return res.data;
}

export async function updateStock(id: string, quantity: number, price: number): Promise<InventoryItem> {
  if (USE_MOCK) {
    const item = mockInventory.find(i => i.id === id);
    if (item) { item.quantityOnHand = quantity; item.unitPrice = price; }
    return Promise.resolve(item!);
  }
  const res = await api.patch(`/inventory/${id}/`, { quantity_on_hand: quantity, unit_price: price });
  return res.data;
}

export async function toggleAvailability(id: string, isAvailable: boolean): Promise<InventoryItem> {
  if (USE_MOCK) {
    const item = mockInventory.find(i => i.id === id);
    if (item) item.isAvailable = isAvailable;
    return Promise.resolve(item!);
  }
  const res = await api.patch(`/inventory/${id}/`, { is_available: isAvailable });
  return res.data;
}

// ---- Reservations ----
export async function getReservations(): Promise<Reservation[]> {
  if (USE_MOCK) return Promise.resolve(mockReservations);
  const res = await api.get('/reservations/');
  return res.data;
}

export async function fulfillReservation(id: string): Promise<Reservation> {
  if (USE_MOCK) {
    const r = mockReservations.find(r => r.id === id);
    if (r) r.status = 'fulfilled';
    return Promise.resolve(r!);
  }
  const res = await api.patch(`/reservations/${id}/`, { status: 'fulfilled' });
  return res.data;
}

export async function cancelReservation(id: string): Promise<Reservation> {
  if (USE_MOCK) {
    const r = mockReservations.find(r => r.id === id);
    if (r) r.status = 'cancelled';
    return Promise.resolve(r!);
  }
  const res = await api.patch(`/reservations/${id}/`, { status: 'cancelled' });
  return res.data;
}

// ---- Analytics ----
export async function getAnalytics() {
  if (USE_MOCK) {
    return Promise.resolve({
      dailyReservations: mockDailyReservations,
      medicinePopularity: mockMedicinePopularity,
      categorySplit: mockCategorySplit,
      expiryTimeline: mockExpiryTimeline,
      revenueTrend: mockRevenueTrend,
    });
  }
  const res = await api.get('/analytics/pharmacist/');
  return res.data;
}

export default api;
