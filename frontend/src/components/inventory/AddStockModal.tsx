'use client';
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Search } from 'lucide-react';
import api, { getCatalog } from '@/services/api';

interface AddStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newItem: any) => void;
}

export default function AddStockModal({ open, onClose, onSuccess }: AddStockModalProps) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    medicine_id: '',
    price: '',
    quantity: '',
    brand: '',
    strength: '',
    route: '',
    batch_number: '',
    expiry_date: ''
  });

  useEffect(() => {
    if (open) {
      fetchCatalog();
    }
  }, [open]);

  const fetchCatalog = async () => {
    try {
      const data = await getCatalog();
      setCatalog(data);
    } catch (err) {
      console.error('Failed to fetch catalog', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicine_id || !formData.price || !formData.quantity) {
      alert('Please fill out required fields.');
      return;
    }
    
    setSaving(true);
    try {
      const payload: any = {
        medicine_id: formData.medicine_id,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
      };
      
      // Add optional fields only if they are not empty
      if (formData.brand) payload.brand = formData.brand;
      if (formData.strength) payload.strength = formData.strength;
      if (formData.route) payload.route = formData.route;
      if (formData.batch_number) payload.batch_number = formData.batch_number;
      if (formData.expiry_date) payload.expiry_date = formData.expiry_date;
      
      const res = await api.post('/medicines/inventory/', payload);
      onSuccess(res.data);
      onClose();
      setFormData({
        medicine_id: '', price: '', quantity: '', brand: '', 
        strength: '', route: '', batch_number: '', expiry_date: ''
      });
    } catch (err: any) {
      console.error('Failed to add stock', err.response?.data || err);
      alert('Failed to add stock. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--color-bg-base)', border: '1px solid var(--color-border-bright)',
    borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)',
    fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6, display: 'block',
  };

  const filteredCatalog = catalog.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 400,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{
                  position: 'fixed', top: '50%', left: '50%',
                  zIndex: 401,
                  width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-bright)',
                  borderRadius: 'var(--radius-xl)', padding: 28,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Plus size={18} color="#0ea5e9" />
                    </div>
                    <div>
                      <Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                        Add New Stock
                      </Dialog.Title>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        Add an item from the global catalog to your inventory.
                      </p>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button style={{
                      width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--color-text-secondary)',
                    }}>
                      <X size={14} />
                    </button>
                  </Dialog.Close>
                </div>

                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    
                    {/* Medicine Selection */}
                    <div>
                      <label style={labelStyle}>Select Medicine *</label>
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
                        <input 
                          type="text" 
                          placeholder="Search catalog..." 
                          value={search} 
                          onChange={e => setSearch(e.target.value)}
                          style={{ ...inputStyle, paddingLeft: 36 }}
                        />
                      </div>
                      <select 
                        required
                        value={formData.medicine_id}
                        onChange={e => setFormData({...formData, medicine_id: e.target.value})}
                        style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                      >
                        <option value="">-- Choose a medicine --</option>
                        {filteredCatalog.map(m => (
                          <option key={m.id} value={m.id}>{m.name} {m.generic_name ? `(${m.generic_name})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price and Quantity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Price (ETB) *</label>
                        <input type="number" required min={0} step={0.01} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Quantity *</label>
                        <input type="number" required min={1} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                    {/* Optional Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Brand (Optional)</label>
                        <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={inputStyle} placeholder="e.g. GS-Amox" />
                      </div>
                      <div>
                        <label style={labelStyle}>Strength (Optional)</label>
                        <input type="text" value={formData.strength} onChange={e => setFormData({...formData, strength: e.target.value})} style={inputStyle} placeholder="e.g. 500mg" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Batch Number (Optional)</label>
                        <input type="text" value={formData.batch_number} onChange={e => setFormData({...formData, batch_number: e.target.value})} style={inputStyle} placeholder="e.g. B1234" />
                      </div>
                      <div>
                        <label style={labelStyle}>Expiry Date (Optional)</label>
                        <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} style={inputStyle} />
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={onClose} style={{
                      flex: 1, padding: '11px', borderRadius: 'var(--radius-md)',
                      background: 'transparent', border: '1px solid var(--color-border-bright)',
                      color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    }}>
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      disabled={saving}
                      style={{
                        flex: 2, padding: '11px', borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none', color: 'white', fontSize: 14, fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? <span style={{ width: 15, height: 15, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                      {saving ? 'Adding...' : 'Add Stock'}
                    </motion.button>
                  </div>
                </form>

              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
