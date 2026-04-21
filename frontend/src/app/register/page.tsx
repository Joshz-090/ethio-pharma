'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Phone, FileBadge, CheckCircle, ArrowRight, ArrowLeft, Activity, AlertCircle, User, Lock, Mail, Upload, Image as ImageIcon, CreditCard } from 'lucide-react';
import { registerUser, login, registerPharmacy } from '@/services/api';

const STEPS = [
  { number: 1, label: 'Account Setup' },
  { number: 2, label: 'Pharmacy Details' },
  { number: 3, label: 'Payment Proof' },
  { number: 4, label: 'Confirmation' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [userForm, setUserForm] = useState({
    username: '', password: '', email: '', phone_number: '', role: 'pharmacist',
  });

  const [pharmacyForm, setPharmacyForm] = useState({
    name: '', license_number: '', phone_number: '', address: '', subscription_plan: 'basic'
  });

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setPaymentFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await registerUser(userForm);
      await login(userForm.username, userForm.password);
      setStep(2);
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Account creation failed. Please try again.';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.detail) msg = data.detail;
        else { const k = Object.keys(data)[0]; msg = `${k}: ${Array.isArray(data[k]) ? data[k][0] : data[k]}`; }
      }
      if (!err.response) msg = `Network error: ${err.message}`;
      setError(msg);
    } finally { setIsLoading(false); }
  };

  const handlePharmacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile) { setError('Please upload your payment screenshot to continue.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', pharmacyForm.name);
      formData.append('license_number', pharmacyForm.license_number);
      formData.append('phone_number', pharmacyForm.phone_number);
      formData.append('address', pharmacyForm.address);
      formData.append('subscription_plan', pharmacyForm.subscription_plan);
      formData.append('payment_receipt', paymentFile);
      await registerPharmacy({ name: pharmacyForm.name, license_number: pharmacyForm.license_number, phone_number: pharmacyForm.phone_number, address: pharmacyForm.address, subscription_plan: pharmacyForm.subscription_plan });
      setStep(4);
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.detail || 'Pharmacy registration failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  const stepHeadings: Record<number, { title: string; sub: string }> = {
    1: { title: 'Create Account', sub: 'Setup your pharmacist credentials.' },
    2: { title: 'Pharmacy Details', sub: 'Tell us about your business.' },
    3: { title: 'Payment Proof', sub: 'Complete your subscription payment.' },
    4: { title: 'All Done!', sub: 'Your application has been submitted.' },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .reg-wrapper { font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow: hidden; height: 100vh; }
        .reg-input { height: 44px; padding: 0 16px; border-radius: 12px; border: 2px solid #f3f4f6; background-color: #f9fafb; font-size: 14px; width: 100%; outline: none; transition: all 0.2s; color: #111827; box-sizing: border-box; }
        .reg-input:focus { background-color: #ffffff; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08); }
        .reg-btn { height: 44px; border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.3); border: none; }
        .reg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -4px rgba(37, 99, 235, 0.4); }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .reg-card { background: white; border-radius: 28px; padding: 32px; box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6; width: 100%; max-width: 440px; }
        .upload-zone { border: 2px dashed #e2e8f0; background: #f8fafc; border-radius: 16px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; min-height: 140px; position: relative; overflow: hidden; }
        .upload-zone:hover { border-color: #2563eb; background: #eff6ff; }
        .upload-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
      `}} />

      <div className="reg-wrapper" style={{ display: 'flex', backgroundColor: '#f8fafc' }}>

        {/* ─── LEFT PANEL ─── */}
        <div style={{ display: 'flex', width: '42%', background: 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)', position: 'relative', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.12, pointerEvents: 'none' }}>
            {[250, 450, 650].map(s => <div key={s} style={{ position: 'absolute', width: s, height: s, border: '1px solid white', borderRadius: '50%' }} />)}
          </div>

          <div style={{ position: 'relative', zIndex: 10, padding: '32px 40px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.1)' }}>
                <Activity size={22} color="#2563eb" strokeWidth={4} />
              </div>
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>MedLink</span>
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#bfdbfe', textTransform: 'uppercase', marginBottom: '12px' }}>Join the Network</p>
              <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '14px', letterSpacing: '-1px' }}>
                List your pharmacy<br />
                <span style={{ color: '#93c5fd' }}>on MedLink today.</span>
              </h1>
              <p style={{ fontSize: '13px', color: '#dbeafe', lineHeight: 1.5, marginBottom: '28px', fontWeight: 500 }}>
                Connect with patients across Arba Minch sectors. Get verified, manage inventory, and grow your business.
              </p>

              {/* Progress Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {STEPS.map((s) => (
                  <div key={s.number} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', fontWeight: 800, transition: 'all 0.3s',
                      background: step > s.number ? '#22c55e' : step === s.number ? 'white' : 'rgba(255,255,255,0.1)',
                      color: step > s.number ? 'white' : step === s.number ? '#1d4ed8' : 'rgba(255,255,255,0.35)',
                      border: step > s.number ? 'none' : step === s.number ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: step === s.number ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                    }}>
                      {step > s.number ? <CheckCircle size={18} /> : s.number}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: step >= s.number ? 'white' : 'rgba(255,255,255,0.35)', marginBottom: 0, letterSpacing: '-0.3px' }}>{s.label}</p>
                    </div>
                    {/* Connector line */}
                  </div>
                ))}
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600 }}>© 2026 MedLink, Arba Minch Network</p>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', overflowY: 'auto' }}>
          
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
              style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                  Step {step} of 4
                </p>
                <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: '6px' }}>
                  {stepHeadings[step].title}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                  {stepHeadings[step].sub}
                </p>
              </div>

              <div className="reg-card">

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: '12px', fontWeight: 600 }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── STEP 1: Account ─── */}
                {step === 1 && (
                  <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Email', key: 'email', type: 'email', icon: Mail, placeholder: 'pharmacist@email.com' },
                      { label: 'Phone Number', key: 'phone_number', type: 'tel', icon: Phone, placeholder: '0911234567' },
                      { label: 'Username', key: 'username', type: 'text', icon: User, placeholder: 'Choose a username' },
                      { label: 'Password', key: 'password', type: 'password', icon: Lock, placeholder: '••••••••' },
                    ].map(({ label, key, type, icon: Icon, placeholder }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>{label}</label>
                        <div style={{ position: 'relative' }}>
                          <Icon size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', pointerEvents: 'none' }} />
                          <input required type={type} placeholder={placeholder}
                            value={(userForm as any)[key]}
                            onChange={e => setUserForm({ ...userForm, [key]: e.target.value })}
                            className="reg-input" style={{ paddingLeft: '40px' }}
                          />
                        </div>
                      </div>
                    ))}
                    <button type="submit" className="reg-btn" disabled={isLoading} style={{ marginTop: '8px' }}>
                      {isLoading ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
                    </button>
                  </form>
                )}

                {/* ─── STEP 2: Pharmacy ─── */}
                {step === 2 && (
                  <form onSubmit={handlePharmacySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { label: 'Pharmacy Name', key: 'name', icon: Building2, placeholder: 'e.g. City Pharmacy' },
                      { label: 'License Number', key: 'license_number', icon: FileBadge, placeholder: 'e.g. 12345-AA' },
                      { label: 'Phone Number', key: 'phone_number', icon: Phone, placeholder: '0911234567' },
                      { label: 'Physical Address', key: 'address', icon: MapPin, placeholder: 'Sikela, near main road...' },
                    ].map(({ label, key, icon: Icon, placeholder }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>{label}</label>
                        <div style={{ position: 'relative' }}>
                          <Icon size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', pointerEvents: 'none' }} />
                          <input required placeholder={placeholder}
                            value={(pharmacyForm as any)[key]}
                            onChange={e => setPharmacyForm({ ...pharmacyForm, [key]: e.target.value })}
                            className="reg-input" style={{ paddingLeft: '40px' }}
                          />
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button type="button" onClick={() => setStep(1)}
                        style={{ width: 44, height: 44, borderRadius: '12px', border: '2px solid #f1f5f9', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ArrowLeft size={16} color="#94a3b8" />
                      </button>
                      <button type="submit" className="reg-btn">
                        Continue <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}

                {/* ─── STEP 3: Payment Proof ─── */}
                {step === 3 && (
                  <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Payment Info Card */}
                    <div style={{ padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={18} color="white" />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 900, color: '#1e3a8a', marginBottom: 0 }}>Annual Subscription Fee</p>
                          <p style={{ fontSize: '20px', fontWeight: 900, color: '#2563eb', marginBottom: 0 }}>1,000 ETB</p>
                        </div>
                      </div>
                      <div style={{ background: 'white', borderRadius: '10px', padding: '10px 14px', border: '1px solid #dbeafe' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Send to Telebirr</p>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e3a8a', fontFamily: 'monospace', letterSpacing: '2px' }}>0900 123 456</p>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>Reference: Your pharmacy name</p>
                      </div>
                    </div>

                    {/* Upload Zone */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '4px' }}>
                        Upload Payment Screenshot
                      </label>
                      <div className="upload-zone">
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Payment proof" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, borderRadius: '14px' }} />
                            <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.95)', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 800, color: '#2563eb', border: '1px solid #bfdbfe' }}>
                              ✓ Screenshot uploaded — tap to change
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                              <Upload size={22} color="#2563eb" />
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Drop screenshot here</p>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>or click to browse</p>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => { setError(''); setStep(2); }}
                        style={{ width: 44, height: 44, borderRadius: '12px', border: '2px solid #f1f5f9', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ArrowLeft size={16} color="#94a3b8" />
                      </button>
                      <button type="submit" className="reg-btn" disabled={isLoading || !paymentFile}>
                        {isLoading ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" /> : <>Submit Application <ArrowRight size={16} /></>}
                      </button>
                    </div>
                  </form>
                )}

                {/* ─── STEP 4: Success ─── */}
                {step === 4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 12px 24px rgba(34,197,94,0.3)' }}>
                      <CheckCircle size={36} color="white" />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>You're on the list!</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
                      Account created and application submitted. Our team will verify your payment and activate your portal shortly.
                    </p>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>What happens next?</p>
                      {['Admin verifies your payment receipt', 'Your pharmacy account gets activated', 'Log in to access your full dashboard'].map((t, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={12} color="white" />
                          </div>
                          <p style={{ fontSize: '12px', color: '#166534', fontWeight: 600, marginBottom: 0 }}>{t}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => router.push('/login')} className="reg-btn">
                      Login to Dashboard <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

              </div>

              {step < 4 && (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Already registered? </span>
                  <a href="/login" style={{ color: '#2563eb', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', marginLeft: '4px', textDecoration: 'none' }}>Sign in</a>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
