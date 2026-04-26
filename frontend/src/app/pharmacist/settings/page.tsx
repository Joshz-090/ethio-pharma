'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Eye, Moon, Globe, Shield, Save, CreditCard, Clock, CheckCircle2, AlertTriangle, Building, Camera, Calendar } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/services/api';

interface PharmacyProfile {
  id: string;
  name: string;
  subscription_tier: string;
  days_until_expiry: number;
  subscription_expiry: string | null;
  trial_expiry: string | null;
  is_subscription_valid: boolean;
  warning_sent: boolean;
  address: string;
  phone_number: string;
}

export default function PharmacistSettingsPage() {
  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // Fetch the pharmacy associated with the current user
      const response = await api.get('/pharmacies/my_pharmacy/');
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      await api.patch(`/pharmacies/${profile.id}/`, {
        name: profile.name,
        address: profile.address,
        phone_number: profile.phone_number
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard requiredRole="pharmacist">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Management Settings</h1>
            <p className="text-slate-500 font-medium mt-2">Update your pharmacy profile and monitor subscription health</p>
          </div>
          {profile && (
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
              profile.is_subscription_valid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              <Shield size={14} /> {profile.is_subscription_valid ? 'Verified Account' : 'Action Required'}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Loading Preferences…</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Subscription Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <CreditCard size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Subscription & Billing</h3>
                  </div>
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {profile?.subscription_tier} Package
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Clock size={12} /> Status
                    </p>
                    <p className={`text-lg font-black ${profile?.is_subscription_valid ? 'text-emerald-600' : 'text-red-600'}`}>
                      {profile?.is_subscription_valid ? 'Active' : 'Expired'}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Calendar size={12} /> Time Remaining
                    </p>
                    <p className={`text-lg font-black ${(profile?.days_until_expiry || 0) <= 3 ? 'text-red-600' : 'text-slate-900'}`}>
                      {profile?.days_until_expiry} Days
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertTriangle size={12} /> Expiry Date
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {profile?.subscription_expiry || profile?.trial_expiry || 'N/A'}
                    </p>
                  </div>
                </div>

                {profile?.warning_sent && (
                  <div className="mt-6 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                    <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-amber-900 text-sm">Payment Warning from Admin</p>
                      <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                        The administrator has flagged your account for payment verification. Please ensure your subscription is renewed to avoid service interruption.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upgrade or renew your plan anytime</p>
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-all">
                  Switch Plan
                </button>
              </div>
            </div>

            {/* Profile Update */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <form onSubmit={handleUpdateProfile}>
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <Building size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Pharmacy Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Business Name</label>
                        <input 
                          required 
                          value={profile?.name || ''} 
                          onChange={e => profile && setProfile({...profile, name: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Contact Phone</label>
                        <input 
                          required 
                          value={profile?.phone_number || ''} 
                          onChange={e => profile && setProfile({...profile, phone_number: e.target.value})}
                          className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Physical Address</label>
                      <textarea 
                        required 
                        rows={5}
                        value={profile?.address || ''} 
                        onChange={e => profile && setProfile({...profile, address: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500/30 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
