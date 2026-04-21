'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Role Protection
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  return (
    <DashboardLayout 
      variant="admin" 
      portalName="MedLink" 
      portalSubtitle="Admin Console"
      userName="AD"
    >
      {children}
    </DashboardLayout>
  );
}
