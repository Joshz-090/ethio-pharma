'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Activity, BookOpen, Clock, CheckCircle, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react';
import { getPharmacies, getCatalog } from '@/services/api';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ pharmacies: 0, pending: 0, catalog: 0, users: 0 });
  const [recentPharmacies, setRecentPharmacies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pharmacies, catalog] = await Promise.allSettled([
        getPharmacies(),
        getCatalog(),
      ]);

      const phList = pharmacies.status === 'fulfilled' ? pharmacies.value : [];
      const catList = catalog.status === 'fulfilled' ? catalog.value : [];

      setStats({
        pharmacies: phList.filter((p: any) => p.verification_status === 'verified').length,
        pending:    phList.filter((p: any) => p.verification_status === 'pending').length,
        catalog:    catList.length,
        users:      phList.length,
      });

      setRecentPharmacies(phList.slice(0, 6));
    } catch (e) {
      console.error('Admin overview fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatCard[] = [
    { label: 'Active Pharmacies',    value: stats.pharmacies, icon: Building2,    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', description: 'Verified SaaS tenants' },
    { label: 'Pending Applications', value: stats.pending,    icon: Clock,         color: '#d97706', bg: '#fffbeb', border: '#fef3c7', description: 'Awaiting your review' },
    { label: 'Global Catalog Items', value: stats.catalog,    icon: BookOpen,      color: '#059669', bg: '#ecfdf5', border: '#bbf7d0', description: 'Medicines in registry' },
    { label: 'Total Users',          value: stats.users,      icon: Users,         color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', description: 'Registered pharmacies' },
  ];

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 pb-12">
        <PageHeader 
          title="Administrative Overview"
          subtitle="Manage the MedLink network, approve registrations, and monitor global medicine catalogs"
          breadcrumb={['Admin', 'Dashboard']}
        />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
            ))
          ) : (
            statCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                    <card.icon size={24} style={{ color: card.color }} />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900 leading-none">{card.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</div>
                  </div>
          ))
        ) : (
          statCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                  <card.icon size={24} style={{ color: card.color }} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900 leading-none">{card.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-base font-black text-slate-800 tracking-tight">{card.label}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">{card.description}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Registrations */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-xl">
              <Building2 size={24} className="text-blue-600" /> Recent Applications
            </h3>
            <a href="/admin/pharmacies" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pharmacy</th>
                  <th className="text-left px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="text-center px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="text-right px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-16 bg-slate-50/20" />
                    </tr>
                  ))
                ) : recentPharmacies.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No pending applications</td></tr>
                ) : recentPharmacies.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.owner_name}</div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500">
                      {p.address}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.verification_status === 'verified' ? 'bg-green-50 text-green-600 border border-green-100' :
                        p.verification_status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {p.verification_status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a href="/admin/pharmacies" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-xs font-black transition-all">
                        Review <ChevronRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/10">
            <h4 className="text-xl font-black mb-6">Quick Controls</h4>
            <div className="space-y-4">
              {[
                { href: '/admin/pharmacies', icon: Building2, color: 'text-blue-400', title: 'Applications', desc: `${stats.pending} waiting` },
                { href: '/admin/catalog',    icon: BookOpen,  color: 'text-green-400', title: 'Medicine Catalog', desc: 'Manage list' },
                { href: '/admin/analytics',  icon: TrendingUp,color: 'text-purple-400', title: 'AI Predictions', desc: 'Market demand' },
              ].map((action, i) => (
                <a key={i} href={action.href} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform">
                    <action.icon size={20} className={action.color} />
                  </div>
                  <div>
                    <div className="font-black text-sm">{action.title}</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{action.desc}</div>
                  </div>
                  <ChevronRight size={16} className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" /> Platform Integrity
            </h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">SaaS Multi-tenancy</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Each pharmacy operates in its own secure isolated environment.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">KYC Verification</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Admins must verify manual payment receipts for new pharmacy access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
