'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Pill, Shield, TrendingUp, FileText, AlertCircle, Plus } from 'lucide-react';
import { login } from '@/services/api';

const FEATURES = [
  { icon: Pill,       title: 'Inventory Management',    desc: 'Track stock in real-time with smart low-stock alerts.' },
  { icon: FileText,   title: 'Prescription Approvals',  desc: 'Review patient documents with one-click decisions.' },
  { icon: TrendingUp, title: 'AI Demand Predictions',   desc: 'Know which medicines are trending in Sikela & Secha.' },
  { icon: Shield,     title: 'Verified Pharmacy Network', desc: 'A trusted, admin-verified system of pharmacies.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<'pharmacist' | 'admin'>('pharmacist');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const auth = await login(username, password);
      if (auth.role === 'admin') {
        router.push('/admin');
      } else if (auth.status !== 'approved') {
        router.push('/pharmacist/pending');
      } else {
        router.push('/pharmacist');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .login-wrapper { font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow: hidden; height: 100vh; }
        .login-input { height: 44px; padding: 0 16px; border-radius: 12px; border: 2px solid #f3f4f6; background-color: #f9fafb; font-size: 14px; width: 100%; outline: none; transition: all 0.2s; color: #111827; }
        .login-input:focus { background-color: #ffffff; border-color: #059669; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1); }
        .login-btn { height: 44px; border-radius: 12px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 16px -4px rgba(5, 150, 105, 0.3); border: none; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -4px rgba(5, 150, 105, 0.4); }
        .login-card { background: white; border-radius: 28px; padding: 32px; box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6; position: relative; z-index: 10; width: 100%; max-width: 420px; }
        .login-tab-btn { flex: 1; padding: 10px 0; font-size: 13px; font-weight: 700; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; }
        .login-tab-active { background: #059669; color: white; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25); }
        .login-tab-inactive { background: transparent; color: #6b7280; }
        .feature-box { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); }
      `}} />

      <div className="login-wrapper" style={{ display: 'flex', backgroundColor: '#f9fafb' }}>
        
        {/* ─── LEFT: Brand Panel ─── */}
        <div className="hidden lg:flex relative flex-col justify-between overflow-hidden" style={{ display: 'flex', width: '45%', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
          
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', width: 250, height: 250, border: '1px solid white', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', width: 450, height: 450, border: '1px solid white', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', width: 650, height: 650, border: '1px solid white', borderRadius: '50%' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 10, padding: '32px 48px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' }}>
                <Plus size={22} color="#059669" strokeWidth={4} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>MedLink</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginLeft: '6px', textTransform: 'uppercase' }}>Portal</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#bfdbfe', textTransform: 'uppercase', marginBottom: '12px' }}>
                Healthcare Excellence
              </p>
              <h1 style={{ fontSize: '40px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
                Run your pharmacy<br />
                smarter, faster.
              </h1>
              <p style={{ fontSize: '14px', color: '#dbeafe', lineHeight: 1.5, marginBottom: '24px', maxWidth: '420px', fontWeight: 500 }}>
                The ultimate platform for Arba Minch pharmacies. Automate inventory, verify prescriptions, and predict demand with AI.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '440px' }}>
                {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} className="feature-box">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)' }}>
                      <Icon size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '2px', letterSpacing: '-0.5px' }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}>
              © 2026 MedLink, Arba Minch Network
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Form Panel ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
          
          <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: '6px' }}>Sign In</h2>
              <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Access your pharmacy dashboard</p>
            </div>

            <div style={{ background: '#f3f4f6', padding: '4px', borderRadius: '14px', display: 'flex', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setTab('pharmacist')}
                className={`login-tab-btn ${tab === 'pharmacist' ? 'login-tab-active' : 'login-tab-inactive'}`}
              >
                Pharmacist
              </button>
              <button
                onClick={() => setTab('admin')}
                className={`login-tab-btn ${tab === 'admin' ? 'login-tab-active' : 'login-tab-inactive'}`}
              >
                Admin
              </button>
            </div>

            <div className="login-card">
              
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ width: '100%', marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> 
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>Username</label>
                  <input
                    type="text" required autoComplete="username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="login-input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="login-input"
                      style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {showPass ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="login-btn"
                  style={{ marginTop: '8px', opacity: (loading || !username || !password) ? 0.5 : 1 }}
                >
                  {loading ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
                </button>
                
              </form>

              <div style={{ width: '100%', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>New to MedLink?</p>
                <a
                  href="/register"
                  style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px', border: '2px solid #f3f4f6', color: '#059669', fontSize: '14px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Register Your Pharmacy <ArrowRight size={14} />
                </a>
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={12} /> Secured by MedLink Auth
                </p>
              </div>
              
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                Forgot password?
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
