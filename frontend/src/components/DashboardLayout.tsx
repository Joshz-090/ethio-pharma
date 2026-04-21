'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Clock, BarChart3, FileText,
  User, Bell, ChevronLeft, ChevronRight, Activity,
  Pill, LogOut, Settings, Building2, BookOpen, ShieldCheck, Users as UsersIcon
} from 'lucide-react';
import { logout } from '@/services/api';

const pharmacistNavItems = [
  { label: 'Overview',      href: '/pharmacist',             icon: LayoutDashboard },
  { label: 'Inventory',     href: '/pharmacist/inventory',   icon: Package },
  { label: 'Reservations',  href: '/pharmacist/reservations',icon: Clock },
  { label: 'Analytics',     href: '/pharmacist/analytics',   icon: BarChart3 },
  { label: 'Prescriptions', href: '/pharmacist/prescriptions',icon: FileText },
];

const adminNavItems = [
  { label: 'Overview',      href: '/admin',             icon: LayoutDashboard },
  { label: 'Pharmacies',    href: '/admin/pharmacies',  icon: Building2 },
  { label: 'Global Catalog',href: '/admin/catalog',     icon: BookOpen },
  { label: 'AI Analytics',  href: '/admin/analytics',   icon: Activity },
  { label: 'User Roles',    href: '/admin/users',       icon: UsersIcon },
];

const bottomItems = [
  { label: 'Profile',  href: '/profile',  icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export interface NavItemType {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ label, href, icon: Icon, isActive, collapsed }: NavItemProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 4 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '12px 14px' : '11px 16px',
          borderRadius: 'var(--radius-md)',
          background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
          border: isActive ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          cursor: 'pointer',
          position: 'relative',
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'background 0.2s, color 0.2s',
        }}
        title={collapsed ? label : undefined}
      >
        {isActive && (
          <motion.div layoutId="activeIndicator" style={{
            position: 'absolute', left: 0, top: 8, bottom: 8,
            width: 3, borderRadius: 99,
            background: 'var(--color-primary)',
          }} />
        )}
        <Icon size={18} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export interface DashboardLayoutProps {
  children: ReactNode;
  variant?: 'pharmacist' | 'admin';
  portalName?: string;
  portalSubtitle?: string;
  userName?: string;
}

export default function DashboardLayout({ 
  children, 
  variant = 'pharmacist',
  portalName = 'MedLink', 
  portalSubtitle = 'Pharmacy Portal',
  userName = 'MA'
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  const navItems = variant === 'admin' ? adminNavItems : pharmacistNavItems;
  const currentBottomItems = bottomItems.map(item => ({
    ...item,
    href: `/${variant}${item.href}`
  }));
  const sidebarW = collapsed ? 72 : 260;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          height: '100vh', position: 'sticky', top: 0, flexShrink: 0,
          background: '#dbeafe',
          borderRight: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'visible', zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 14px' : '20px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Pill size={18} color="#ffffff" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {portalName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {portalSubtitle}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pharmacy info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                margin: '12px 12px 0',
                padding: '12px 14px',
                background: 'rgba(37, 99, 235, 0.06)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(37, 99, 235, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={14} color="var(--color-primary)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Arba Minch Pharma
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Sikela Sector · Verified ✓
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavItem
              key={item.href}
              {...item}
              isActive={item.href === '/pharmacist' ? pathname === item.href : pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom nav */}
        <div style={{ padding: '12px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {currentBottomItems.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname.startsWith(item.href)} collapsed={collapsed} />
          ))}
          <motion.button
            onClick={logout}
            whileHover={{ x: collapsed ? 0 : 4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '12px 14px' : '11px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent', border: 'none',
              color: 'var(--color-danger)', cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%',
            }}
          >
            <LogOut size={18} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                  style={{ fontSize: 14, fontWeight: 400, whiteSpace: 'nowrap' }}>
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'absolute', top: 22, right: -14,
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-bright)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-text-secondary)', zIndex: 200,
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </motion.aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 64, flexShrink: 0,
          background: '#dbeafe',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {dateStr}
            </div>
            <div style={{
              width: 1, height: 16, background: 'var(--color-border)', margin: '0 4px',
            }} />
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {timeStr}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'relative', width: 38, height: 38,
                borderRadius: 'var(--radius-md)', background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444', border: '2px solid var(--color-bg-surface)',
              }} />
            </motion.button>

            <div style={{
              width: 38, height: 38, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
            }}>
              {userName}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
