'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: number; // percent change vs yesterday
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  animate?: boolean;
}

const colorMap = {
  primary: { bg: 'rgba(14,165,233,0.12)', text: '#0ea5e9', border: 'rgba(14,165,233,0.25)', glow: '0 0 20px rgba(14,165,233,0.2)' },
  accent:  { bg: 'rgba(20,184,166,0.12)', text: '#14b8a6', border: 'rgba(20,184,166,0.25)', glow: '0 0 20px rgba(20,184,166,0.2)' },
  success: { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', border: 'rgba(34,197,94,0.25)',  glow: '0 0 20px rgba(34,197,94,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)', glow: '0 0 20px rgba(245,158,11,0.2)' },
  danger:  { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', border: 'rgba(239,68,68,0.25)',  glow: '0 0 20px rgba(239,68,68,0.2)' },
  info:    { bg: 'rgba(99,102,241,0.12)', text: '#6366f1', border: 'rgba(99,102,241,0.25)', glow: '0 0 20px rgba(99,102,241,0.2)' },
};

function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return ref;
}

export default function KpiCard({
  title, value, prefix = '', suffix = '', icon: Icon,
  trend, color = 'primary', animate = true,
}: KpiCardProps) {
  const colors = colorMap[color];
  const isNumeric = typeof value === 'number';
  const countRef = useCountUp(isNumeric && animate ? (value as number) : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--color-bg-card)',
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: `var(--shadow-card), ${colors.glow}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 120, height: 120,
        borderRadius: '50%', background: colors.bg, filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {title}
          </span>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
            {prefix}
            {isNumeric && animate
              ? <span ref={countRef}>0</span>
              : <span>{isNumeric ? (value as number).toLocaleString() : value}</span>
            }
            {suffix}
          </div>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${colors.border}`,
        }}>
          <Icon size={22} color={colors.text} />
        </div>
      </div>

      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {trend >= 0
            ? <TrendingUp size={14} color="#22c55e" />
            : <TrendingDown size={14} color="#ef4444" />}
          <span style={{ fontSize: 13, fontWeight: 600, color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>vs yesterday</span>
        </div>
      )}
    </motion.div>
  );
}
