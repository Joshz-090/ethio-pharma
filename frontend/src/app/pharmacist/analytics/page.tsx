'use client';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  mockRevenueTrend, mockDailyReservations, mockMedicinePopularity,
  mockCategorySplit, mockInventory,
} from '@/lib/mockData';
import { format, addDays, parseISO } from 'date-fns';

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-bright)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px', boxShadow: 'var(--shadow-card)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue')
              ? `ETB ${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Demand Gap Chart ──────────────────────────────────────────────────────────
const demandGapData = mockMedicinePopularity.map(m => ({
  name: m.name,
  searches: m.searches,
  reservations: m.reservations,
  gap: m.searches - m.reservations,
}));

// ─── Expiring Medicines Table ──────────────────────────────────────────────────
const expiringItems = mockInventory
  .filter(i => i.status === 'expiring_soon' || i.expiryDate < '2026-12-31')
  .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
  .slice(0, 6);

// ─── Helper ────────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card"
    style={{ padding: 24 }}
  >
    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{title}</h3>
    {subtitle && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>{subtitle}</p>}
    {children}
  </motion.div>
);

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Deep-dive into pharmacy performance, demand, and stock health"
        breadcrumb={['Pharmacist', 'Analytics']}
      />

      {/* Row 1 — Revenue (full width) */}
      <ChartCard
        title="Revenue Over Time"
        subtitle="Daily revenue + cumulative total (ETB) — last 7 days"
        delay={0.1}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={mockRevenueTrend} margin={{ left: 0, right: 8 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" name="Daily Revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#revGrad)" />
            <Area type="monotone" dataKey="cumulative" name="Cumulative Revenue" stroke="#14b8a6" strokeWidth={2} fill="url(#cumGrad)" strokeDasharray="5 2" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ height: 20 }} />

      {/* Row 2 — Two side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Reservation volume */}
        <ChartCard
          title="Reservation Volume"
          subtitle="Daily count by status — last 7 days"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mockDailyReservations} margin={{ left: -10, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="fulfilled" name="Fulfilled" fill="#22c55e" radius={[3, 3, 0, 0]} stackId="a" maxBarSize={32} />
              <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" maxBarSize={32} />
              <Bar dataKey="expired"   name="Expired"   fill="#ef4444" radius={[3, 3, 0, 0]} stackId="a" maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Demand vs Stock Gap */}
        <ChartCard
          title="Search Demand vs Reservations"
          subtitle="Are patients finding what they search for?"
          delay={0.3}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={demandGapData} layout="vertical" margin={{ left: 10, right: 24 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={88} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="searches"     name="Searches"     fill="#6366f1" radius={[0, 3, 3, 0]} maxBarSize={18} />
              <Bar dataKey="reservations" name="Reservations" fill="#0ea5e9" radius={[0, 3, 3, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ height: 20 }} />

      {/* Row 3 — Pie + Expiry table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Category Pie */}
        <ChartCard title="Stock by Category" subtitle="Current inventory distribution" delay={0.4}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={mockCategorySplit} dataKey="value"
                cx="50%" cy="50%"
                innerRadius={65} outerRadius={100}
                paddingAngle={3} stroke="none"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.15)' }}
              >
                {mockCategorySplit.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Expiry Risk Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card" style={{ padding: 24 }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Expiry Risk Register
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Medicines sorted by urgency — review and act
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Medicine', 'Qty', 'Expiry', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: 11, fontWeight: 700,
                    color: 'var(--color-text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.5px', padding: '8px 10px',
                    borderBottom: '1px solid var(--color-border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expiringItems.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td style={{ padding: '10px 10px', fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {item.medicineName}
                  </td>
                  <td style={{ padding: '10px 10px', fontSize: 13, fontWeight: 600,
                    color: item.quantityOnHand < 10 ? '#f59e0b' : 'var(--color-text-secondary)' }}>
                    {item.quantityOnHand}
                  </td>
                  <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {item.expiryDate}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
