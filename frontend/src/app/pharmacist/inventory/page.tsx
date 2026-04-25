'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import InventoryTable from '@/components/inventory/InventoryTable';
import EditStockModal from '@/components/inventory/EditStockModal';
import AddStockModal from '@/components/inventory/AddStockModal';
import { InventoryItem, InventoryStatus } from '@/lib/mockData';
import { getInventory, updateStock, toggleAvailability, sellStock } from '@/services/api';

const CATEGORIES = ['All', 'Painkiller', 'Antibiotic', 'Diabetes', 'Antimalarial', 'Gastric', 'Vitamin', 'Respiratory', 'Hydration'];
const STATUSES: { label: string; value: InventoryStatus | 'all' }[] = [
  { label: 'All',           value: 'all' },
  { label: 'In Stock',      value: 'in_stock' },
  { label: 'Low Stock',     value: 'low_stock' },
  { label: 'Out of Stock',  value: 'out_of_stock' },
  { label: 'Expiring Soon', value: 'expiring_soon' },
];

const PAGE_SIZE = 8;

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState<'all' | InventoryStatus>('all');
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getInventory();
      // Map backend schema to frontend component schema
      const mapped = data.map((d: any) => {
        const cat = d.medicine?.category;
        const categoryName = (cat && typeof cat === 'object') ? cat.name : (cat || 'Other');
        
        return {
          id: d.id,
          medicineName: d.medicine?.name || 'Unknown',
          genericName: d.medicine?.generic_name || '',
          category: categoryName,
          dosageForm: d.dosage_form || 'Tablet',
          quantityOnHand: d.quantity || 0,
          unitPrice: d.price || 0,
          costPrice: d.cost_price || 0,
          reorderLevel: d.reorder_level || 0,
          expiryDate: d.expiry_date || '',
          batchNumber: d.batch_number || '',
          isOcrVerified: d.is_ocr_verified || false,
          isAvailable: d.is_available,
          status: (d.quantity || 0) === 0 ? 'out_of_stock' : (d.quantity || 0) <= (d.reorder_level || 10) ? 'low_stock' : 'in_stock'
        };
      });
      setItems(mapped);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      item.genericName.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    const matchStatus = status === 'all' || item.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (item: InventoryItem) => { setEditItem(item); setEditModalOpen(true); };

  const handleSave = async (id: string, quantity: number, price: number) => {
    await updateStock(id, quantity, price);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantityOnHand: quantity, unitPrice: price } : i));
  };

  const handleToggle = async (item: InventoryItem) => {
    await toggleAvailability(item.id, !item.isAvailable);
    fetchData();
  };

  const handleSell = async (item: InventoryItem) => {
    if (item.quantityOnHand <= 0) return;
    try {
      await sellStock(item.id, 1);
      fetchData();
    } catch (err) {
      console.error('Sale failed', err);
    }
  };

  const handleQuickAdd = async (item: InventoryItem) => {
    try {
      await updateStock(item.id, item.quantityOnHand + 1, item.unitPrice);
      fetchData();
    } catch (err) {
      console.error('Quick add failed', err);
    }
  };

  const chipStyle = (active: boolean, color = '#0ea5e9') => ({
    padding: '6px 14px', borderRadius: 99,
    background: active ? `rgba(${color === '#0ea5e9' ? '14,165,233' : '14,165,233'},0.15)` : 'transparent',
    border: `1px solid ${active ? `rgba(14,165,233,0.4)` : 'var(--color-border)'}`,
    color: active ? '#0ea5e9' : 'var(--color-text-secondary)',
    fontSize: 12, fontWeight: active ? 600 : 400,
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
  });

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        subtitle={`${items.length} total items · ${items.filter(i => i.status !== 'out_of_stock').length} available`}
        breadcrumb={['Pharmacist', 'Inventory']}
        action={
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setAddModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={15} /> Add Stock
          </motion.button>
        }
      />

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: `All (${items.length})`, key: 'all' },
          { label: `In Stock (${items.filter(i => i.status === 'in_stock').length})`, key: 'in_stock' },
          { label: `Low Stock (${items.filter(i => i.status === 'low_stock').length})`, key: 'low_stock' },
          { label: `Out of Stock (${items.filter(i => i.status === 'out_of_stock').length})`, key: 'out_of_stock' },
          { label: `Expiring (${items.filter(i => i.status === 'expiring_soon').length})`, key: 'expiring_soon' },
        ].map(s => (
          <button key={s.key} onClick={() => { setStatus(s.key as any); setPage(1); }} style={chipStyle(status === s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text" placeholder="Search medicines…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%', padding: '9px 14px 9px 36px',
                background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: 13,
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>
          {/* Category filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} color="var(--color-text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Category:</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setPage(1); }} style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
                background: category === cat ? 'rgba(20,184,166,0.15)' : 'transparent',
                border: `1px solid ${category === cat ? 'rgba(20,184,166,0.4)' : 'var(--color-border)'}`,
                color: category === cat ? '#14b8a6' : 'var(--color-text-muted)',
                fontWeight: category === cat ? 600 : 400,
              }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <span className="w-8 h-8 border-4 border-slate-600 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          <InventoryTable
            items={paginated}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onSell={handleSell}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderTop: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: page === p ? '#0ea5e9' : 'transparent',
                  border: `1px solid ${page === p ? '#0ea5e9' : 'var(--color-border)'}`,
                  color: page === p ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 13, fontWeight: page === p ? 700 : 400, cursor: 'pointer',
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <EditStockModal
        item={editItem}
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditItem(null); }}
        onSave={handleSave}
      />

      <AddStockModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
