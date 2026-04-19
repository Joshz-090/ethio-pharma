'use client';
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Package } from 'lucide-react';
import { InventoryItem } from '@/lib/mockData';

interface EditStockModalProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, quantity: number, price: number) => void;
}

export default function EditStockModal({ item, open, onClose, onSave }: EditStockModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) { setQuantity(item.quantityOnHand); setPrice(item.unitPrice); }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400)); // Simulate async
    onSave(item.id, quantity, price);
    setSaving(false);
    onClose();
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{
                  position: 'fixed', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)', zIndex: 401,
                  width: '100%', maxWidth: 440,
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
                      <Package size={18} color="#0ea5e9" />
                    </div>
                    <div>
                      <Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                        Edit Stock
                      </Dialog.Title>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {item?.medicineName}
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

                {/* Info row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20,
                  padding: '12px 14px', background: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                }}>
                  {[
                    { label: 'Category', val: item?.category },
                    { label: 'Form', val: item?.dosageForm },
                    { label: 'Batch', val: item?.batchNumber },
                    { label: 'Expiry', val: item?.expiryDate },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={labelStyle}>Quantity on Hand</label>
                    <input
                      type="number" min={0} value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Unit Price (ETB)</label>
                    <input
                      type="number" min={0} step={0.01} value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Dialog.Close asChild>
                    <button style={{
                      flex: 1, padding: '11px', borderRadius: 'var(--radius-md)',
                      background: 'transparent', border: '1px solid var(--color-border-bright)',
                      color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    }}>
                      Cancel
                    </button>
                  </Dialog.Close>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
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
                    <Save size={15} />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
