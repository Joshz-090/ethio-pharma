'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle, XCircle, MapPin, Phone, User, Eye, AlertCircle, Calendar, ShieldCheck, ExternalLink, Trash2, Bell, Clock, CreditCard } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';
import api, { getPharmacies, approvePharmacy, deletePharmacy, sendWarning } from '@/services/api';

interface Pharmacy {
  id: string;
  name: string;
  owner_name: string;
  contact_phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  payment_receipt?: string;
  created_at: string;
  subscription_tier: string;
  subscription_expiry: string | null;
  trial_expiry: string | null;
  days_until_expiry: number;
  needs_warning: boolean;
  is_subscription_valid: boolean;
  warning_sent: boolean;
}

export default function AdminPharmaciesPage() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified'>('pending');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setIsLoading(true);
      const data = await getPharmacies();
      setPharmacies(data);
    } catch (err) {
      setError('Could not load pharmacy applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this pharmacy and grant dashboard access?')) return;
    try {
      await approvePharmacy(id);
      fetchPharmacies(); // Refresh to get calculated dates
    } catch (err) {
      alert('Failed to approve pharmacy.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`CAUTION: Delete "${name}" and ALL related data (inventory, sales, staff)? This cannot be undone.`)) return;
    try {
      await deletePharmacy(id);
      setPharmacies(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete pharmacy.');
    }
  };

  const handleSendWarning = async (id: string) => {
    try {
      await sendWarning(id);
      setPharmacies(prev => prev.map(p => p.id === id ? { ...p, warning_sent: true } : p));
      alert('Payment warning sent successfully.');
    } catch (err) {
      alert('Failed to send warning.');
    }
  };

  const filtered = pharmacies.filter(p => {
    if (filter === 'verified') return p.status === 'approved';
    return p.status === filter;
  });

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 pb-12">
        <PageHeader
        title="Network Management"
        subtitle="Review applications, monitor subscriptions, and manage pharmacy access"
        breadcrumb={['Admin', 'Pharmacies']}
      />

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
        {(['pending', 'approved'] as const).map((status) => (
          <button key={status} onClick={() => setFilter(status === 'approved' ? 'verified' : 'pending' as any)}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 ${
              (filter === 'verified' && status === 'approved') || (filter === 'pending' && status === 'pending') ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-600'
            }`}>
            {status === 'approved' ? 'Active Network' : 'Pending Review'}
            {status === 'pending' && pharmacies.filter(p => p.status === 'pending').length > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                filter === 'pending' ? 'bg-white text-emerald-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {pharmacies.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Loading Network…</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700">
          <AlertCircle size={24} /> <p className="font-bold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No {filter} pharmacies</h3>
          <p className="text-slate-500 mt-2">New registration requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filtered.map((pharmacy) => (
            <motion.div 
              key={pharmacy.id} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push(`/admin/pharmacies/${pharmacy.id}`)}
              className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer hover:border-emerald-200"
            >
              
              <div className="p-10 flex-1">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                      <Building2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{pharmacy.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        <Calendar size={12} /> Joined {new Date(pharmacy.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {pharmacy.status === 'approved' && (
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border flex items-center gap-2 ${
                        pharmacy.is_subscription_valid ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        <ShieldCheck size={14} /> {pharmacy.is_subscription_valid ? 'Active Account' : 'Blocked (Unpaid)'}
                      </span>
                    )}
                    {pharmacy.needs_warning && !pharmacy.warning_sent && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-amber-100 animate-pulse">
                        Payment Due Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscription Row */}
                {pharmacy.status === 'approved' && (
                  <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Package</p>
                      <p className="text-sm font-black text-slate-700 capitalize flex items-center gap-2">
                        <CreditCard size={14} className="text-emerald-500" /> {pharmacy.subscription_tier}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Days Left</p>
                      <p className={`text-sm font-black flex items-center gap-2 ${pharmacy.days_until_expiry <= 3 ? 'text-red-600' : 'text-slate-700'}`}>
                        <Clock size={14} /> {pharmacy.days_until_expiry} Days
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Warning</p>
                      <p className={`text-sm font-black flex items-center gap-2 ${pharmacy.warning_sent ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {pharmacy.warning_sent ? <BadgeCheck size={14} /> : <Bell size={14} />} {pharmacy.warning_sent ? 'Sent' : 'Not Sent'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <User size={12} /> Owner Details
                      </p>
                      <p className="font-bold text-slate-800">{pharmacy.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Phone size={12} /> Contact Line
                      </p>
                      <p className="font-bold text-slate-800">{pharmacy.contact_phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin size={12} /> Physical Location
                    </p>
                    <p className="font-bold text-slate-800 leading-relaxed">{pharmacy.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {pharmacy.payment_receipt ? (
                    <button onClick={(e) => { e.stopPropagation(); setSelectedReceipt(pharmacy.payment_receipt!); }}
                      className="flex-1 py-4 px-6 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 border border-slate-200">
                      <Eye size={18} /> Receipt
                    </button>
                  ) : (
                    <div className="flex-1 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No receipt</p>
                    </div>
                  )}
                  {pharmacy.status === 'approved' && (
                    <button onClick={(e) => { e.stopPropagation(); handleSendWarning(pharmacy.id); }}
                      disabled={pharmacy.warning_sent}
                      className={`flex-1 py-4 px-6 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 border ${
                        pharmacy.warning_sent 
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      }`}>
                      <Bell size={18} /> {pharmacy.warning_sent ? 'Warning Sent' : 'Send Warning'}
                    </button>
                  )}
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                {filter === 'pending' ? (
                  <button onClick={(e) => { e.stopPropagation(); handleApprove(pharmacy.id); }}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                    <CheckCircle size={18} /> Approve & Activate
                  </button>
                ) : (
                  <div className="flex-1 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    Full visibility granted
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(pharmacy.id, pharmacy.name); }} 
                  className="px-6 py-4 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-2xl transition-all group-hover:border-red-200">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
            onClick={() => setSelectedReceipt(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] p-4 max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900">Payment Verification</h3>
                <button onClick={() => setSelectedReceipt(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-4 bg-slate-50/50 flex justify-center overflow-auto max-h-[70vh]">
                <img src={selectedReceipt} alt="Receipt" className="max-w-full h-auto rounded-3xl shadow-lg border border-white" />
              </div>
              <div className="p-8 text-center bg-white border-t border-slate-50">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Review the screenshot carefully before making account changes</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AuthGuard>
  );
}

function BadgeCheck({ size }: { size: number }) {
  return <ShieldCheck size={size} />
}
