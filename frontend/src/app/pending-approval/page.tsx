'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, ShieldCheck, ArrowRight, Building2, ExternalLink, Mail, Phone, MapPin, TrendingUp, Package, ShoppingCart, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .pending-container { 
          font-family: 'Outfit', sans-serif; 
          min-height: 100vh; 
          background: radial-gradient(circle at top right, #f0fdf4 0%, #ffffff 50%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .bg-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          background: rgba(5, 150, 105, 0.05);
          filter: blur(100px);
          border-radius: 50%;
          z-index: 0;
        }
        .main-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 40px;
          width: 100%;
          max-width: 1000px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          position: relative;
          z-index: 10;
        }
        .left-panel { padding: 3.5rem; }
        .right-panel { 
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
          padding: 3.5rem;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 100px;
          color: #047857;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
        }
        .benefit-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        .benefit-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-5px);
        }
        .action-btn {
          height: 56px;
          background: #059669;
          color: white;
          border-radius: 18px;
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 12px 24px -8px rgba(5, 150, 105, 0.4);
        }
        .action-btn:hover {
          background: #047857;
          box-shadow: 0 16px 32px -8px rgba(5, 150, 105, 0.5);
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .main-card { grid-template-columns: 1fr; }
          .right-panel { display: none; }
        }
      `}} />

      <div className="pending-container">
        <div className="bg-blob" style={{ top: '-100px', right: '-100px' }} />
        <div className="bg-blob" style={{ bottom: '-100px', left: '-100px', background: 'rgba(59, 130, 246, 0.05)' }} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="main-card"
        >
          {/* ─── LEFT: Status & Actions ─── */}
          <div className="left-panel">
            <div className="status-pill">
              <Clock size={14} className="animate-spin" />
              Verification in Progress
            </div>

            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">
              Almost there!<br/>Your pharmacy is <span className="text-emerald-600">being verified.</span>
            </h1>
            
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
              Welcome to the MedLink family. Our team is currently reviewing your <strong>License</strong> and <strong>Tax IDs</strong> to ensure the highest safety standards for the Arba Minch community.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Timeline</h4>
                  <p className="text-xs text-slate-400 mt-1">Approval usually takes 12-24 business hours. You'll receive an email confirmation.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Security Check</h4>
                  <p className="text-xs text-slate-400 mt-1">We are verifying your pharmacy location in Arba Minch to optimize nearby search results.</p>
                </div>
              </div>
            </div>

            <button onClick={() => router.push('/login')} className="action-btn">
              Go to Dashboard Login <ArrowRight size={20} />
            </button>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-4">
                <a href="#" className="text-xs font-bold text-slate-400 hover:text-emerald-600">Support</a>
                <a href="#" className="text-xs font-bold text-slate-400 hover:text-emerald-600">Contact Admin</a>
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">MedLink Portal v2.0</p>
            </div>
          </div>

          {/* ─── RIGHT: Brand & Benefits ─── */}
          <div className="right-panel">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={22} className="text-emerald-600" />
              </div>
              <span className="text-xl font-black tracking-tight">MedLink Network</span>
            </div>

            <h2 className="text-2xl font-black mb-8 leading-snug">
              While you wait, here is what awaits you:
            </h2>

            <div className="space-y-4">
              {[
                { icon: TrendingUp, title: 'AI Demand Predictions', desc: 'Predict stock needs based on regional Arba Minch trends.' },
                { icon: Package, title: 'Smart Inventory', desc: 'Real-time monitoring with automated expiry warnings.' },
                { icon: ShoppingCart, title: 'Patient Bookings', desc: 'Connect directly with patients in Sikela and Secha.' }
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="benefit-card"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg mb-1">{benefit.title}</h4>
                      <p className="text-sm text-emerald-100/70 leading-relaxed font-medium">{benefit.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xs font-medium text-emerald-100/60 leading-relaxed italic">
                "Our mission is to ensure no patient in Arba Minch walks more than 15 minutes to find their medicine. Thank you for being a part of this vision."
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
