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

// ---- Auth & Profile ----
export async function login(username: string, password: string) {
  const res = await api.post('/token/', { username, password });
  if (res.data.access) {
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    
    // Fetch profile to get role
    try {
      const profile = await getUserProfile();
      localStorage.setItem('user_role', profile.role || 'pharmacist');
      return { ...res.data, role: profile.role || 'pharmacist' };
    } catch (e) {
      console.error('Failed to fetch profile', e);
      localStorage.setItem('user_role', 'pharmacist'); // default fallback
      return { ...res.data, role: 'pharmacist' };
    }
  }
  return res.data;
}

export async function getUserProfile() {
  const res = await api.get('/users/profiles/');
  // If the backend returns an array (which it does for admins), find the profile belonging to the logged-in user
  if (Array.isArray(res.data)) {
    if (res.data.length === 0) return {};
    if (res.data.length === 1) return res.data[0];

    // Decode token to find current user's ID
    let userId = null;
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Fix: Some base64 strings might need padding, though atob usually handles it.
          // In JWT, the payload is the second part
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')));
          
          userId = payload.user_id;
          
          // p.user is an object from the nested UserSerializer, so check p.user.id
          const myProfile = res.data.find((p: any) => p.user?.id === userId || p.user === userId);
          if (myProfile) return myProfile;
        } catch (e) {
          console.error('Error decoding token', e);
        }
      }
    }
    
    // Fallback: If the backend returned multiple profiles (meaning we bypassed the user filter)
    // AND we didn't find our own profile, it mathematically proves this is a superuser (is_staff) 
    // without a UserProfile database entry. We should explicitly return an admin object.
    if (res.data.length > 1) {
      return { role: 'admin' };
    }

    // Absolute fallback
    return res.data[0] || {};
  }
  
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
