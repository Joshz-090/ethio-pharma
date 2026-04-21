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

// Intercept requests to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept responses to handle token expiration (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // Note: Using raw axios to avoid interceptor loop
        const res = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });

        if (res.data.access) {
          localStorage.setItem('access_token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        logout();
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth & Profile ----
export async function login(username: string, password: string) {
  const res = await api.post('/token/', { username, password });
  if (res.data.access) {
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    
    // Fetch profile to get role
    try {
      const profile = await getUserProfile();
      const role = profile.role || 'pharmacist';
      localStorage.setItem('user_role', role);
      return { ...res.data, role };
    } catch (e) {
      console.error('Failed to fetch profile', e);
      // Check if user is admin by checking is_staff status
      try {
        const userRes = await api.get('/users/profiles/');
        const userData = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data;
        const role = userData.role || 'pharmacist';
        localStorage.setItem('user_role', role);
        return { ...res.data, role };
      } catch (e2) {
        console.error('Failed to get user data', e2);
        localStorage.setItem('user_role', 'pharmacist');
        return { ...res.data, role: 'pharmacist' };
      }
    }
  }
  return res.data;
}

export async function getUserProfile() {
  const res = await api.get('/users/profiles/me/');
  return res.data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  }
}

export async function registerUser(data: any) {
  const res = await api.post('/users/register/', data);
  return res.data;
}

// ---- AI Endpoints ----
export async function scanPrescriptionOCR(imageFile: File) {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await api.post('/ai/ocr/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function getDemandPredictions() {
  const res = await api.get('/ai/predict/');
  return res.data;
}

// ---- Admin Endpoints (Catalog & Pharmacies) ----
export async function getCatalog() {
  const res = await api.get('/medicines/catalog/');
  return res.data;
}

export async function addCatalogItem(data: any) {
  const res = await api.post('/medicines/catalog/', data);
  return res.data;
}

export async function getPharmacies() {
  const res = await api.get('/pharmacies/');
  return res.data;
}

export async function getUsers() {
  const res = await api.get('/users/profiles/');
  return res.data;
}

export async function approvePharmacy(id: string) {
  const res = await api.patch(`/pharmacies/${id}/`, { status: 'approved' });
  return res.data;
}

export async function registerPharmacy(data: any) {
  const res = await api.post('/pharmacies/', data);
  return res.data;
}

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
