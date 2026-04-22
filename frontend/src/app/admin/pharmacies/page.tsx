'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle, XCircle, MapPin, Phone, User, Eye, AlertCircle, Calendar, ShieldCheck, ExternalLink, UserPlus, Key, Mail, Lock, RefreshCw, FileBadge, Info, Map as MapIcon, Link2, ShoppingCart } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';
import { getPharmacies, approvePharmacy, getUsers, registerUser } from '@/services/api';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR errors
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

import 'leaflet/dist/leaflet.css';

interface Pharmacy {
  id: string;
  name: string;
  owner_name: string;
  owner_email?: string;
  contact_phone: string;
  phone_number: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  payment_receipt?: string;
  verification_doc?: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  tax_id?: string;
  license_number?: string;
}

interface UserProfile {
  id: string;
  role: string;
  pharmacy: string | null;
}

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified'>('pending');
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, title: string } | null>(null);
  const [viewingPharmacy, setViewingPharmacy] = useState<Pharmacy | null>(null);
  
  const [isCreatingAccount, setIsCreatingAccount] = useState<Pharmacy | null>(null);
  const [accountForm, setAccountForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pData, uData] = await Promise.all([getPharmacies(), getUsers()]);
      setPharmacies(pData);
      setUsers(uData);
    } catch (err) {
      setError('Could not load pharmacy data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this pharmacy and grant dashboard access?')) return;
    try {
      await approvePharmacy(id);
      setViewingPharmacy(null);
      fetchData();
    } catch (err) {
      alert('Failed to approve pharmacy.');
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCreatingAccount) return;
    
    try {
      setIsSubmitting(true);
      await registerUser({
        username: accountForm.email,
        email: accountForm.email,
        password: accountForm.password,
        role: 'pharmacist',
        pharmacy_id: isCreatingAccount.id
      });

      alert(`Account created successfully for ${isCreatingAccount.name}!`);
      setIsCreatingAccount(null);
      setAccountForm({ email: '', password: '' });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create account. Email might already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pharmacyHasOwner = (pharmacyId: string) => {
    return users.some(u => u.role === 'pharmacist' && String(u.pharmacy) === String(pharmacyId));
  };

  const filtered = pharmacies.filter(p => {
    if (filter === 'verified') return p.status === 'approved';
    return p.status === filter;
  });

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 pb-12">
        <style dangerouslySetInnerHTML={{ __html: `
          .leaflet-container { height: 100%; width: 100%; border-radius: 24px; z-index: 10; }
        `}} />

        <PageHeader
          title="Pharmacy Onboarding"
          subtitle="Review detailed applications and verify geographical locations in Arba Minch"
          breadcrumb={['Admin', 'Network']}
        />

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
          {(['pending', 'approved'] as const).map((status) => (
            <button key={status} onClick={() => setFilter(status === 'approved' ? 'verified' : 'pending' as any)}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 ${
                (filter === 'verified' && status === 'approved') || (filter === 'pending' && status === 'pending') ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-600'
              }`}>
              {status === 'approved' ? 'Verified' : 'Pending'}
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
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Syncing Records…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filtered.map((pharmacy) => {
              const hasAccount = pharmacyHasOwner(pharmacy.id);
              return (
                <motion.div key={pharmacy.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  
                  <div className="p-10 flex-1">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <Building2 size={24} className="text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{pharmacy.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">
                            Joined {new Date(pharmacy.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setViewingPharmacy(pharmacy)}
                        className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
                      >
                        <Info size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={12} /> Applicant</p>
                        <p className="font-bold text-slate-800">{pharmacy.owner_name}</p>
                        <p className="text-xs text-slate-500 mt-1">{pharmacy.owner_email || 'No email provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={12} /> Address</p>
                        <p className="font-bold text-slate-800 text-xs leading-relaxed line-clamp-2">{pharmacy.address}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                       <button onClick={() => setViewingPharmacy(pharmacy)}
                         className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                         <Eye size={16} /> Review Data
                       </button>
                       {pharmacy.status === 'pending' && (
                         <button onClick={() => handleApprove(pharmacy.id)}
                           className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                           <CheckCircle size={16} /> Approve
                         </button>
                       )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Detailed Review Modal */}
        <AnimatePresence>
          {viewingPharmacy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
                className="bg-white rounded-[3rem] max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{viewingPharmacy.name}</h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Full Application Review</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingPharmacy(null)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Data Section */}
                    <div className="space-y-10">
                      <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Building2 size={14} className="text-emerald-600" /> Business Credentials
                        </h3>
                        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">License Number</p>
                            <p className="font-bold text-slate-900">{viewingPharmacy.license_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Tax ID / TIN</p>
                            <p className="font-bold text-slate-900">{viewingPharmacy.tax_id || 'N/A'}</p>
                          </div>
                          <div className="col-span-2 pt-4 border-t border-slate-200/50">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Physical Address</p>
                            <p className="font-bold text-slate-900 text-sm">{viewingPharmacy.address}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <User size={14} className="text-blue-600" /> Ownership Details
                        </h3>
                        <div className="grid grid-cols-2 gap-6 bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Full Name</p>
                            <p className="font-bold text-slate-900">{viewingPharmacy.owner_name}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Phone Number</p>
                            <p className="font-bold text-slate-900">{viewingPharmacy.phone_number || viewingPharmacy.contact_phone}</p>
                          </div>
                          <div className="col-span-2 pt-4 border-t border-blue-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Email Address</p>
                            <p className="font-bold text-slate-900">{viewingPharmacy.owner_email || 'Not verified'}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <FileBadge size={14} className="text-amber-600" /> Submitted Documents
                        </h3>
                        <div className="flex gap-4">
                          {viewingPharmacy.verification_doc && (
                            <button onClick={() => setSelectedDoc({ url: viewingPharmacy.verification_doc!, title: 'Legal License' })}
                              className="flex-1 p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 transition-all flex flex-col items-center gap-3">
                              <FileBadge size={32} className="text-emerald-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">View License</span>
                            </button>
                          )}
                          {viewingPharmacy.payment_receipt && (
                            <button onClick={() => setSelectedDoc({ url: viewingPharmacy.payment_receipt!, title: 'Payment Receipt' })}
                              className="flex-1 p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 transition-all flex flex-col items-center gap-3">
                              <ShoppingCart size={32} className="text-amber-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">View Receipt</span>
                            </button>
                          )}
                        </div>
                      </section>
                    </div>

                    {/* Map Section */}
                    <div className="flex flex-col h-full">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapIcon size={14} className="text-red-600" /> Precise Location (Arba Minch)
                      </h3>
                      <div className="flex-1 min-h-[400px] bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner relative">
                        {viewingPharmacy.latitude && viewingPharmacy.longitude ? (
                          <MapContainer 
                            center={[Number(viewingPharmacy.latitude), Number(viewingPharmacy.longitude)]} 
                            zoom={15} 
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[Number(viewingPharmacy.latitude), Number(viewingPharmacy.longitude)]} />
                          </MapContainer>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-4">
                            <AlertCircle size={48} />
                            <p className="font-black text-xs uppercase tracking-widest">No Coordinates Pinned</p>
                          </div>
                        )}
                        
                        <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white flex justify-between items-center z-[1000]">
                           <div className="flex gap-4">
                             <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase">Latitude</p>
                               <p className="text-xs font-bold text-slate-900">{Number(viewingPharmacy.latitude).toFixed(6)}</p>
                             </div>
                             <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase">Longitude</p>
                               <p className="text-xs font-bold text-slate-900">{Number(viewingPharmacy.longitude).toFixed(6)}</p>
                             </div>
                           </div>
                           <a 
                             href={`https://www.google.com/maps?q=${viewingPharmacy.latitude},${viewingPharmacy.longitude}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                           >
                             <ExternalLink size={16} />
                           </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                {viewingPharmacy.status === 'pending' && (
                  <div className="p-8 border-t border-slate-50 flex gap-4 bg-white">
                    <button 
                      onClick={() => setViewingPharmacy(null)}
                      className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-3xl font-black uppercase tracking-widest transition-all">
                      Close Review
                    </button>
                    <button 
                      onClick={() => handleApprove(viewingPharmacy.id)}
                      className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3">
                      <CheckCircle size={20} /> Approve Business & Grant Access
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Account Modal */}
        <AnimatePresence>
          {isCreatingAccount && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-[3rem] p-10 max-w-lg w-full flex flex-col shadow-2xl overflow-hidden relative">
                
                <div className="absolute top-0 right-0 p-8">
                  <button onClick={() => setIsCreatingAccount(null)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="mb-10">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-600/30">
                    <Key size={30} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Login</h2>
                  <p className="text-slate-500 mt-2 font-medium">Set credentials for <span className="text-emerald-600 font-bold">{isCreatingAccount.name}</span></p>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={accountForm.email}
                        onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all font-bold text-slate-900"
                        placeholder="pharmacist@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={accountForm.password}
                        onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all font-bold text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50">
                    {isSubmitting ? <RefreshCw className="animate-spin" /> : 'Activate Account Now'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Viewer Modal */}
        <AnimatePresence>
          {selectedDoc && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md"
              onClick={() => setSelectedDoc(null)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-[3rem] p-4 max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
                  <h3 className="text-xl font-black text-slate-900">{selectedDoc.title}</h3>
                  <button onClick={() => setSelectedDoc(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>
                <div className="p-4 bg-slate-50/50 flex justify-center overflow-auto max-h-[70vh]">
                  {selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-6">
                      <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                        <FileBadge size={48} />
                      </div>
                      <p className="font-bold text-slate-600 text-lg">PDF Document Detected</p>
                      <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer" 
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3">
                        <ExternalLink size={18} /> Open PDF in New Tab
                      </a>
                    </div>
                  ) : (
                    <img src={selectedDoc.url} alt="Document" className="max-w-full h-auto rounded-3xl shadow-lg border border-white" />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}
