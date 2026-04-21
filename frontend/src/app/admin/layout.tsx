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
    <div className="min-h-screen bg-slate-900 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-5 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <ShieldCheck className="text-purple-400" size={24} />
          </div>
          <div>
            <div className="font-bold text-white leading-tight">MedLink</div>
            <div className="text-xs text-purple-400 font-medium">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="outline-none">
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium' 
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            AD
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
