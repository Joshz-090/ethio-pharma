'use client';
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion as m, AnimatePresence as AP } from 'framer-motion';
import { X, Plus, Search, Pill, Check, Camera, Scan, BarChart3, AlertCircle, Info, Database, Layers } from 'lucide-react';
import { getCatalog, addInventoryItem } from '@/services/api';

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ open, onClose, onSuccess }: AddStockModalProps) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState<any | null>(null);
  
  // New Architectural Fields
  const [quantity, setQuantity] = useState(100);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(10);
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isOcrVerified, setIsOcrVerified] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'automation'>('details');

  useEffect(() => {
    if (open) {
      fetchCatalog();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedMed(null);
    setSearch('');
    setQuantity(100);
    setCostPrice(0);
    setSellingPrice(0);
    setReorderLevel(10);
    setBatchNo('');
    setExpiryDate('');
    setIsOcrVerified(false);
    setActiveTab('details');
  };

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await getCatalog();
      setCatalog(data);
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOCR = () => {
    setIsScanning(true);
    // Simulated AI processing delay
    setTimeout(() => {
      setBatchNo(`BN-${Math.floor(Math.random() * 9000 + 1000)}`);
      setExpiryDate('2027-12-31');
      setIsOcrVerified(true);
      setIsScanning(false);
    }, 2000);
  };

  const profitMargin = sellingPrice > 0 ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1) : '0.0';

  const handleAdd = async () => {
    if (!selectedMed) return;
    setSaving(true);
    try {
      const payload = {
        medicine_id: selectedMed.id,
        quantity,
        price: sellingPrice,
        cost_price: costPrice,
        reorder_level: reorderLevel,
        batch_number: batchNo,
        expiry_date: expiryDate,
        is_ocr_verified: isOcrVerified
      };
      await addInventoryItem(payload);
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to add stock. Check for duplicate entries or network issues.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalog = catalog.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.generic_name?.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = "w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none";
  const labelStyle = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AP>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <m.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <m.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[401] w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      <Plus size={24} />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-black text-white tracking-tight">Medication Module</Dialog.Title>
                      <p className="text-slate-500 text-xs font-medium">Add new pharmaceutical entry to localized registry</p>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button className="p-2 hover:bg-slate-900 rounded-full text-slate-500 transition-colors">
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>

                {!selectedMed ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        placeholder="Search global medication database..." 
                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {isLoading ? (
                        <div className="py-20 text-center">
                          <div className="w-8 h-8 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Accessing Catalog…</p>
                        </div>
                      ) : filteredCatalog.length === 0 ? (
                        <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                          <Info className="mx-auto text-slate-600 mb-2" size={32} />
                          <p className="text-slate-500 text-sm font-medium">No medication found in global registry</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredCatalog.map(m => (
                            <button 
                              key={m.id} 
                              onClick={() => setSelectedMed(m)}
                              className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-transparent hover:border-blue-500/30 hover:bg-slate-900 transition-all text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                                <Pill size={18} />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-black text-white">{m.name}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.category?.name || 'Uncategorized'}</div>
                              </div>
                              <Plus className="text-slate-700 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" size={16} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {/* Selected Med Banner */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Check size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{selectedMed.name}</div>
                          <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Active Selection</div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedMed(null)} className="px-4 py-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/10 rounded-xl transition-all">Change</button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                      <button 
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'details' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        <div className="flex items-center justify-center gap-2"><Database size={12}/> Core Fields</div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('automation')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'automation' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        <div className="flex items-center justify-center gap-2"><Scan size={12}/> AI/OCR Modules</div>
                      </button>
                    </div>

                    {activeTab === 'details' ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelStyle}>Initial Stock Count</label>
                            <input type="number" className={inputStyle} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                          </div>
                          <div>
                            <label className={labelStyle}>Reorder Level (Alert)</label>
                            <div className="relative">
                              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                              <input type="number" className={inputStyle} value={reorderLevel} onChange={e => setReorderLevel(Number(e.target.value))} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className={labelStyle}>Cost Price</label>
                            <input type="number" className={inputStyle} value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={labelStyle}>Selling Price</label>
                            <input type="number" className={inputStyle} value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} placeholder="0.00" />
                          </div>
                          <div className="flex flex-col justify-end">
                            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Margin</span>
                              <span className={`text-xs font-black ${Number(profitMargin) > 20 ? 'text-emerald-500' : 'text-amber-500'}`}>{profitMargin}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 border-dashed text-center">
                          {isScanning ? (
                            <div className="py-6">
                              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                              <p className="text-purple-400 text-xs font-black uppercase tracking-widest animate-pulse">Processing Pharmaceutical Image…</p>
                            </div>
                          ) : isOcrVerified ? (
                            <div className="py-4">
                              <Check className="mx-auto text-emerald-500 mb-2" size={32} />
                              <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">OCR Data Extracted & Verified</p>
                              <button onClick={() => setIsOcrVerified(false)} className="text-[10px] text-slate-500 hover:text-white mt-2 font-bold uppercase tracking-widest">Retake Scan</button>
                            </div>
                          ) : (
                            <div className="py-4">
                              <Camera className="mx-auto text-slate-700 mb-4" size={40} />
                              <button 
                                onClick={simulateOCR}
                                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20"
                              >
                                <Scan className="inline-block mr-2" size={14} /> Start AI Scanner
                              </button>
                              <p className="text-slate-600 text-[10px] mt-4 font-medium italic">Extract Batch No, Expiry & ID automatically</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelStyle}>Batch Number</label>
                            <input className={inputStyle} value={batchNo} onChange={e => setBatchNo(e.target.value)} placeholder="e.g. BN-X99" />
                          </div>
                          <div>
                            <label className={labelStyle}>Expiry Date</label>
                            <input type="date" className={inputStyle} value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-4 mt-10">
                      <button 
                        onClick={() => setSelectedMed(null)}
                        className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-black text-slate-500 hover:text-white transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={handleAdd}
                        disabled={saving || !sellingPrice}
                        className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Layers size={18} />}
                        Commit to Inventory
                      </button>
                    </div>
                  </m.div>
                )}
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AP>
    </Dialog.Root>
  );
}
