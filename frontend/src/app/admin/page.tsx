'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Activity, BookOpen, Clock, CheckCircle, ShieldCheck, TrendingUp, ChevronRight } from 'lucide-react';
import { getPharmacies, getCatalog, getUsers } from '@/services/api';
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
    // Load from cache for instant "Fast" feeling
    const cachedStats = localStorage.getItem('admin_overview_stats');
    if (cachedStats) {
      try {
        setStats(JSON.parse(cachedStats));
        setIsLoading(false); // Show cached immediately
      } catch (e) {
        console.error('Failed to parse cached stats');
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pharmacies, catalog, users] = await Promise.allSettled([
        getPharmacies(),
        getCatalog(),
        getUsers()
      ]);

      const phList = pharmacies.status === 'fulfilled' ? pharmacies.value : [];
      const catList = catalog.status === 'fulfilled' ? catalog.value : [];
      const userList = users.status === 'fulfilled' ? users.value : [];

      const newStats = {
        pharmacies: phList.filter((p: any) => p.status === 'approved').length,
        pending:    phList.filter((p: any) => p.status === 'pending').length,
        catalog:    catList.length,
        users:      userList.length || phList.length, // Fallback to phList if userList fails
      };

      setStats(newStats);
      localStorage.setItem('admin_overview_stats', JSON.stringify(newStats));
      setRecentPharmacies(phList.slice(0, 6));
    } catch (e) {
      console.error('Admin overview fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatCard[] = [
    { label: 'Active Pharmacies',    value: stats.pharmacies, icon: Building2,    color: '#059669', bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.25)', description: 'Verified SaaS tenants' },
    { label: 'Pending Applications', value: stats.pending,    icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', description: 'Awaiting your review' },
    { label: 'Global Catalog Items', value: stats.catalog,    icon: BookOpen,      color: '#0d9488', bg: 'rgba(13,148,136,0.12)', border: 'rgba(13,148,136,0.25)', description: 'Medicines in registry' },
    { label: 'Total Users',          value: stats.users,      icon: Users,         color: '#0891b2', bg: 'rgba(8,145,178,0.12)',  border: 'rgba(8,145,178,0.25)',  description: 'Registered pharmacies' },
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
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))
          ) : (
            statCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                style={{ 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 20px rgba(14, 165, 233, 0.1)' 
                }}>
                {/* Background glow effect */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 blur-xl"
                  style={{ background: card.bg }}
                />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                       style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 leading-none">{card.value}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Total</div>
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <div className="text-sm font-semibold text-slate-800 tracking-tight">{card.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{card.description}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Registrations */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <Building2 size={20} className="text-emerald-600" /> Recent Applications
            </h3>
            <a href="/admin/pharmacies" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Pharmacy</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4 h-16 bg-slate-50" />
                    </tr>
                  ))
                ) : recentPharmacies.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium text-sm">No pending applications</td></tr>
                ) : recentPharmacies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{p.owner_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.address}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'approved' ? 'bg-green-100 text-green-700' :
                        p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href="/admin/pharmacies" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-medium transition-all">
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
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Quick Controls</h4>
            <div className="space-y-3">
              {[
                { href: '/admin/pharmacies', icon: Building2, color: '#059669', title: 'Applications', desc: `${stats.pending} waiting` },
                { href: '/admin/catalog',    icon: BookOpen,  color: '#0d9488', title: 'Medicine Catalog', desc: 'Manage list' },
                { href: '/admin/analytics',  icon: TrendingUp,color: '#0891b2', title: 'AI Predictions', desc: 'Market demand' },
              ].map((action, i) => (
                <a key={i} href={action.href} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${action.color}15`, border: `1px solid ${action.color}30` }}>
                    <action.icon size={18} style={{ color: action.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{action.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{action.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" /> Platform Integrity
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">SaaS Multi-tenancy</p>
                  <p className="text-xs text-slate-500 mt-1">Each pharmacy operates in its own secure isolated environment.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">KYC Verification</p>
                  <p className="text-xs text-slate-500 mt-1">Admins must verify manual payment receipts for new pharmacy access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      </div>
    </AuthGuard>
  );
}
