'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Clock, AlertTriangle, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import KpiCard from '@/components/ui/KpiCard';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import {
  mockInventory, mockReservations, mockDailyReservations,
  mockMedicinePopularity, mockCategorySplit, mockExpiryTimeline, getKpiData,
} from '@/lib/mockData';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-bright)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px', boxShadow: 'var(--shadow-card)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-bright)',
      borderRadius: 'var(--radius-sm)', padding: '8px 12px',
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: payload[0].payload.color }}>{payload[0].name}</span>
      <span style={{ fontSize: 13, color: 'var(--color-text-primary)', marginLeft: 8 }}>{payload[0].value}%</span>
    </div>
  );
};

export default function PharmacistOverviewPage() {
  const kpi = getKpiData(mockInventory, mockReservations);
  const recentReservations = mockReservations.slice(0, 5);
  const lowStockItems = mockInventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock' || i.status === 'expiring_soon').slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Welcome back. Here's what's happening at your pharmacy today."
        breadcrumb={['Pharmacist', 'Overview']}
      />

      {/* KPI Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20, marginBottom: 32,
      }}>
        {[
          { title: 'Total Stock Items',    value: kpi.totalItems,          icon: Package,       color: 'primary' as const, trend: 5 },
          { title: 'Active Reservations',  value: kpi.activeReservations,  icon: Clock,         color: 'warning' as const, trend: -12 },
          { title: 'Low Stock Alerts',     value: kpi.lowStockAlerts,      icon: AlertTriangle, color: 'danger' as const,  trend: 8 },
          { title: 'Revenue Today (ETB)',  value: kpi.todayRevenue,        icon: TrendingUp,    color: 'success' as const, trend: 23, prefix: 'ETB ' },
        ].map((card, i) => (
          <motion.div key={card.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <KpiCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Reservations Trend — Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Reservation Trends
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>Last 7 days by status</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockDailyReservations} margin={{ left: -10, right: 8 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="fulfilled" name="Fulfilled" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="pending"   name="Pending"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expired"   name="Expired"   stroke="#ef4444" strokeWidth={2}   dot={{ r: 3, fill: '#ef4444' }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Medicines — Horizontal Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Top Reserved Medicines
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>By reservation count (all time)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMedicinePopularity} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="reservations" name="Reservations" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={24} />
              <Bar dataKey="searches" name="Searches" fill="rgba(14,165,233,0.25)" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

        {/* Category split — Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Stock by Category
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>Distribution of inventory items</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={mockCategorySplit} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={3} stroke="none">
                  {mockCategorySplit.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockCategorySplit.map(cat => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Expiry Timeline — Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Expiry Timeline
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>Medicines expiring by period</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockExpiryTimeline} margin={{ left: -10, right: 8 }}>
              <defs>
                <linearGradient id="expiryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Items" stroke="#f59e0b" strokeWidth={2.5} fill="url(#expiryGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row — Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* Recent Reservations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Recent Reservations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentReservations.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                    background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#0ea5e9',
                  }}>
                    {r.patientCode.split('-')[1]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.medicineName}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{r.patientCode} · Qty: {r.quantity}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <StatusBadge status={r.status} size="sm" />
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    ETB {(r.quantity * r.unitPrice).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
          className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={16} color="#ef4444" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Stock Alerts
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lowStockItems.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 + i * 0.05 }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: item.status === 'out_of_stock'
                    ? 'rgba(239,68,68,0.06)' : item.status === 'expiring_soon'
                    ? 'rgba(251,146,60,0.06)' : 'rgba(245,158,11,0.06)',
                  border: `1px solid ${item.status === 'out_of_stock' ? 'rgba(239,68,68,0.2)' : item.status === 'expiring_soon' ? 'rgba(251,146,60,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.medicineName}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.category}</div>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Qty: <strong style={{ color: item.quantityOnHand === 0 ? '#ef4444' : '#f59e0b' }}>{item.quantityOnHand}</strong>
                  {item.status === 'expiring_soon' && (
                    <span style={{ marginLeft: 8 }}>· Exp: {item.expiryDate}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
