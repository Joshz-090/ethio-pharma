'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Shield, Mail, Calendar, AlertCircle, Search, Filter, MoreVertical, BadgeCheck, UserMinus, UserPlus, ShieldAlert, ShieldCheck as ShieldCheckIcon } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AuthGuard from '@/components/AuthGuard';
import { getUsers, updateUser } from '@/services/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'patient';
  is_active: boolean;
  date_joined: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    
    // Close menu on click outside
    const handleClick = () => setActiveMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Could not load user profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      const newStatus = !user.is_active;
      await updateUser(user.id, { is_active: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  const handleChangeRole = async (user: UserProfile, newRole: string) => {
    try {
      await updateUser(user.id, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole as any } : u));
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 pb-12">
        <PageHeader
          title="User Management"
          subtitle="Monitor and manage all system participants and their assigned roles"
          breadcrumb={['Admin', 'Users']}
        />

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Scanning Users…</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700">
            <AlertCircle size={24} /> <p className="font-bold">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No users found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className={`hover:bg-slate-50/50 transition-colors ${activeMenu === user.id ? 'z-50 relative' : 'z-0'}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white ${
                            user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                            user.role === 'pharmacist' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            {(user.username || '??').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.username || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {user.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          user.role === 'admin' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : user.role === 'pharmacist'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {user.role === 'admin' ? <Shield size={12} /> : user.role === 'pharmacist' ? <User size={12} /> : <Users size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.is_active ? <BadgeCheck size={12} /> : null}
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right relative overflow-visible">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === user.id ? null : user.id); }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenu === user.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, x: 10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9, x: 10 }}
                              className="absolute right-full top-0 mr-4 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] overflow-hidden p-1.5"
                              style={{ transformOrigin: 'right top' }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                                User Actions
                              </div>
                              
                              <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                  user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {user.is_active ? <><UserMinus size={16} /> Deactivate Account</> : <><UserPlus size={16} /> Activate Account</>}
                              </button>

                              <div className="h-px bg-slate-50 my-1" />

                              <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Switch Role
                              </div>

                              <button 
                                onClick={() => handleChangeRole(user, 'pharmacist')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                  user.role === 'pharmacist' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <User size={16} /> Set as Pharmacist
                              </button>

                              <button 
                                onClick={() => handleChangeRole(user, 'admin')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                  user.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <ShieldCheckIcon size={16} /> Set as Admin
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
