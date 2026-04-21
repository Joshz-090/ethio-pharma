'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, MapPin, RefreshCw, AlertCircle, BarChart3, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { getDemandPredictions } from '@/services/api';

interface PredictionEntry {
  medicine_name: string;
  sector: string;
  predicted_demand: number;
  search_count: number;
  reservation_count: number;
  trend: 'rising' | 'stable' | 'falling';
}

const TREND_CONFIG = {
  rising:  { label: 'Rising',  color: '#059669', bg: '#ecfdf5', border: '#10b981' },
  stable:  { label: 'Stable',  color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
  falling: { label: 'Falling', color: '#dc2626', bg: '#fef2f2', border: '#ef4444' },
};

export default function AdminAnalyticsPage() {
  const [predictions, setPredictions] = useState<PredictionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getDemandPredictions();
      const list = Array.isArray(data) ? data : (data.predictions || data.results || []);
      setPredictions(list);
    } catch (err) {
      setError('AI engine unavailable. Check backend service status.');
    } finally {
      setIsLoading(false);
    }
  };

  const sectors = ['All', ...Array.from(new Set(predictions.map(p => p.sector)))];
  const filtered = sectorFilter === 'All' ? predictions : predictions.filter(p => p.sector === sectorFilter);
  const topItems = [...predictions].sort((a, b) => b.predicted_demand - a.predicted_demand).slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Predictive Demand Analytics"
        subtitle="AI-driven search and reservation forecasting for Arba Minch sectors"
        breadcrumb={['Admin', 'AI Analytics']}
        action={
          <button onClick={fetchData} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm">
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Running AI Engine…</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 text-red-700">
          <AlertCircle size={24} className="shrink-0" />
          <div>
            <p className="font-black text-lg">Prediction Engine Error</p>
            <p className="text-red-600/70 mt-1 font-medium">{error}</p>
          </div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={40} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No predictions found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Analytics will generate once users start searching for medicines in the network.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main List */}
          <div className="xl:col-span-8 space-y-8">
            {/* Top 5 Highlight */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-xl">
                  <TrendingUp size={24} className="text-blue-600" /> High-Demand Medicines
                </h3>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Top 5 Forecast</span>
              </div>
              <div className="divide-y divide-slate-50">
                {topItems.map((item, i) => {
                  const trend = TREND_CONFIG[item.trend] || TREND_CONFIG.stable;
                  const maxDemand = topItems[0]?.predicted_demand || 1;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-8 flex items-center gap-6 hover:bg-slate-50/50 transition-colors">
                      <span className="text-4xl font-black text-slate-100 w-12 shrink-0">0{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-slate-900 text-lg truncate">{item.medicine_name}</span>
                          <span className="shrink-0 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider" style={{ color: trend.color, background: trend.bg, border: `1px solid ${trend.color}20` }}>{trend.label}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(item.predicted_demand / maxDemand) * 100}%` }} 
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
                        </div>
                        <div className="flex gap-6 mt-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <MapPin size={14} /> <span className="text-slate-900">{item.sector}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Activity size={14} /> <span className="text-slate-900">{item.search_count} Searches</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="text-2xl font-black text-blue-700">{item.predicted_demand}</div>
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Score</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Filterable Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-xl">
                  <MapPin size={24} className="text-blue-600" /> Localized Demand
                </h3>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  {sectors.map(s => (
                    <button key={s} onClick={() => setSectorFilter(s)} 
                      className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider ${sectorFilter === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medicine</th>
                      <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector</th>
                      <th className="text-center px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reservations</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Forecast</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((p, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5">
                          <span className="font-black text-slate-900">{p.medicine_name}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-bold text-slate-500">{p.sector}</span>
                        </td>
                        <td className="px-8 py-5 text-center font-black text-slate-900">
                          {p.reservation_count}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black">
                            {p.predicted_demand} Demand <ChevronRight size={12} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <Activity size={32} className="mb-6 opacity-80" />
              <h4 className="text-5xl font-black mb-2">{predictions.length}</h4>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-sm">Medicines Monitored</p>
              <div className="mt-10 h-px bg-white/20" />
              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-black">{sectors.length - 1}</p>
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1">Active Sectors</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black">{predictions.filter(p => p.trend === 'rising').length}</p>
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1">Rising Demand</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-900 mb-6 text-lg">AI Methodology</h4>
              <div className="space-y-6">
                {[
                  { title: 'Search Trends', desc: 'Real-time monitoring of patient search queries in Arba Minch.' },
                  { title: 'Sector Demand', desc: 'Weighted scoring based on reservation completion rates.' },
                  { title: 'Market Gaps', desc: 'Identification of medicines with high demand but low stock.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
