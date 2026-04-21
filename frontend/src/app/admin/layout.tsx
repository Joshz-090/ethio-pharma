'use client';
import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Activity,
  LogOut, Settings, Building2, BookOpen, ShieldCheck,
} from 'lucide-react';
import { logout } from '@/services/api';

const navItems = [
  { label: 'Overview',      href: '/admin',             icon: LayoutDashboard },
  { label: 'Pharmacies',    href: '/admin/pharmacies',  icon: Building2 },
  { label: 'Global Catalog',href: '/admin/catalog',     icon: BookOpen },
  { label: 'AI Analytics',  href: '/admin/analytics',   icon: Activity },
  { label: 'User Roles',    href: '/admin/users',       icon: Users },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Role Protection
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  return (
      <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen shrink-0 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="text-emerald-600" size={24} />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">MedLink</div>
            <div className="text-xs text-emerald-600 font-semibold tracking-wider uppercase">Admin Portal</div>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1.5 overflow-y-auto mt-2">
          {navItems.map(item => {
            const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="outline-none">
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 font-medium' 
                      : 'border border-transparent text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <item.icon size={19} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'} />
                  <span className="text-sm">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 leading-none">System Admin</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Verified</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
