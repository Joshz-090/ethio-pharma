'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertOctagon, Package } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockReservations, Reservation, ReservationStatus } from '@/lib/mockData';
import { fulfillReservation, cancelReservation } from '@/services/api';

const TABS: { label: string; value: ReservationStatus | 'all'; icon: React.ElementType; color: string }[] = [
  { label: 'All',       value: 'all',       icon: Package,       color: '#94a3b8' },
  { label: 'Pending',   value: 'pending',   icon: Clock,         color: '#f59e0b' },
  { label: 'Fulfilled', value: 'fulfilled', icon: CheckCircle2,  color: '#22c55e' },
  { label: 'Expired',   value: 'expired',   icon: AlertOctagon,  color: '#ef4444' },
  { label: 'Cancelled', value: 'cancelled', icon: XCircle,       color: '#94a3b8' },
];

function Countdown({ expiresAt }: { expiresAt: string }) {
  const calc = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, urgent: diff < 1800000 };
  }, [expiresAt]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);

  if (!time) return <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Expired</span>;
  const fmt = (n: number) => String(n).padStart(2, '0');
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      color: time.urgent ? '#ef4444' : '#f59e0b',
      background: time.urgent ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
      padding: '3px 10px', borderRadius: 99,
      border: `1px solid ${time.urgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
    }}>
      {fmt(time.h)}:{fmt(time.m)}:{fmt(time.s)}
    </span>
  );
}

function ReservationCard({
  r, onFulfill, onCancel,
}: {
  r: Reservation; onFulfill: (id: string) => void; onCancel: (id: string) => void;
}) {
  const [loading, setLoading] = useState<'fulfill' | 'cancel' | null>(null);
  const isPending = r.status === 'pending';

  const handleFulfill = async () => {
    setLoading('fulfill');
    await fulfillReservation(r.id);
    onFulfill(r.id);
    setLoading(null);
  };

  const handleCancel = async () => {
    setLoading('cancel');
    await cancelReservation(r.id);
    onCancel(r.id);
    setLoading(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, flex: 1 }}>
          {/* Icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: isPending ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.08)',
            border: `1px solid ${isPending ? 'rgba(245,158,11,0.25)' : 'var(--color-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={18} color={isPending ? '#f59e0b' : 'var(--color-text-muted)'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {r.medicineName}
              </span>
              <StatusBadge status={r.status} size="sm" />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Patient: <strong style={{ color: 'var(--color-text-secondary)' }}>{r.patientCode}</strong>
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Qty: <strong style={{ color: 'var(--color-text-secondary)' }}>{r.quantity}</strong>
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Total: <strong style={{ color: '#22c55e' }}>ETB {(r.quantity * r.unitPrice).toFixed(2)}</strong>
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-text-muted)' }}>
              Reserved: {new Date(r.reservedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          {isPending && <Countdown expiresAt={r.expiresAt} />}
          {isPending && (
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleFulfill}
                disabled={!!loading}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                  color: '#22c55e', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: loading === 'cancel' ? 0.5 : 1,
                }}
              >
                <CheckCircle2 size={14} />
                {loading === 'fulfill' ? 'Saving…' : 'Fulfill'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleCancel}
                disabled={!!loading}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: loading === 'fulfill' ? 0.5 : 1,
                }}
              >
                <XCircle size={14} />
                {loading === 'cancel' ? 'Saving…' : 'Cancel'}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'all'>('all');

  const counts = {
    all:       reservations.length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    fulfilled: reservations.filter(r => r.status === 'fulfilled').length,
    expired:   reservations.filter(r => r.status === 'expired').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  const filtered = activeTab === 'all' ? reservations : reservations.filter(r => r.status === activeTab);

  const onFulfill = (id: string) =>
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'fulfilled' } : r));
  const onCancel = (id: string) =>
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle="Manage incoming medicine holds from patients"
        breadcrumb={['Pharmacist', 'Reservations']}
      />

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {TABS.slice(1).map(tab => (
          <div key={tab.value} style={{
            padding: '14px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-card)', border: `1px solid ${tab.color}30`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: tab.color }}>
              {counts[tab.value as ReservationStatus]}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.value;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--color-border-bright)' : '1px solid transparent',
                color: isActive ? tab.color : 'var(--color-text-muted)',
                fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} />
              {tab.label}
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: isActive ? `${tab.color}20` : 'rgba(255,255,255,0.05)',
                color: isActive ? tab.color : 'var(--color-text-muted)',
                padding: '1px 6px', borderRadius: 99,
              }}>
                {counts[tab.value as keyof typeof counts]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                textAlign: 'center', padding: '60px 20px',
                color: 'var(--color-text-muted)', fontSize: 14,
                background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}>
              No reservations in this category
            </motion.div>
          ) : filtered.map(r => (
            <ReservationCard key={r.id} r={r} onFulfill={onFulfill} onCancel={onCancel} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
