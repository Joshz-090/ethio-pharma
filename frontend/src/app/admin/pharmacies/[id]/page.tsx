'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Building2, Save, ArrowLeft, Trash2, Calendar, Phone, MapPin, User, Mail, CreditCard, Shield, AlertCircle, Clock, FileBadge } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';
import api from '@/services/api';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-2xl" />
});

interface Pharmacy {
  id: string;
  name: string;
  license_number: string;
  address: string;
  phone_number: string;
  status: string;
  subscription_tier: string;
  subscription_expiry: string;
  trial_expiry: string;
  owner_name: string;
  owner_email: string;
  latitude: string;
  longitude: string;
  verification_doc: string;
  payment_receipt: string;
  days_until_expiry: number;
  needs_warning: boolean;
  is_subscription_valid: boolean;
  average_rating: number;
  created_at: string;
}

export default function AdminPharmacyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPharmacy();
  }, [id]);

  const fetchPharmacy = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/pharmacies/${id}/`);
      setPharmacy(response.data);
    } catch (err) {
      setError('Could not load pharmacy details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacy) return;
    setIsSaving(true);
    try {
      // Clean payload: remove read-only and calculated fields
      const { id, owner_email, days_until_expiry, needs_warning, is_subscription_valid, average_rating, created_at, ...cleanData } = pharmacy;
      
      await api.patch(`/pharmacies/${id}/`, cleanData);
      alert('Pharmacy updated successfully!');
      router.push('/admin/pharmacies');
    } catch (err) {
      alert('Failed to update pharmacy.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="space-y-8 pb-24 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
        <div className="space-y-2">
          <div className="w-64 h-8 bg-slate-100 rounded-lg" />
          <div className="w-48 h-4 bg-slate-50 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[300px] bg-slate-50 rounded-[3rem] border border-slate-100" />
          <div className="h-[400px] bg-slate-50 rounded-[3rem] border border-slate-100" />
        </div>
        <div className="space-y-8">
          <div className="h-[350px] bg-slate-900 rounded-[3rem]" />
          <div className="h-[60px] bg-slate-100 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );

  if (error || !pharmacy) return (
    <div className="p-12 text-center bg-red-50 rounded-[3rem] border border-red-100">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h3 className="text-xl font-black text-red-900">{error || 'Data missing'}</h3>
      <button onClick={() => router.back()} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold">Go Back</button>
    </div>
  );

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 pb-24">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{pharmacy.name}</h1>
            <p className="text-slate-500 font-medium mt-1">Detailed management and subscription control</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Core Info */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Building2 size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Business Profile</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Pharmacy Name</label>
                    <input required value={pharmacy.name || ''} onChange={e => setPharmacy({...pharmacy, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">License Number</label>
                    <input required value={pharmacy.license_number || ''} onChange={e => setPharmacy({...pharmacy, license_number: e.target.value})} className="w-full px-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                    <input required value={pharmacy.phone_number || ''} onChange={e => setPharmacy({...pharmacy, phone_number: e.target.value})} className="w-full px-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Physical Address</label>
                    <textarea required rows={1} value={pharmacy.address || ''} onChange={e => setPharmacy({...pharmacy, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all resize-none" />
                  </div>
                </div>
              </div>

              {/* MAP SECTION */}
              <div className="mt-10 pt-10 border-t border-slate-50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Geographic Coordinates (for Mobile App)</label>
                <MapPicker 
                  lat={Number(pharmacy.latitude) || 0} 
                  lng={Number(pharmacy.longitude) || 0} 
                  onChange={(lat, lng) => setPharmacy({...pharmacy, latitude: String(lat), longitude: String(lng)})} 
                />
                <div className="mt-4 flex gap-4">
                  <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Latitude</p>
                    <p className="text-sm font-bold text-slate-700">{pharmacy.latitude}</p>
                  </div>
                  <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Longitude</p>
                    <p className="text-sm font-bold text-slate-700">{pharmacy.longitude}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                  <FileBadge size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Verification Documents</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Pharmacist ID / License</label>
                  {pharmacy.verification_doc ? (
                    <a href={pharmacy.verification_doc} target="_blank" className="block p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all group">
                      <div className="flex flex-col items-center gap-2">
                        <FileBadge size={24} className="text-slate-300 group-hover:text-purple-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View ID Document</p>
                      </div>
                    </a>
                  ) : (
                    <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-2">
                      <Clock size={24} className="text-slate-200" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Not Provided</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Payment Receipt</label>
                  {pharmacy.payment_receipt ? (
                    <a href={pharmacy.payment_receipt} target="_blank" className="block p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard size={24} className="text-slate-300 group-hover:text-emerald-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View Receipt</p>
                      </div>
                    </a>
                  ) : (
                    <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-2">
                      <Clock size={24} className="text-slate-200" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Not Provided</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Control */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Subscription Management</h3>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Service Tier</label>
                  <select value={pharmacy.subscription_tier} onChange={e => setPharmacy({...pharmacy, subscription_tier: e.target.value})} className="w-full px-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all appearance-none cursor-pointer">
                    <option value="trial">Free Trial (1 Month)</option>
                    <option value="1year">1 Year (999 Birr)</option>
                    <option value="2year">2 Years (1699 Birr)</option>
                    <option value="5year">5 Years (2299 Birr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Status</label>
                  <select value={pharmacy.status} onChange={e => setPharmacy({...pharmacy, status: e.target.value})} className="w-full px-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all appearance-none cursor-pointer">
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved & Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-50">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Manual Trial Expiry</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="date" value={pharmacy.trial_expiry || ''} onChange={e => setPharmacy({...pharmacy, trial_expiry: e.target.value})} className="w-full pl-14 pr-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Manual Subscription Expiry</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="date" value={pharmacy.subscription_expiry || ''} onChange={e => setPharmacy({...pharmacy, subscription_expiry: e.target.value})} className="w-full pl-14 pr-6 py-4 rounded-2xl text-sm border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                <Shield size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Account Owner</h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">This pharmacy is linked to the following primary user account.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400">
                    <User size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 ml-1">Full Name</p>
                    <input 
                      value={pharmacy.owner_name || ''} 
                      onChange={e => setPharmacy({...pharmacy, owner_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="Owner Name"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email Address</p>
                    <p className="font-bold text-sm truncate max-w-[160px] text-white/60">{pharmacy.owner_email}</p>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2.5rem] font-black transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3">
              {isSaving ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
              Apply All Changes
            </button>

            <button type="button" onClick={() => router.back()} className="w-full py-5 bg-white border border-slate-200 text-slate-500 rounded-[2.5rem] font-black hover:bg-slate-50 transition-all">
              Cancel & Exit
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
