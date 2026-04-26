'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, 
  Download, Filter, RefreshCcw, Wallet, Landmark, Activity, History
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import KpiCard from '@/components/ui/KpiCard';
import { getPharmacistRevenue, getSalesHistory } from '@/services/api';

export default function RevenuePage() {
  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, hData] = await Promise.all([
        getPharmacistRevenue(),
        getSalesHistory()
      ]);
      setStats(sData);
      setSales(hData);
    } catch (err) {
      console.error('Failed to fetch revenue data', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Financial Records...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="Revenue Management" 
          subtitle="Track income, sales trends, and profit performance."
          breadcrumb={['Pharmacist', 'Revenue']}
        />
        <div className="flex gap-3 mb-2">
          <button onClick={fetchData} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-all border border-slate-200">
            <RefreshCcw size={18} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}><KpiCard title="Today's Revenue" value={stats?.today_revenue} prefix="ETB " icon={Wallet} color="primary" trend={12} /></motion.div>
        <motion.div variants={itemVariants}><KpiCard title="Today's Profit" value={stats?.today_profit} prefix="ETB " icon={TrendingUp} color="success" trend={8} /></motion.div>
        <motion.div variants={itemVariants}><KpiCard title="Weekly Income" value={stats?.weekly_revenue} prefix="ETB " icon={Calendar} color="warning" /></motion.div>
        <motion.div variants={itemVariants}><KpiCard title="Monthly Goal" value={stats?.monthly_revenue} prefix="ETB " icon={Landmark} color="danger" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Revenue Flow
              </h3>
              <p className="text-slate-500 text-xs font-medium">Daily income trends for the last 7 days</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900">Weekly</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly</button>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales Feed */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-950/20"
        >
          <div className="mb-8">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <History size={20} className="text-teal-400" /> Recent Sales
            </h3>
            <p className="text-slate-400 text-xs font-medium">Live transaction history</p>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {sales.length === 0 ? (
              <div className="py-10 text-center opacity-40 italic text-sm">No sales recorded today</div>
            ) : sales.map((sale: any) => (
              <div key={sale.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between group hover:border-teal-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold truncate max-w-[120px]">{sale.medicine_name || 'Quick Sale'}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-teal-400">+{sale.total_price}</div>
                  <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{sale.quantity_sold} Units</div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 rounded-2xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">View All Transactions</button>
        </motion.div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Filter size={18} /></div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Income Insights</h4>
           </div>
           <p className="text-sm text-slate-600 leading-relaxed">
             Based on current trends, your pharmacy is performing <strong>14% better</strong> than the same period last week. 
             Most revenue is coming from <strong>Antibiotics</strong> and <strong>Chronic Care</strong> medications.
           </p>
        </div>
        <div className="p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><TrendingUp size={18} /></div>
              <h4 className="font-black text-emerald-900 uppercase tracking-widest text-xs">Profit Optimization</h4>
           </div>
           <p className="text-sm text-emerald-800 leading-relaxed opacity-80">
             To maximize daily profit, consider reviewing the selling price of items with high turnover but low margins. 
             You currently have <strong>12 items</strong> with a margin below 15%.
           </p>
        </div>
      </div>
    </div>
  );
}
