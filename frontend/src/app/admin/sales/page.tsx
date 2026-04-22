'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Building2, RefreshCw, Calendar } from 'lucide-react';
import api from '@/services/api';

interface Sale {
  id: string;
  pharmacy_name: string;
  medicine_name: string;
  quantity_sold: number;
  total_price: number;
  created_at: string;
}

interface DailySummary {
  date: string;
  total_revenue: number;
  total_units: number;
  total_transactions: number;
}

export default function SalesReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/medicines/sales/');
      setSales(res.data || []);
    } catch (err) {
      console.error('Failed to load sales', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by date range
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const filteredSales = sales.filter(s => {
    const saleDate = s.created_at.split('T')[0];
    if (dateFilter === 'today') return saleDate === todayStr;
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return saleDate >= weekAgo;
    }
    return true; // all
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total_price), 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.quantity_sold, 0);

  // Group by pharmacy
  const byPharmacy: Record<string, { revenue: number; units: number; tx: number }> = {};
  filteredSales.forEach(s => {
    if (!byPharmacy[s.pharmacy_name]) byPharmacy[s.pharmacy_name] = { revenue: 0, units: 0, tx: 0 };
    byPharmacy[s.pharmacy_name].revenue += Number(s.total_price);
    byPharmacy[s.pharmacy_name].units += s.quantity_sold;
    byPharmacy[s.pharmacy_name].tx += 1;
  });

  const pharmacySummaries = Object.entries(byPharmacy).sort((a, b) => b[1].revenue - a[1].revenue);

  const statCards = [
    { label: 'Total Revenue', value: `ETB ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Units Sold', value: totalUnits, icon: ShoppingCart, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { label: 'Transactions', value: filteredSales.length, icon: TrendingUp, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { label: 'Active Pharmacies', value: Object.keys(byPharmacy).length, icon: Building2, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary, #0f172a)', margin: 0 }}>
            Sales Report
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Real-time sales data from all pharmacies on the network
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {['today', 'week', 'all'].map(f => (
            <button key={f} onClick={() => setDateFilter(f)} style={{
              padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textTransform: 'capitalize',
              background: dateFilter === f ? '#10b981' : 'white',
              border: `1px solid ${dateFilter === f ? '#10b981' : '#e2e8f0'}`,
              color: dateFilter === f ? 'white' : '#64748b',
            }}>
              {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'Today'}
            </button>
          ))}
          <button onClick={fetchSales} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: '#64748b', fontWeight: 500,
          }}>
            <RefreshCw size={14} />  Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{
              background: 'white', borderRadius: 14, padding: '20px 22px',
              border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '6px 0 0' }}>
                  {card.value}
                </p>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={20} color={card.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Per-pharmacy summary */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} color="#10b981" />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Revenue by Pharmacy</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : pharmacySummaries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No sales recorded {dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : 'yet'}
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {pharmacySummaries.map(([name, data], i) => {
                const pct = totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0;
                return (
                  <motion.div key={name}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ padding: '12px 22px', borderBottom: i < pharmacySummaries.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>ETB {data.revenue.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.6 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: 99 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{data.units} units sold</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{data.tx} transactions</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top medicines sold */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#0ea5e9" />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Top Selling Medicines</span>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (() => {
            const byMed: Record<string, { units: number; revenue: number }> = {};
            filteredSales.forEach(s => {
              if (!byMed[s.medicine_name]) byMed[s.medicine_name] = { units: 0, revenue: 0 };
              byMed[s.medicine_name].units += s.quantity_sold;
              byMed[s.medicine_name].revenue += Number(s.total_price);
            });
            const sorted = Object.entries(byMed).sort((a, b) => b[1].units - a[1].units).slice(0, 8);
            if (!sorted.length) return (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No data for this period
              </div>
            );
            const maxUnits = sorted[0]?.[1].units || 1;
            return (
              <div style={{ padding: '8px 0' }}>
                {sorted.map(([med, data], i) => (
                  <motion.div key={med}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ padding: '11px 22px', borderBottom: i < sorted.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{med}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9' }}>{data.units} units</span>
                    </div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(data.units / maxUnits) * 100}%` }} transition={{ delay: 0.3, duration: 0.5 }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#0ea5e9,#6366f1)', borderRadius: 99 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'block' }}>
                      ETB {data.revenue.toFixed(2)} revenue
                    </span>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Full Sales Ledger */}
      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color="#64748b" />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Transaction Ledger</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
            {filteredSales.length} records
          </span>
        </div>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filteredSales.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            No sales transactions found for this period.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Pharmacy', 'Medicine', 'Qty Sold', 'Revenue (ETB)', 'Date & Time'].map(h => (
                    <th key={h} style={{
                      padding: '11px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.5px', color: '#64748b', textAlign: 'left',
                      borderBottom: '1px solid #f1f5f9',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s, i) => (
                  <motion.tr key={s.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    style={{ borderBottom: '1px solid #f8fafc' }}
                  >
                    <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {s.pharmacy_name}
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: 13, color: '#334155' }}>
                      {s.medicine_name}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(14,165,233,0.1)', color: '#0ea5e9',
                        borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700,
                      }}>
                        {s.quantity_sold} units
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                      {Number(s.total_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: 12, color: '#64748b' }}>
                      {new Date(s.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
