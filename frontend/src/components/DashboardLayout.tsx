'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, LogOut, Settings, AlertTriangle, ExternalLink, 
  LayoutDashboard, Package, Clock, BarChart3, FileText, User, Activity, ChevronRight, ChevronLeft, Bell
} from 'lucide-react';
import { logout } from '@/services/api';

const navItems = [
  { label: 'Overview',      href: '/pharmacist',             icon: LayoutDashboard },
  { label: 'Inventory',     href: '/pharmacist/inventory',   icon: Package },
  { label: 'Reservations',  href: '/pharmacist/reservations',icon: Clock },
  { label: 'Revenue',       href: '/pharmacist/revenue',      icon: BarChart3 },
  { label: 'Prescriptions', href: '/pharmacist/prescriptions',icon: FileText },
];

const bottomItems = [
  { label: 'Profile',  href: '/pharmacist/profile',  icon: User },
  { label: 'Settings', href: '/pharmacist/settings', icon: Settings },
];

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

interface DashboardLayoutProps { children: ReactNode }

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const sidebarW = collapsed ? 72 : 260;
  const [showWarning, setShowWarning] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    const needsWarning = localStorage.getItem('needs_subscription_warning') === 'true';
    const days = parseInt(localStorage.getItem('days_until_expiry') || '0');
    setShowWarning(needsWarning);
    setDaysLeft(days);
  }, []);

  // Isolate pending page from the dashboard elements
  if (pathname === '/pharmacist/pending') {
    return <>{children}</>;
  }

  const now = new Date();
  const timeStr = mounted ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const dateStr = mounted ? now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

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
                    MedLink
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    Pharmacy Portal
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
          {bottomItems.map(item => (
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

            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
            }}>
              MA
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ 
                  background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                  border: '1px solid #fde68a',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: '12px', 
                    background: '#fbbf24', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#92400e', marginBottom: '2px' }}>
                      Subscription Expiring Soon
                    </h4>
                    <p style={{ fontSize: '13px', color: '#b45309', fontWeight: 500 }}>
                      Your {daysLeft === 0 ? 'trial' : 'subscription'} ends in <strong>{daysLeft} days</strong>. Please renew to avoid service interruption.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/pharmacist/settings/subscription'}
                  style={{ 
                    padding: '8px 16px', borderRadius: '10px', background: '#92400e', 
                    color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  Renew Now <ExternalLink size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {children}
        </main>
      </div>
    </div>
  );
}
