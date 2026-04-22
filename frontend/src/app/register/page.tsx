'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dynamic from 'next/dynamic';
import { Building2, MapPin, Phone, FileBadge, CheckCircle, ArrowRight, ArrowLeft, Activity, AlertCircle, User, Lock, Mail, Upload, Image as ImageIcon, CreditCard, ShieldCheck } from 'lucide-react';
import { applyPharmacy } from '@/services/api';

// Dynamic import for Leaflet (No SSR)
const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-2xl border-2 border-slate-100" />
});

const STEPS = [
  { number: 1, label: 'Account Setup' },
  { number: 2, label: 'Pharmacy Info' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Confirmation' },
];

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone_number: z.string().min(10, 'Valid phone number required'),
  name: z.string().min(2, 'Pharmacy name required'),
  license_number: z.string().min(2, 'License number required'),
  tax_id: z.string().min(5, 'Tax ID required'),
  address: z.string().min(5, 'Address is too short'),
  latitude: z.number().refine(v => v !== 0, 'Please pin your location on the map'),
  longitude: z.number().refine(v => v !== 0, 'Please pin your location on the map'),
  opening_hours: z.string().default('{"Mon-Fri": "08:00-20:00", "Sat-Sun": "09:00-18:00"}'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      opening_hours: '{"Mon-Fri": "08:00-20:00", "Sat-Sun": "09:00-18:00"}'
    }
  });

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const lat = watch('latitude');
  const lng = watch('longitude');

  const handleUserSubmit = async () => {
    const isValid = await trigger(['username', 'email', 'password', 'phone_number']);
    if (isValid) setStep(2);
  };

  const handlePharmacySubmit = async () => {
    const isValid = await trigger(['name', 'license_number', 'tax_id', 'address', 'latitude', 'longitude']);
    if (isValid) setStep(3);
  };

  const handleFinalSubmit = async (data: FormData) => {
    if (!paymentFile || !verificationFile) {
      setError('Please upload all required documents.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default'); 
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          const errData = await res.json();
          console.error('Cloudinary Upload Error:', errData);
          throw new Error(errData.error?.message || 'Upload failed');
        }
        const cloudData = await res.json();
        return cloudData.secure_url;
      };

      const [receiptUrl, licenseUrl] = await Promise.all([
        uploadFile(paymentFile),
        uploadFile(verificationFile)
      ]);

      await applyPharmacy({
        ...data,
        payment_receipt: receiptUrl,
        verification_doc: licenseUrl,
      });

      router.push('/pending-approval');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setIsLoading(false); }
  };

  const stepHeadings: Record<number, { title: string; sub: string }> = {
    1: { title: 'Create Account', sub: 'Setup your pharmacist credentials.' },
    2: { title: 'Pharmacy Details', sub: 'Pin your location on the map.' },
    3: { title: 'Payment Proof', sub: 'Complete your subscription payment.' },
    4: { title: 'All Done!', sub: 'Your application has been submitted.' },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .reg-wrapper { font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow: hidden; height: 100vh; }
        .reg-input { height: 44px; padding: 0 16px; border-radius: 12px; border: 2px solid #f3f4f6; background-color: #f9fafb; font-size: 14px; width: 100%; outline: none; transition: all 0.2s; color: #111827; box-sizing: border-box; }
        .reg-input:focus { background-color: #ffffff; border-color: #059669; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.08); }
        .reg-btn { height: 44px; border-radius: 12px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 16px -4px rgba(5, 150, 105, 0.3); border: none; }
        .reg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px -4px rgba(5, 150, 105, 0.4); }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .reg-card { background: white; border-radius: 28px; padding: 32px; box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6; width: 100%; max-width: 500px; margin: 0 auto; max-height: 85vh; overflow-y: auto; }
        .upload-zone { border: 2px dashed #e2e8f0; background: #f8fafc; border-radius: 16px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; min-height: 120px; position: relative; }
        .upload-zone:hover { border-color: #059669; background: #ecfdf5; }
        .err-msg { color: #be123c; font-size: 10px; font-weight: 700; margin-top: 4px; display: block; }
      `}} />

      <div className="reg-wrapper" style={{ display: 'flex', backgroundColor: '#f8fafc' }}>
        {/* LEFT PANEL */}
        <div className="hidden lg:flex" style={{ width: '38%', background: 'linear-gradient(160deg, #064e3b 0%, #059669 50%, #10b981 100%)', position: 'relative', flexDirection: 'column' }}>
          <div style={{ position: 'relative', zIndex: 10, padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={22} color="#059669" strokeWidth={4} />
              </div>
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 900 }}>MedLink</span>
            </div>

            <div>
              <h1 style={{ fontSize: '42px', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '20px' }}>
                Arba Minch<br />Pharmacy Portal.
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {STEPS.map((s) => (
                  <div key={s.number} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800,
                      background: step > s.number ? '#22c55e' : step === s.number ? 'white' : 'rgba(255,255,255,0.1)',
                      color: step > s.number ? 'white' : step === s.number ? '#047857' : 'rgba(255,255,255,0.3)',
                    }}>
                      {step > s.number ? <CheckCircle size={16} /> : s.number}
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: step >= s.number ? 'white' : 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600 }}>© 2026 Arba Minch Tech Hub</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: '100%', maxWidth: '500px' }}>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>{stepHeadings[step].title}</h2>
                <p style={{ color: '#64748b', fontWeight: 500 }}>{stepHeadings[step].sub}</p>
              </div>

              <div className="reg-card">
                {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', fontWeight: 600 }}>{error}</div>}

                <form onSubmit={step === 3 ? handleSubmit(handleFinalSubmit) : (e) => e.preventDefault()}>
                  {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { name: 'username', label: 'Username', type: 'text', icon: User },
                        { name: 'email', label: 'Email Address', type: 'email', icon: Mail },
                        { name: 'phone_number', label: 'Phone Number', type: 'tel', icon: Phone },
                        { name: 'password', label: 'Password', type: 'password', icon: Lock },
                      ].map((f) => (
                        <div key={f.name}>
                          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                          <div style={{ position: 'relative' }}>
                            <f.icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                            <input {...register(f.name as any)} type={f.type} className="reg-input" style={{ paddingLeft: 42 }} />
                          </div>
                          {errors[f.name as keyof FormData] && <span className="err-msg">{errors[f.name as keyof FormData]?.message}</span>}
                        </div>
                      ))}
                      <button type="button" onClick={handleUserSubmit} className="reg-btn">Next Step <ArrowRight size={18} /></button>
                    </div>
                  )}

                  {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Pharmacy Name</label>
                          <input {...register('name')} className="reg-input" />
                          {errors.name && <span className="err-msg">{errors.name.message}</span>}
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>License No.</label>
                          <input {...register('license_number')} className="reg-input" />
                          {errors.license_number && <span className="err-msg">{errors.license_number.message}</span>}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Map Location (Click to pin)</label>
                        <MapPicker onLocationSelect={(lat, lng) => { setValue('latitude', lat); setValue('longitude', lng); trigger(['latitude', 'longitude']); }} />
                        <div className="flex justify-between mt-2 px-2">
                           <span style={{ fontSize: '11px', fontWeight: 700, color: lat ? '#059669' : '#94a3b8' }}>Lat: {lat.toFixed(4)}</span>
                           <span style={{ fontSize: '11px', fontWeight: 700, color: lng ? '#059669' : '#94a3b8' }}>Lng: {lng.toFixed(4)}</span>
                        </div>
                        {(errors.latitude || errors.longitude) && <span className="err-msg text-center block">Please select your location on the map</span>}
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Physical Address</label>
                        <input {...register('address')} className="reg-input" placeholder="e.g. Near Arba Minch University..." />
                        {errors.address && <span className="err-msg">{errors.address.message}</span>}
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Tax ID</label>
                        <input {...register('tax_id')} className="reg-input" />
                        {errors.tax_id && <span className="err-msg">{errors.tax_id.message}</span>}
                      </div>

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)} className="w-14 h-11 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center"><ArrowLeft size={18} color="#64748b" /></button>
                        <button type="button" onClick={handlePharmacySubmit} className="reg-btn">Next Step <ArrowRight size={18} /></button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center"><CreditCard size={20} color="white" /></div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Subscription Fee</p>
                            <p className="text-xl font-black text-emerald-900">1,000 ETB / Year</p>
                          </div>
                        </div>
                        <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Telebirr Merchant</p>
                          <p className="text-lg font-black text-slate-900 font-mono">0900 123 456</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Pharmacy License (Doc/PDF)</label>
                        <div className="upload-zone">
                          <Upload size={20} color="#059669" className="mb-2" />
                          <p className="text-xs font-bold text-slate-600 text-center">{verificationFile ? verificationFile.name : 'Click to upload License'}</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && setVerificationFile(e.target.files[0])} />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Payment Receipt (Image)</label>
                        <div className="upload-zone">
                          {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover rounded-2xl" /> : <Upload size={20} color="#059669" className="mb-2" />}
                          <p className="text-xs font-bold text-slate-600 text-center relative z-10">{paymentFile ? 'Receipt Uploaded' : 'Click to upload Receipt'}</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                            if(e.target.files?.[0]) {
                              setPaymentFile(e.target.files[0]);
                              setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                            }
                          }} />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(2)} className="w-14 h-11 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center"><ArrowLeft size={18} color="#64748b" /></button>
                        <button type="submit" className="reg-btn" disabled={isLoading}>
                          {isLoading ? <Activity size={18} className="animate-spin" /> : <>Complete Registration <ArrowRight size={18} /></>}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="text-center py-6">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-emerald-600" /></div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Application Received!</h2>
                      <p className="text-sm text-slate-500 mb-8 leading-relaxed">We are reviewing your pharmacy application. You will receive an email once your account is active.</p>
                      <button onClick={() => router.push('/login')} className="reg-btn">Back to Login</button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
