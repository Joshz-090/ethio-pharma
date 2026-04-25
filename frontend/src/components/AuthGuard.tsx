'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'pharmacist' | 'patient';
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);
    setUserRole(role);

    const status = localStorage.getItem('pharmacy_status');

    if (requiredRole && role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'pharmacist') {
        if (status !== 'approved') {
          router.push('/pharmacist/pending');
        } else {
          router.push('/pharmacist');
        }
      } else {
        router.push('/login');
      }
      return;
    }

    // Special check for pharmacist status even if role matches
    if (role === 'pharmacist') {
      const isSubscriptionValid = localStorage.getItem('is_subscription_valid') === 'true';
      
      if (status !== 'approved') {
        if (!window.location.pathname.includes('/pending')) {
          router.push('/pharmacist/pending');
          return;
        }
      } else if (!isSubscriptionValid) {
        // Force them to a renewal/expired page
        if (!window.location.pathname.includes('/expired')) {
          router.push('/pharmacist/expired');
          return;
        }
      }
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please log in to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
