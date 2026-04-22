'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, UserPlus, Mail, Shield, MapPin, 
  MoreVertical, Edit2, Trash2, Key, 
  ChevronRight, RefreshCw, XCircle, CheckCircle,
  Building2, Phone, AlertCircle
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';
import { getUsers, getPharmacies, deleteUser } from '@/services/api';

interface UserProfile {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  role: 'admin' | 'pharmacist' | 'patient';
  pharmacy: string | null;
  phone_number: string;
}

interface Pharmacy {
  id: string;
  name: string;
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  // Modals
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [uData, pData] = await Promise.all([getUsers(), getPharmacies()]);
      setProfiles(uData);
      setPharmacies(pData);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      setProfiles(prev => prev.filter(p => p.id !== userId));
      setIsDeleting(null);
      alert('User removed successfully.');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user. Please check your permissions.');
    }
  };

  const handleResetPassword = async (email: string) => {
    alert(`Reset link sent to ${email} (Demo Logic)`);
    // In production: await axios.post('/api/password-reset/', { email });
  };

  const filtered = profiles.filter(p => {
    const matchesSearch = p.user.username.toLowerCase().includes(search.toLowerCase()) || 
                         p.user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.role.toUpperCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const getPharmacyName = (id: string | null) => {
    if (!id) return null;
    return pharmacies.find(p => p.id === id)?.name || 'Unknown Pharmacy';
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 pb-20">
        <PageHeader 
          title="User Management"
          subtitle="Manage platform accounts, verify identities, and control system access levels"
          breadcrumb={['Admin', 'Users']}
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
            {['ALL', 'PHARMACIST', 'PATIENT', 'ADMIN'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  filter === f 
                    ? f === 'ADMIN' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' :
                      f === 'PHARMACIST' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' :
                      'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-slate-600'
                }`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-50 bg-white focus:border-emerald-500/20 outline-none transition-all font-bold text-slate-700 shadow-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-10 py-6 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="col-span-4">Account Info</div>
            <div className="col-span-3">Platform Role</div>
            <div className="col-span-3">Contact Details</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-50">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="animate-spin text-emerald-600" size={32} />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Records…</p>
              </div>
            ) : filtered.map((profile, i) => (
              <motion.div 
                key={profile.id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-12 px-10 py-8 items-center hover:bg-slate-50/50 transition-colors group border-l-[6px] ${
                  profile.role === 'admin' ? 'border-purple-500' :
                  profile.role === 'pharmacist' ? 'border-blue-500' :
                  'border-emerald-500'
                }`}
              >
                {/* Info */}
                <div className="col-span-4 flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${
                    profile.role === 'admin' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-purple-500/20' :
                    profile.role === 'pharmacist' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/20' :
                    'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                  }`}>
                    {profile.user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{profile.user.username}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Mail size={12} /> {profile.user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    profile.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                    profile.role === 'pharmacist' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {profile.role}
                  </span>
                  {profile.role === 'pharmacist' && (
                    <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1.5">
                      <Building2 size={10} /> {getPharmacyName(profile.pharmacy) || 'Independent'}
                    </p>
                  )}
                </div>

                {/* Contact */}
                <div className="col-span-3 space-y-1.5">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Phone size={14} className="text-slate-300" /> {profile.phone_number || 'No phone'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-slate-300" /> Local Resident
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button onClick={() => setEditingUser(profile)}
                    className="p-3 bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-all shadow-sm">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleResetPassword(profile.user.email)}
                    className="p-3 bg-white hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl border border-slate-100 transition-all shadow-sm">
                    <Key size={16} />
                  </button>
                  <button onClick={() => setIsDeleting(profile)}
                    className="p-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-100 transition-all shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-600">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Remove Account?</h3>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium">
                  Are you sure you want to delete <span className="text-red-600 font-black">{isDeleting.user.username}</span>? This action is permanent and will revoke all access immediately.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button onClick={() => setIsDeleting(null)}
                    className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest transition-all">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(isDeleting.id)}
                    className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20">
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit User Modal (Mock Implementation for UI demo) */}
        <AnimatePresence>
          {editingUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl relative">
                <button onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors">
                  <XCircle size={32} />
                </button>
                
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Edit Access</h3>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Role</label>
                    <select className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-emerald-500/20">
                      <option value="patient">Patient</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Pharmacy</label>
                    <select className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-emerald-500/20">
                      <option value="">None (Independent)</option>
                      {pharmacies.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => { alert('Changes saved!'); setEditingUser(null); }}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}
