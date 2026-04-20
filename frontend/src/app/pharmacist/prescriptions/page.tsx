'use client';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function PrescriptionsPage() {
  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle="Review and approve patient-uploaded prescription images"
        breadcrumb={['Pharmacist', 'Prescriptions']}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          padding: '60px 40px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16,
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-lg)',
          background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={28} color="#0ea5e9" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Coming Soon
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360 }}>
          The prescription approval flow will be available once the backend API is connected. Patients will be able to upload prescription images and you can approve or reject them here.
        </p>
      </motion.div>
    </div>
  );
}
