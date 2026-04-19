'use client';

type BadgeVariant = 'pending' | 'fulfilled' | 'expired' | 'cancelled' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon';

interface StatusBadgeProps {
  status: BadgeVariant;
  size?: 'sm' | 'md';
}

const badgeConfig: Record<BadgeVariant, { label: string; color: string; bg: string; dot: string }> = {
  pending:       { label: 'Pending',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  fulfilled:     { label: 'Fulfilled',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' },
  expired:       { label: 'Expired',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
  cancelled:     { label: 'Cancelled',     color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', dot: '#94a3b8' },
  in_stock:      { label: 'In Stock',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' },
  low_stock:     { label: 'Low Stock',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  out_of_stock:  { label: 'Out of Stock',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
  expiring_soon: { label: 'Expiring Soon', color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  dot: '#fb923c' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = badgeConfig[status];
  const pad = size === 'sm' ? '3px 8px' : '5px 12px';
  const fs = size === 'sm' ? 11 : 12;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      fontSize: fs, fontWeight: 600, letterSpacing: '0.3px',
      border: `1px solid ${cfg.color}30`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: size === 'sm' ? 5 : 6, height: size === 'sm' ? 5 : 6,
        borderRadius: '50%', background: cfg.dot, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}
