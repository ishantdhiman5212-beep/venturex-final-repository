import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Printer,
  Shield,
  Loader2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePingMEStore } from '../lib/store';
import { INSTITUTIONS, generateDocumentText, formatBytes } from '../data/mockData';
import { ApplicationUpload } from '../types';
import { verifyDocumentWithGemini } from '../lib/geminiOcr';

interface ApplyPageProps {
  serviceId: string;
  onNavigate: (path: string) => void;
}

export function ApplyPage({ serviceId, onNavigate }: ApplyPageProps) {
  const { services, createTokenAndApplication } = usePingMEStore();
  const service = services.find(s => s.id === serviceId) || services[0];
  const institution = INSTITUTIONS.find(i => i.id === service?.institutionId);

  const [step, setStep] = useState<number>(1);
  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [uploads, setUploads] = useState<ApplicationUpload[]>([]);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample data filler helper
  const handleFillSample = () => {
    setCitizenName('Ananya Sharma');
    setPhone('9876543210');
    setPriority(false);

    const sampleValues: Record<string, string> = {
      fatherName: 'Rajesh Sharma',
      occupation: 'Private Service',
      annualIncome: '180000',
      purpose: 'Scholarship',
      address: 'Flat 402, Green Valley Apartments, MG Road, Sector 4',
      age: '28',
      gender: 'Female',
      symptoms: 'Mild fever and cough since 2 days',
      visitType: 'New patient',
      childName: 'Aarav Sharma',
      testType: 'Blood test',
      doctor: 'Dr. V. K. Gupta',
      yearsResiding: '7',
      cardNumber: 'RC-99827364',
      institute: 'State University of Technology',
      course: 'B.Tech Computer Science 3rd Year',
      lastPercentage: '84',
      school: 'Government Model Senior Secondary School',
      yearOfLeaving: '2023',
      rollNo: 'COUNS-2026-98124',
      category: 'General',
    };

    setFormData(prev => ({ ...sampleValues, ...prev }));
    setErrorMsg('');
  };

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || citizenName.trim().length < 3) {
      setErrorMsg('Please enter your full legal name (at least 3 characters).');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    // Check required fields
    for (const f of service.fields) {
      if (f.required && !formData[f.id]?.trim()) {
        setErrorMsg(`Please fill in "${f.label}".`);
        return;
      }
    }

    setErrorMsg('');
    const draft = generateDocumentText(service, institution!, formData, citizenName, Date.now());
    setGeneratedDraft(draft);

    if (service.category === 'hospital' && service.documents.length === 0) {
      // Direct jump to review step for simple OPD
      setStep(4);
    } else {
      setStep(2);
    }
  };

  const handleUploadFile = async (reqId: string, file: File) => {
    setVerifyingDocId(reqId);
    try {
      const ocrResult = await verifyDocumentWithGemini(file, reqId, citizenName);
      const newUpload: ApplicationUpload = {
        requirementId: reqId,
        fileName: file.name,
        sizeBytes: file.size,
        mimeType: file.type || 'application/pdf',
        uploadedAt: Date.now(),
        simulated: false,
        ocrVerified: ocrResult.verified,
        ocrScore: ocrResult.score,
        ocrDetails: ocrResult.summary,
      };

      setUploads(prev => [...prev.filter(u => u.requirementId !== reqId), newUpload]);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleAutofillDocuments = () => {
    const autoUploads: ApplicationUpload[] = service.documents.map(d => ({
      requirementId: d.id,
      fileName: `${d.id}-verified-copy.pdf`,
      sizeBytes: 340000 + Math.floor(Math.random() * 400000),
      mimeType: 'application/pdf',
      uploadedAt: Date.now(),
      simulated: true,
      ocrVerified: true,
      ocrScore: 98,
      ocrDetails: `PingME OCR Verified: Authenticated ${d.label} with matching applicant name.`,
    }));
    setUploads(autoUploads);
  };

  const handleSubmitApplication = () => {
    try {
      const token = createTokenAndApplication({
        serviceId: service.id,
        citizenName,
        phone,
        priority,
        formData,
        uploads,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onNavigate(`/token/${token.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating application');
    }
  };

  const requiredDocs = service.documents.filter(d => d.required);
  const uploadedRequiredCount = requiredDocs.filter(d => uploads.some(u => u.requirementId === d.id)).length;
  const allRequiredUploaded = requiredDocs.length === 0 || uploadedRequiredCount === requiredDocs.length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
        <button
          onClick={() => onNavigate(`/services/${service.id}`)}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {service.name}
        </button>
        <span>/</span>
        <span className="text-foreground font-semibold">Guided application</span>
      </div>

      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Guided application
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          {service.name} · {institution?.name}
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="mt-6 mb-8">
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: 'Your details' },
            { num: 2, label: 'Document draft' },
            { num: 3, label: 'Upload documents' },
            { num: 4, label: 'Check & get token' },
          ].map(s => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDone ? 'bg-primary' : isCurrent ? 'bg-primary/80' : 'bg-muted'
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold truncate ${
                    isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Your Details */}
      {step === 1 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Tell us about yourself</h2>
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="size-3 text-primary" />
              Fill sample answers
            </button>
          </div>

          <form onSubmit={handleStep1Continue} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Full legal name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={citizenName}
                onChange={e => setCitizenName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Mobile number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Token alerts and queue updates are sent here (simulated SMS).
              </p>
            </div>

            {/* Dynamic service-specific fields */}
            {service.fields.map(f => (
              <div key={f.id}>
                <label className="text-xs font-bold text-foreground block mb-1">
                  {f.label} {f.required && <span className="text-rose-500">*</span>}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={formData[f.id] || ''}
                    onChange={e => setFormData({ ...formData, [f.id]: e.target.value })}
                    required={f.required}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Select option…</option>
                    {f.options?.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={formData[f.id] || ''}
                    onChange={e => setFormData({ ...formData, [f.id]: e.target.value })}
                    required={f.required}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={formData[f.id] || ''}
                    onChange={e => setFormData({ ...formData, [f.id]: e.target.value })}
                    required={f.required}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                )}
              </div>
            ))}

            {/* Priority Checkbox */}
            <div className="rounded-xl border border-border bg-muted/40 p-3.5 flex items-start gap-3">
              <input
                type="checkbox"
                id="priority"
                checked={priority}
                onChange={e => setPriority(e.target.checked)}
                className="mt-1 size-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="priority" className="text-xs cursor-pointer">
                <span className="font-bold text-foreground block">Priority assistance</span>
                <span className="text-muted-foreground block mt-0.5">
                  Senior citizen, person with disability, pregnant woman or medical emergency. Priority tokens are scheduled ahead in the queue.
                </span>
              </label>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" />
                {errorMsg}
              </p>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
              >
                Continue
                <ArrowRight className="size-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Document Draft */}
      {step === 2 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Review generated document</h2>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Printer className="size-3.5" />
              Print
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Based on your answers, we drafted this formal application petition. You can review or edit it below.
          </p>

          <textarea
            rows={14}
            value={generatedDraft}
            onChange={e => setGeneratedDraft(e.target.value)}
            className="w-full font-mono text-xs leading-relaxed p-4 rounded-xl border border-input bg-muted/30 focus:border-primary focus:outline-none"
          />

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(service.documents.length === 0 ? 4 : 3)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Continue to document upload
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Upload Documents */}
      {step === 3 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Upload required documents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Our OCR & AI completeness check verifies every document before you enter the queue.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutofillDocuments}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="size-3 text-primary" />
              Autofill demo files
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {service.documents.map(doc => {
              const uploaded = uploads.find(u => u.requirementId === doc.id);
              const isVerifying = verifyingDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`rounded-xl border p-4 transition-all ${
                    uploaded
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{doc.label}</span>
                        {doc.required ? (
                          <span className="rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-bold text-rose-600 border border-rose-200">
                            Required
                          </span>
                        ) : (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </div>
                      {doc.hint && (
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.hint}</p>
                      )}
                    </div>

                    {/* Upload actions */}
                    <div className="flex items-center gap-2">
                      {isVerifying ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <Loader2 className="size-4 animate-spin" />
                          Checking OCR…
                        </span>
                      ) : uploaded ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="size-3.5" />
                              {uploaded.ocrScore}% Verified
                            </span>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {uploaded.fileName} ({formatBytes(uploaded.sizeBytes)})
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploads(prev => prev.filter(u => u.requirementId !== doc.id))}
                            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                            title="Remove file"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted shadow-xs transition-colors">
                          <Upload className="size-3.5 text-primary" />
                          Upload file
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg"
                            className="sr-only"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadFile(doc.id, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {uploaded && uploaded.ocrDetails && (
                    <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-100/60 rounded-lg p-2 border border-emerald-200/50">
                      {uploaded.ocrDetails}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Back
            </button>

            <button
              type="button"
              disabled={!allRequiredUploaded}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Continue to final review
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Check & Get Token */}
      {step === 4 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="text-center">
            <div className="size-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto grid place-items-center mb-3">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground">
              Readiness gate passed!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Your application details and document checks are 100% complete. Click below to issue your live digital queue token.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Service</span>
              <span className="font-bold text-foreground">{service.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Institution</span>
              <span className="font-semibold text-foreground">{institution?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Applicant</span>
              <span className="font-semibold text-foreground">{citizenName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Mobile alerts</span>
              <span className="font-mono text-foreground">{phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Priority tier</span>
              <span className="font-semibold text-foreground">
                {priority ? 'Priority scheduled' : 'Standard queue'}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(service.documents.length === 0 ? 1 : 3)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSubmitApplication}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-elevated hover:bg-primary/90 transition-all cursor-pointer active:scale-98"
            >
              Issue Digital Token
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
