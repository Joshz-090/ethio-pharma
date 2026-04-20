'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { InventoryItem } from '@/lib/mockData';

type SortKey = 'medicineName' | 'category' | 'quantityOnHand' | 'unitPrice' | 'expiryDate';
type SortDir = 'asc' | 'desc';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onToggle: (item: InventoryItem) => void;
}

const COL_WIDTHS = ['auto', '110px', '90px', '80px', '90px', '110px', '100px', '130px'];
const HEADERS: { label: string; key?: SortKey }[] = [
  { label: 'Medicine',    key: 'medicineName' },
  { label: 'Category',   key: 'category' },
  { label: 'Form' },
  { label: 'Qty',        key: 'quantityOnHand' },
  { label: 'Price (ETB)',key: 'unitPrice' },
  { label: 'Expiry',     key: 'expiryDate' },
  { label: 'Status' },
  { label: 'Actions' },
];

export default function InventoryTable({ items, onEdit, onToggle }: InventoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('medicineName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key?: SortKey) => {
    if (!key) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...items].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    const cmp = typeof va === 'number' ? va - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ k }: { k?: SortKey }) => {
    if (!k) return null;
    if (sortKey !== k) return <ChevronDown size={13} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {HEADERS.map((h, i) => (
              <th key={h.label}
                onClick={() => toggleSort(h.key)}
                style={{
                  padding: '12px 14px',
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.6px', color: 'var(--color-text-muted)',
                  textAlign: 'left', borderBottom: '1px solid var(--color-border)',
                  cursor: h.key ? 'pointer' : 'default',
                  whiteSpace: 'nowrap', userSelect: 'none',
                  width: COL_WIDTHS[i],
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {h.label} <SortIcon k={h.key} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {sorted.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.02 }}
                style={{
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <td style={{ padding: '13px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {item.medicineName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {item.genericName} · {item.batchNumber}
                  </div>
                </td>
                <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {item.category}
                </td>
                <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {item.dosageForm}
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: item.quantityOnHand === 0 ? '#ef4444' : item.quantityOnHand < 10 ? '#f59e0b' : 'var(--color-text-primary)',
                  }}>
                    {item.quantityOnHand}
                  </span>
                </td>
                <td style={{ padding: '13px 14px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {item.unitPrice.toFixed(2)}
                </td>
                <td style={{ padding: '13px 14px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {item.expiryDate}
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <StatusBadge status={item.status} size="sm" />
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.button
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                      onClick={() => onEdit(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)',
                        color: '#0ea5e9', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={12} /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                      onClick={() => onToggle(item)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: '5px 8px', borderRadius: 'var(--radius-sm)',
                        background: item.isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${item.isAvailable ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        color: item.isAvailable ? '#22c55e' : '#ef4444', cursor: 'pointer',
                      }}
                      title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    >
                      {item.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
