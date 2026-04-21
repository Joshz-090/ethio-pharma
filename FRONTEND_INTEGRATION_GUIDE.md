# Frontend Integration Guide for Misiker

## Backend Status: WORKING! 

Your Django backend is **fully functional**. I've tested all the key endpoints and they're working correctly.

## API Endpoints Status

### 1. User Registration - WORKING
```
POST /api/users/register/
Body: {
  "username": "testuser",
  "email": "test@example.com", 
  "password": "testpass123",
  "first_name": "Test",
  "last_name": "User",
  "role": "pharmacist"
}
```

### 2. User Login - WORKING
```
POST /api/token/
Body: {
  "username": "testuser",
  "password": "testpass123"
}
```

### 3. Pharmacy Registration - WORKING
```
POST /api/pharmacies/
Headers: Authorization: Bearer <token>
Body: {
  "name": "Test Pharmacy",
  "address": "123 Main St",
  "phone": "0912345678",
  "email": "pharmacy@test.com",
  "license_number": "PH12345",
  "sector": "Sikela"
}
```

### 4. Admin Panel - WORKING
- URL: `/admin/`
- Admin user: `admin` / `admin123`

## Frontend Integration Steps

### Step 1: API Client Setup
```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ethio-pharma.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 2: Registration Page
```typescript
// pages/register.tsx
import api from '../utils/api';

const handleRegister = async (userData) => {
  try {
    const response = await api.post('/users/register/', userData);
    // After successful registration, login
    const loginResponse = await api.post('/token/', {
      username: userData.username,
      password: userData.password
    });
    localStorage.setItem('token', loginResponse.data.access);
    // Redirect to dashboard
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Step 3: Pharmacy Registration
```typescript
// pages/pharmacy-register.tsx
import api from '../utils/api';

const handlePharmacyRegister = async (pharmacyData) => {
  try {
    const response = await api.post('/pharmacies/', pharmacyData);
    console.log('Pharmacy registered:', response.data);
    // Show success message
  } catch (error) {
    console.error('Pharmacy registration failed:', error);
  }
};
```

### Step 4: Admin Login
```typescript
// pages/admin-login.tsx
const handleAdminLogin = async (credentials) => {
  try {
    const response = await api.post('/token/', credentials);
    localStorage.setItem('token', response.data.access);
    // Check if user is admin
    // You might need an endpoint to verify admin status
  } catch (error) {
    console.error('Admin login failed:', error);
  }
};
```

## Important Notes

1. **Backend URL**: Use `https://ethio-pharma.onrender.com/api` for production
2. **Local Development**: Use `http://localhost:8000/api` when backend is running locally
3. **Authentication**: All protected endpoints need `Authorization: Bearer <token>` header
4. **Admin Access**: Use username `admin` and password `admin123` for admin panel

## Testing Your Frontend

1. **Registration**: Create a new pharmacist user
2. **Login**: Get JWT token and store in localStorage
3. **Pharmacy Registration**: Submit pharmacy details with auth token
4. **Admin Panel**: Access `/admin/` with admin credentials

## Common Issues & Solutions

### CORS Issues
If you get CORS errors, the backend already has CORS configured. Make sure your frontend URL is in the allowed origins.

### Authentication Errors
- Ensure you're sending the token in the correct format: `Bearer <token>`
- Check if token hasn't expired (tokens last 1 hour)

### 404 Errors
- Check the API endpoint URLs carefully
- Ensure you're using the correct base URL

## Next Steps for Misiker

1. Set up the API client in your Next.js project
2. Create registration and login forms
3. Implement pharmacy registration form
4. Test admin dashboard functionality
5. Style the components with Tailwind CSS

The backend is ready and waiting for your frontend! All endpoints are tested and working correctly.
