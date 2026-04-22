'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Trash2, X, Save, AlertCircle, Pill, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { getCatalog, addCatalogItem } from '@/services/api';
import api from '@/services/api';

interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  description?: string;
  manufacturer?: string;
}

const CATEGORIES = ['Painkiller', 'Antibiotic', 'Diabetes', 'Antimalarial', 'Gastric', 'Vitamin', 'Respiratory', 'Hydration', 'Other'];

export default function AdminCatalogPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', generic_name: '', category: 'Painkiller', manufacturer: '', description: '' });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => { 
    fetchData(); 
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/medicines/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getCatalog();
      setMedicines(data);
    } catch (err) {
      setError('Could not sync with global catalog service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newItem = await addCatalogItem(form);
      setMedicines(prev => [newItem, ...prev]);
      setShowModal(false);
      setForm({ name: '', generic_name: '', category: 'Painkiller', manufacturer: '', description: '' });
    } catch (err) {
      alert('Failed to register medicine.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from master catalog? This affects all pharmacies.`)) return;
    try {
      await api.delete(`/medicines/catalog/${id}/`);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Global Registry"
        subtitle="Manage the master list of medicines available for all pharmacies in the network"
        breadcrumb={['Admin', 'Catalog']}
        action={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-500/20">
            <Plus size={18} /> Register Medicine
          </button>
        }
      />

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Search Registry</label>
          <Search size={18} className="absolute left-5 top-[52px] text-slate-300 pointer-events-none" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by brand, generic name or category…"
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] text-sm text-slate-900 placeholder-slate-400 outline-none transition-all border-2 border-slate-50 bg-white shadow-sm focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5"
          />
        </div>
        <div className="lg:col-span-4">
          <div className="bg-emerald-50 rounded-[1.5rem] p-4 flex items-center justify-between border border-emerald-100">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Master List Size</p>
              <p className="text-2xl font-black text-emerald-700">{medicines.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Pill size={22} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Syncing Catalog…</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700">
          <AlertCircle size={24} /> <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medicine Brand</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generic Formulation</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Therapeutic Class</th>
                  <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-24 text-slate-400 font-bold uppercase tracking-widest text-xs">No matching medicines</td></tr>
                ) : filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                    className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                          <Pill size={14} />
                        </div>
                        {m.name}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-500 italic">{m.generic_name || 'Not specified'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        {m.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(m.id, m.name)} className="p-3 rounded-xl bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Registry Entry</h3>
                  <p className="text-sm text-slate-400 mt-1">Add a medicine to the global master list</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Brand Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all" placeholder="e.g. Panadol" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Generic Formulation</label>
                    <input value={form.generic_name} onChange={e => setForm({...form, generic_name: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all" placeholder="e.g. Paracetamol" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Therapeutic Category</label>
                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all appearance-none cursor-pointer">
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Manufacturer</label>
                    <input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all" placeholder="e.g. GSK" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Image URL (Optional)</label>
                  <input value={(form as any).image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl text-sm text-slate-900 border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-emerald-500/30 outline-none transition-all" placeholder="https://api.ethio-pharma.com/images/med.jpg" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-sm transition-all">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                    {isSaving ? <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />} Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
