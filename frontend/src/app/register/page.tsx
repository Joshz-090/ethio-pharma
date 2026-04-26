'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Building2, MapPin, Phone, FileBadge, CheckCircle, ArrowRight, ArrowLeft, Activity, AlertCircle, User, Lock, Mail, Upload, CreditCard, ShieldCheck } from 'lucide-react';
import { registerPharmacy } from '@/services/api';

// Dynamically import map to prevent SSR errors
const MapPicker = dynamic(() => import('@/components/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-2xl" />
});

const STEPS = [
  { number: 1, label: 'Owner Info' },
  { number: 2, label: 'Business Details' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Confirmation' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Combined Form State
  const [form, setForm] = useState({
    // Step 1: Account
    owner_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    agreed_to_terms: false,
    
    // Step 2: Pharmacy
    name: '',
    license_number: '',
    phone_number: '',
    address: '',
    subscription_tier: 'trial',
    working_hours: '24h',
    latitude: 0,
    longitude: 0,
  });

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'payment' | 'id') => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (type === 'payment') {
        setPaymentFile(f);
        setPreviewUrl(URL.createObjectURL(f));
      } else {
        setIdFile(f);
        setIdPreviewUrl(URL.createObjectURL(f));
      }
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (form.password !== form.confirm_password) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!form.agreed_to_terms) {
        setError('You must agree to the Terms & Conditions to continue.');
        return;
      }
    }
    if (step === 2) {
      if (form.latitude === 0 || form.longitude === 0) {
        setError('Please select your pharmacy location on the map.');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      // User info
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('owner_name', form.owner_name); // Backend will parse this
      
      // Pharmacy info
      formData.append('name', form.name);
      formData.append('license_number', form.license_number);
      formData.append('phone_number', form.phone_number);
      formData.append('address', form.address);
      formData.append('subscription_tier', form.subscription_tier);
      formData.append('latitude', form.latitude.toString());
      formData.append('longitude', form.longitude.toString());
      formData.append('opening_hours', form.working_hours === '24h' ? '{"all": "24/7"}' : '{"all": "Standard"}');

      if (paymentFile) {
        formData.append('payment_receipt', paymentFile);
      }
      if (idFile) {
        formData.append('verification_doc', idFile);
      }

      // We use the unified registration endpoint
      await registerPharmacy(formData);
      setStep(4);
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Registration failed. Please check your details.';
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        msg = `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-[family-name:var(--font-geist-sans)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .reg-input { width: 100%; height: 52px; padding: 0 20px; border-radius: 16px; border: 2px solid #f1f5f9; background: #f8fafc; font-size: 14px; font-weight: 500; outline: none; transition: all 0.2s; color: #0f172a; }
        .reg-input:focus { border-color: #10b981; background: white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .step-bubble { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; transition: all 0.3s; }
      `}} />

      {/* Sidebar Overlay */}
      <div className="hidden lg:flex w-[400px] bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full border-[40px] border-emerald-500" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[200px] h-[200px] rounded-full border-[20px] border-emerald-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">MedLink</span>
          </div>

          <div className="space-y-12">
            <div>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[3px] mb-4">Onboarding</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight">
                Empowering<br />
                <span className="text-emerald-400">Arba Minch</span><br />
                Pharmacies.
              </h2>
            </div>

            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.number} className="flex items-center gap-5">
                  <div className={`step-bubble ${
                    step > s.number ? 'bg-emerald-500 text-white' : 
                    step === s.number ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {step > s.number ? <CheckCircle size={20} /> : s.number}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${
                      step >= s.number ? 'text-white' : 'text-slate-600'
                    }`}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© 2026 MedLink Systems</p>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              {/* Header */}
              <div>
                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[4px] mb-4">Step {step} of 4</p>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {step === 1 && "Account Credentials"}
                  {step === 2 && "Pharmacy Profile"}
                  {step === 3 && "Payment Verification"}
                  {step === 4 && "Application Received"}
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                  {step === 1 && "Setup your primary pharmacist account details."}
                  {step === 2 && "Tell us about your pharmacy business and location."}
                  {step === 3 && "Upload your payment receipt to activate your portal."}
                  {step === 4 && "We've received your data and will verify it shortly."}
                </p>
              </div>

              {error && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-[1.5rem] flex items-center gap-4 text-red-700 text-sm font-bold">
                  <AlertCircle className="shrink-0" size={20} />
                  {error}
                </div>
              )}

              {/* Step 1: Account */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Owner Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required placeholder="Dr. John Doe" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} className="reg-input pl-14" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required type="email" placeholder="john@medlink.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="reg-input pl-14" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chosen Username</label>
                    <div className="relative">
                      <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input required placeholder="pharmacist_john" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="reg-input pl-14" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="reg-input pl-14" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input required type="password" placeholder="••••••••" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} className="reg-input pl-14" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-2xl">
                    <input type="checkbox" checked={form.agreed_to_terms} onChange={e => setForm({...form, agreed_to_terms: e.target.checked})} className="w-5 h-5 accent-emerald-500 mt-0.5 cursor-pointer" />
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      I agree to MedLink's <span className="text-emerald-600 font-black cursor-pointer">Terms of Service</span> and <span className="text-emerald-600 font-black cursor-pointer">Privacy Policy</span>. I confirm that I am a licensed pharmacist.
                    </p>
                  </div>

                  <button onClick={nextStep} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black transition-all flex items-center justify-center gap-3 shadow-xl">
                    Next Step <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {/* Step 2: Pharmacy Details */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pharmacy Name</label>
                      <input required placeholder="Arba Minch Central" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="reg-input" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">License Number</label>
                      <input required placeholder="AM-12345-PH" value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} className="reg-input" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Phone</label>
                      <input required placeholder="0900 000 000" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} className="reg-input" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                      <input required placeholder="Sikela, near Commercial Bank" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="reg-input" />
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Hours</label>
                    <div className="flex gap-4">
                      <button onClick={() => setForm({...form, working_hours: '24h'})} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${form.working_hours === '24h' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400'}`}>
                        24 / 7 Service
                      </button>
                      <button onClick={() => setForm({...form, working_hours: 'standard'})} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${form.working_hours === 'standard' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400'}`}>
                        Standard Hours
                      </button>
                    </div>
                  </div>

                  {/* MAP */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Set Precise Location</label>
                    <MapPicker lat={form.latitude} lng={form.longitude} onChange={(lat, lng) => setForm({...form, latitude: lat, longitude: lng})} />
                    {form.latitude !== 0 && (
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-center">✓ Location Captured: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>
                    )}
                  </div>

                  {/* Package */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Service Plan</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'trial', label: 'Trial', sub: '30 Days' },
                        { id: '1year', label: '1 Year', sub: '999 Birr' },
                        { id: '2year', label: '2 Years', sub: '1699 Birr' },
                        { id: '5year', label: '5 Years', sub: '2299 Birr' },
                      ].map(pkg => (
                        <button key={pkg.id} onClick={() => setForm({...form, subscription_tier: pkg.id})}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${
                            form.subscription_tier === pkg.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}>
                          <p className={`text-xs font-black uppercase ${form.subscription_tier === pkg.id ? 'text-emerald-700' : 'text-slate-900'}`}>{pkg.label}</p>
                          <p className="text-[9px] font-bold text-slate-400">{pkg.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={prevStep} className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all">
                      <ArrowLeft size={20} />
                    </button>
                    <button onClick={nextStep} className="flex-1 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black transition-all flex items-center justify-center gap-3">
                      Continue <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Verification */}
              {step === 3 && (
                <div className="space-y-8">
                  {form.subscription_tier !== 'trial' ? (
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Plan Details</p>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{form.subscription_tier.toUpperCase()}</p>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight">
                        {form.subscription_tier === '1year' ? '999' : form.subscription_tier === '2year' ? '1,699' : '2,299'} <span className="text-emerald-400">ETB</span>
                      </h3>
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Telebirr Account</p>
                        <p className="text-xl font-black tracking-widest">0900 123 456</p>
                        <p className="text-[10px] font-bold text-emerald-400 mt-2">Reference: {form.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem]">
                      <h3 className="text-xl font-black text-emerald-900">30-Day Free Trial</h3>
                      <p className="text-sm text-emerald-700 mt-2 font-medium">You've selected the trial period. You can upload a receipt now or later during your trial.</p>
                    </div>
                  )}

                  {/* TWO UPLOADS: ID and Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Upload */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pharmacist License / ID</label>
                      <div className="relative group cursor-pointer">
                        <div className="h-48 rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center transition-all group-hover:border-blue-200 group-hover:bg-blue-50/30 overflow-hidden">
                          {idPreviewUrl ? (
                            <img src={idPreviewUrl} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm mb-2">
                                <FileBadge size={20} />
                              </div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload ID Card</p>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'id')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>

                    {/* Payment Upload */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Receipt</label>
                      <div className="relative group cursor-pointer">
                        <div className="h-48 rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center transition-all group-hover:border-emerald-200 group-hover:bg-emerald-50/30 overflow-hidden">
                          {previewUrl ? (
                            <img src={previewUrl} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm mb-2">
                                <Upload size={20} />
                              </div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Receipt</p>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'payment')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={prevStep} className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all">
                      <ArrowLeft size={20} />
                    </button>
                    <button onClick={handleFinalSubmit} disabled={isLoading} className="flex-1 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
                      {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finish Registration <CheckCircle size={20} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="space-y-10 text-center py-8">
                  <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/40">
                    <CheckCircle size={48} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Application Submitted!</h2>
                    <p className="text-slate-500 font-medium mt-4 leading-relaxed max-w-sm mx-auto">
                      Thank you for joining MedLink. Our administrators will verify your license and payment within 24 hours.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button onClick={() => router.push('/login')} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black transition-all flex items-center justify-center gap-3">
                      Return to Login
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
