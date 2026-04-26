'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, MapPin, ShieldCheck, Camera, Edit3 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { getUserProfile } from '@/services/api';

export default function PharmacistProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <AuthGuard requiredRole="pharmacist">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your professional identity and pharmacy credentials</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar & Basics */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white">
                  {profile?.username?.substring(0, 2).toUpperCase() || 'PH'}
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-6 tracking-tight">{profile?.username}</h3>
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest mt-1">Certified Pharmacist</p>
              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-center gap-4">
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
              <h4 className="text-lg font-black text-slate-900 mb-8 tracking-tight">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </p>
                  <p className="font-bold text-slate-800">{profile?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} /> Phone Number
                  </p>
                  <p className="font-bold text-slate-800">{profile?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={12} /> Pharmacy
                  </p>
                  <p className="font-bold text-slate-800">Arba Minch Sikela Pharmacy</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Work Location
                  </p>
                  <p className="font-bold text-slate-800">Sikela District, Arba Minch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
