'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle, XCircle, MapPin, Phone, User, Eye, AlertCircle, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import api, { getPharmacies, approvePharmacy } from '@/services/api';

interface Pharmacy {
  id: string;
  name: string;
  owner_name: string;
  contact_phone: string;
  address: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  payment_receipt?: string;
  created_at: string;
}

export default function AdminPharmaciesPage() {
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
      setPharmacies(prev => prev.map(p => p.id === id ? { ...p, verification_status: 'verified' } : p));
    } catch (err) {
      alert('Failed to approve pharmacy.');
    }
  };

  const filtered = pharmacies.filter(p => p.verification_status === filter);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Network Onboarding"
        subtitle="Review pharmacy applications and verify manual payment receipts for platform activation"
        breadcrumb={['Admin', 'Pharmacies']}
      />

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
        {(['pending', 'verified'] as const).map((status) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 ${
              filter === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'
            }`}>
            {status}
            {status === 'pending' && pharmacies.filter(p => p.verification_status === 'pending').length > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                filter === status ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {pharmacies.filter(p => p.verification_status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Loading Applications…</p>
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
          <h3 className="text-2xl font-black text-slate-900">No {filter} applications</h3>
          <p className="text-slate-500 mt-2">New registration requests will appear here for your review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filtered.map((pharmacy) => (
            <motion.div key={pharmacy.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              
              <div className="p-10 flex-1">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{pharmacy.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        <Calendar size={12} /> {new Date(pharmacy.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  {pharmacy.verification_status === 'verified' && (
                    <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100 flex items-center gap-2">
                      <ShieldCheck size={14} /> Verified SaaS
                    </span>
                  )}
                </div>

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

                {pharmacy.payment_receipt ? (
                  <button onClick={() => setSelectedReceipt(pharmacy.payment_receipt!)}
                    className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 border border-slate-100">
                    <Eye size={18} /> View Payment Receipt <ExternalLink size={14} className="opacity-40" />
                  </button>
                ) : (
                  <div className="w-full py-4 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No receipt uploaded</p>
                  </div>
                )}
              </div>

              {filter === 'pending' && (
                <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                  <button onClick={() => handleApprove(pharmacy.id)}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
                    <CheckCircle size={18} /> Approve & Activate
                  </button>
                  <button className="px-6 py-4 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-2xl transition-all">
                    <XCircle size={18} />
                  </button>
                </div>
              )}
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
                <h3 className="text-xl font-black text-slate-900">Manual Payment Verification</h3>
                <button onClick={() => setSelectedReceipt(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-4 bg-slate-50/50 flex justify-center overflow-auto max-h-[70vh]">
                <img src={selectedReceipt} alt="Receipt" className="max-w-full h-auto rounded-3xl shadow-lg border border-white" />
              </div>
              <div className="p-8 text-center bg-white border-t border-slate-50">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Review the Telebirr / Bank screenshot carefully before approval</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
