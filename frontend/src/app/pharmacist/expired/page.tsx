'use client';

import { motion } from 'framer-motion';
import { CreditCard, ShieldAlert, Phone, Mail, ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { logout } from '@/services/api';

export default function SubscriptionExpiredPage() {
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
        .expired-card {
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
          background: #fee2e2;
          color: #ef4444;
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
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #ef4444;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
        .pkg-card {
          padding: 12px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="expired-card"
      >
        <div className="status-badge">
          <AlertTriangle size={14} />
          Access Revoked
        </div>

        <div className="icon-wrapper">
          <ShieldAlert size={40} />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Subscription Expired
        </h1>
        
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
          Your access to the MedLink Pharmacy Portal has expired. To continue managing your inventory and reservations, please renew your subscription.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            <div className="pkg-card">
                <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>1 Year Plan</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>Standard business package</p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>999 ETB</span>
            </div>
            <div className="pkg-card" style={{ border: '1px solid #a7f3d0', background: '#f0fdf4' }}>
                <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>2 Year Plan</p>
                    <p style={{ fontSize: '11px', color: '#64748b' }}>Best value (Save 300 ETB)</p>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>1,699 ETB</span>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => window.location.href = '/pharmacist/settings/subscription'}
            style={{ 
              height: '48px', borderRadius: '12px', background: 'var(--color-primary)', 
              color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            Renew Subscription <ExternalLink size={16} />
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

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                <Mail size={14} /> support@medlink.et
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                <Phone size={14} /> +251 900 123456
            </div>
        </div>
      </motion.div>
    </div>
  );
}
