'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle, XCircle, FileImage, Download,
  Eye, File as FileIcon, Scan, Sparkles, X, Loader2
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import api, { scanPrescriptionOCR } from '@/services/api';

type PrescriptionStatus = 'pending' | 'approved' | 'rejected';

interface Prescription {
  id: string;
  patient_name: string;
  document: string;         // URL from backend
  document_type?: string;   // mime type
  status: PrescriptionStatus;
  created_at: string;
  notes?: string;
  ocr_result?: string;      // filled after AI scan
}

function getDocType(url: string): string {
  if (!url) return 'application/octet-stream';
  const ext = url.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  if (ext === 'pdf') return 'application/pdf';
  return 'application/octet-stream';
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<PrescriptionStatus>('pending');
  const [selectedDoc, setSelectedDoc] = useState<Prescription | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanTarget, setScanTarget] = useState<string | null>(null);

  useEffect(() => { fetchPrescriptions(); }, []);

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/prescriptions/');
      setPrescriptions(res.data);
    } catch (err: any) {
      setError('Could not load prescriptions. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: PrescriptionStatus) => {
    try {
      await api.patch(`/prescriptions/${id}/`, { status: newStatus });
      setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      if (selectedDoc?.id === id) setSelectedDoc(prev => prev ? { ...prev, status: newStatus } : null);
    } catch {
      alert('Failed to update prescription status. Please try again.');
    }
  };

  // AI OCR: call /api/ai/ocr/ with the image file
  const handleOCRScan = async (file: File, prescriptionId: string) => {
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const data = await scanPrescriptionOCR(file);
      const text = data?.medicines?.join(', ') || data?.text || data?.result || JSON.stringify(data);
      setOcrResult(text);
      setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, ocr_result: text } : p));
    } catch {
      setOcrResult('AI scan failed. The backend OCR service may be unavailable.');
    } finally {
      setOcrLoading(false);
    }
  };

  const triggerOCRForDoc = async (doc: Prescription) => {
    // Fetch the image from the URL and convert to File, then send to OCR
    setScanTarget(doc.id);
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const response = await fetch(doc.document);
      const blob = await response.blob();
      const file = new File([blob], 'prescription.jpg', { type: blob.type });
      await handleOCRScan(file, doc.id);
    } catch {
      setOcrResult('Could not fetch the document image for scanning.');
      setOcrLoading(false);
    }
    setScanTarget(null);
  };

  const filtered = prescriptions.filter(p => p.status === filter);

  const getDocumentIcon = (url: string) => {
    const type = getDocType(url);
    if (type.startsWith('image/')) return <FileImage size={22} className="text-blue-400" />;
    if (type === 'application/pdf') return <FileText size={22} className="text-red-400" />;
    return <FileIcon size={22} className="text-slate-400" />;
  };

  const isImage = (url: string) => getDocType(url).startsWith('image/');
  const isPDF = (url: string) => getDocType(url) === 'application/pdf';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Approvals"
        subtitle="Review and approve patient-uploaded prescriptions and medical documents"
        breadcrumb={['Pharmacist', 'Prescriptions']}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {(['pending', 'approved', 'rejected'] as PrescriptionStatus[]).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-5 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
              filter === s ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}>
            {s}
            {s === 'pending' && prescriptions.filter(p => p.status === 'pending').length > 0 && (
              <span className="ml-1.5 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                {prescriptions.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-16"><span className="w-8 h-8 border-4 border-slate-600 border-t-teal-500 rounded-full animate-spin" /></div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-16 bg-slate-800 rounded-xl border border-slate-700">
          <FileText size={44} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-base font-medium text-slate-400">No {filter} documents</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all flex flex-col">
              {/* Document preview thumbnail */}
              <div className="h-36 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {isImage(doc.document) ? (
                  <img src={doc.document} alt="Prescription" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    {getDocumentIcon(doc.document)}
                    <span className="text-xs">{isPDF(doc.document) ? 'PDF Document' : 'File'}</span>
                  </div>
                )}
                {doc.ocr_result && (
                  <div className="absolute top-2 right-2 bg-teal-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Scanned
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <h4 className="font-semibold text-slate-200 truncate">{doc.patient_name || 'Unknown Patient'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(doc.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>

                {doc.ocr_result && (
                  <div className="p-2.5 bg-teal-500/5 border border-teal-500/20 rounded-lg">
                    <p className="text-xs font-medium text-teal-400 flex items-center gap-1 mb-1"><Sparkles size={11} /> AI Detected Medicines</p>
                    <p className="text-xs text-slate-300">{doc.ocr_result}</p>
                  </div>
                )}

                <div className="mt-auto flex gap-2">
                  <button onClick={() => setSelectedDoc(doc)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
                    <Eye size={14} /> View
                  </button>
                  {isImage(doc.document) && filter === 'pending' && (
                    <button
                      onClick={() => triggerOCRForDoc(doc)}
                      disabled={ocrLoading && scanTarget === doc.id}
                      className="py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-indigo-500/20 disabled:opacity-50"
                      title="Scan with AI OCR"
                    >
                      {ocrLoading && scanTarget === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Scan size={14} />} AI Scan
                    </button>
                  )}
                  {filter === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(doc.id, 'approved')}
                        className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg transition-colors border border-teal-500/20" title="Approve">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => handleStatusUpdate(doc.id, 'rejected')}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20" title="Reject">
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedDoc(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-3">
                  {getDocumentIcon(selectedDoc.document)}
                  <div>
                    <h3 className="font-semibold text-slate-200">{selectedDoc.patient_name || 'Unknown Patient'}'s Document</h3>
                    <p className="text-xs text-slate-500">{new Date(selectedDoc.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-white p-1"><X size={22} /></button>
              </div>

              {/* Document viewer */}
              <div className="flex-1 overflow-auto p-4 bg-slate-900/30 flex items-center justify-center min-h-[360px]">
                {isImage(selectedDoc.document) ? (
                  <img src={selectedDoc.document} alt="Prescription" className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-xl" />
                ) : isPDF(selectedDoc.document) ? (
                  <iframe src={selectedDoc.document} className="w-full h-[55vh] rounded-lg bg-white border border-slate-700" title="PDF" />
                ) : (
                  <div className="text-center">
                    <FileIcon size={56} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-300 mb-4">This file type cannot be previewed.</p>
                    <a href={selectedDoc.document} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors font-medium">
                      <Download size={18} /> Download to View
                    </a>
                  </div>
                )}
              </div>

              {/* OCR result area */}
              {selectedDoc.ocr_result && (
                <div className="px-5 py-3 bg-indigo-500/5 border-t border-indigo-500/20 shrink-0">
                  <p className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 mb-1"><Sparkles size={12} /> AI-Detected Medicines</p>
                  <p className="text-sm text-slate-300">{selectedDoc.ocr_result}</p>
                </div>
              )}

              {/* Footer actions */}
              {selectedDoc.status === 'pending' && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex flex-wrap justify-between items-center gap-3 shrink-0">
                  {isImage(selectedDoc.document) && (
                    <button
                      onClick={() => triggerOCRForDoc(selectedDoc)}
                      disabled={ocrLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-colors text-sm font-medium border border-indigo-500/20 disabled:opacity-50">
                      {ocrLoading ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />} Scan with AI
                    </button>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button onClick={() => handleStatusUpdate(selectedDoc.id, 'rejected')}
                      className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20">
                      Reject Document
                    </button>
                    <button onClick={() => handleStatusUpdate(selectedDoc.id, 'approved')}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors text-sm font-medium">
                      Approve Document
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
