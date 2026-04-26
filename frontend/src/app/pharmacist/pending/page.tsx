'use client';

import { motion } from 'framer-motion';
import { Clock, ShieldAlert, Phone, Mail, ArrowLeft } from 'lucide-react';
import { logout } from '@/services/api';

export default function PendingApprovalPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--color-bg-base)',
      padding: '24px'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .pending-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
          border: 1px solid var(--color-border);
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        .icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: #fef3c7;
          color: #d97706;
          display: flex;
          alignItems: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #d97706;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
      `}} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pending-card"
      >
        <div className="status-badge">
          <Clock size={14} />
          Pending Approval
        </div>

        <div className="icon-wrapper">
          <ShieldAlert size={40} />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Registration Under Review
        </h1>
        
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
          Welcome to MedLink! Your pharmacy registration is currently being verified by our administration team. 
          Please wait until approval for <strong>24 hours</strong>. You will gain full access once your credentials and documents are confirmed.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: '#f9fafb', border: '1px solid #f3f4f6', textAlign: 'left' }}>
            <Mail size={16} color="#059669" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Email Support</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>admin@ethiopharma.com</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '16px', background: '#f9fafb', border: '1px solid #f3f4f6', textAlign: 'left' }}>
            <Phone size={16} color="#059669" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Contact Admin</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>+251 912 345 678</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              height: '48px', borderRadius: '12px', background: 'var(--color-primary)', 
              color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            Check Status Again
          </button>
          
          <button 
            onClick={logout}
            style={{ 
              height: '48px', borderRadius: '12px', background: 'transparent', 
              color: 'var(--color-text-secondary)', fontWeight: 600, border: '1px solid var(--color-border)', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <ArrowLeft size={16} /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
