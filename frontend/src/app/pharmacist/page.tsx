'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, AlertTriangle, TrendingUp, RefreshCw, ShoppingCart, UserCheck } from 'lucide-react';
import { getInventory, getReservations } from '@/services/api';
import KpiCard from '@/components/ui/KpiCard';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';

export default function PharmacistOverviewPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pharmacyName, setPharmacyName] = useState('My Pharmacy');

  useEffect(() => {
    fetchData();
    const storedName = localStorage.getItem('pharmacy_name');
    if (storedName) setPharmacyName(storedName);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invData, resData] = await Promise.all([
        getInventory(),
        getReservations()
      ]);
      setInventory(invData);
      setReservations(resData);
    } catch (error) {
      console.error('Dashboard fetch failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalItems: inventory.length,
    activeReservations: reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length,
    lowStock: inventory.filter(i => i.quantity <= (i.min_stock_level || 10)).length,
    todayOrders: reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.created_at?.startsWith(today);
    }).length
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Syncing with Pharmacy Network...</p>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="pharmacist">
      <div className="space-y-8 pb-12">
        <PageHeader
          title={`Dashboard: ${pharmacyName}`}
          subtitle="Real-time monitoring of your inventory, reservations, and sales performance"
          breadcrumb={['Pharmacist', 'Overview']}
        />

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Inventory', value: stats.totalItems, icon: Package, color: 'emerald' },
            { title: 'Active Bookings', value: stats.activeReservations, icon: Clock, color: 'blue' },
            { title: 'Low Stock Alerts', value: stats.lowStock, icon: AlertTriangle, color: 'amber' },
            { title: 'Today\'s Activity', value: stats.todayOrders, icon: TrendingUp, color: 'indigo' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label || stat.title}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100`}>
                <stat.icon size={22} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reservations */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-xl">
                <ShoppingCart size={24} className="text-emerald-600" /> Recent Bookings
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {reservations.slice(0, 5).map((res, i) => (
                <div key={res.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {res.patient_name?.substring(0, 2).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{res.medicine_name || 'Medicine'}</div>
                      <div className="text-xs text-slate-500">For: {res.patient_name || 'Patient'} · Qty: {res.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={res.status} />
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{new Date(res.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {reservations.length === 0 && <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active reservations</div>}
            </div>
          </div>

          {/* Low Stock Watch */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-xl">
                <AlertTriangle size={24} className="text-amber-500" /> Critical Stock
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {inventory.filter(i => i.quantity < 20).slice(0, 5).map((item, i) => (
                <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900">{item.medicine?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">Category: {item.medicine?.category || 'General'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-600">{item.quantity}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Left in Stock</div>
                  </div>
                </div>
              ))}
              {inventory.filter(i => i.quantity < 20).length === 0 && <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">All stock levels healthy</div>}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
