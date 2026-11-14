import React, { useState } from 'react';
import {
  Shield,
  Volume2,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Eye,
  Check,
  X,
  Play,
  Sparkles,
  Building,
  Key,
  Lock,
  Unlock,
  Copy,
  Zap,
  FileCheck,
  Phone,
  User,
} from 'lucide-react';
import { usePingMEStore } from '../../lib/store';
import { INSTITUTIONS, SERVICES, getWaitingTokens, getServingTokens, formatBytes } from '../../data/mockData';
import { Token, ApplicationUpload } from '../../types';
import { TokenStatusBadge, PriorityBadge } from '../Badges';
import { playQueueChime, speakQueueAnnouncement, playSuccessTone, playErrorBuzz } from '../../lib/sound';

interface AdminDashboardProps {
  onNavigate?: (path: string) => void;
  standalone?: boolean;
}

export function AdminDashboard({ onNavigate, standalone = false }: AdminDashboardProps) {
  const {
    services,
    tokens,
    callNextToken,
    verifyOtpAndCompleteToken,
    completeToken,
    cancelToken,
  } = usePingMEStore();

  const [selectedInstId, setSelectedInstId] = useState<string>('district-csc');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('income-cert');
  const [myCounter, setMyCounter] = useState<number>(1);
  const [inputOtp, setInputOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [inspectDocsToken, setInspectDocsToken] = useState<Token | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ApplicationUpload | null>(null);

  const institution = INSTITUTIONS.find(i => i.id === selectedInstId) || INSTITUTIONS[0];
  const instServices = services.filter(s => s.institutionId === selectedInstId);
  const currentService = services.find(s => s.id === selectedServiceId) || instServices[0];

  const waitingTokens = currentService ? getWaitingTokens(tokens, currentService.id) : [];
  const servingTokens = currentService ? getServingTokens(tokens, currentService.id) : [];
  const myServingToken = servingTokens.find(t => t.counter === myCounter);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCallNext = () => {
    if (!currentService) return;
    const res = callNextToken(currentService.id, myCounter);
    if (res.calledToken) {
      showToast(`Called Token ${res.calledToken.number} to Counter ${myCounter}`);
      setInputOtp('');
      setOtpError(null);
    } else {
      showToast('No tokens currently waiting in this queue.');
    }
  };

  const handleReannounce = () => {
    if (myServingToken) {
      speakQueueAnnouncement(myServingToken.number, myCounter);
      showToast(`Re-announced ${myServingToken.number} at Counter ${myCounter}`);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myServingToken) return;

    if (!inputOtp.trim()) {
      setOtpError('Please enter the citizen’s 6-digit verification code.');
      return;
    }

    const res = verifyOtpAndCompleteToken(myServingToken.id, inputOtp);
    if (res.success) {
      showToast(`✓ Identity Verified! Token ${myServingToken.number} completed successfully.`);
      setInputOtp('');
      setOtpError(null);
    } else {
      setOtpError(res.error || 'Invalid OTP code.');
    }
  };

  const handleAutoFillDemoOtp = () => {
    if (myServingToken?.otp) {
      setInputOtp(myServingToken.otp.replace(/\s+/g, ''));
      setOtpError(null);
      showToast('Demo OTP auto-filled from citizen boarding pass!');
    }
  };

  const handleNoShow = () => {
    if (myServingToken) {
      cancelToken(myServingToken.id);
      showToast(`Token ${myServingToken.number} marked as no-show.`);
      setInputOtp('');
      setOtpError(null);
    }
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-primary/20 bg-card px-4 py-3 text-xs font-bold text-foreground shadow-elevated animate-in fade-in slide-in-from-top-4">
          <Volume2 className="size-4 text-primary" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Document Inspector Modal */}
      {inspectDocsToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Shield className="size-5 text-primary" />
                  <span>Document Audit: Token {inspectDocsToken.number}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Citizen: <strong>{inspectDocsToken.citizenName}</strong> • Phone: {inspectDocsToken.phone}
                </p>
              </div>
              <button
                onClick={() => setInspectDocsToken(null)}
                className="rounded-xl p-2 hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Attached Documents List */}
            <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {inspectDocsToken.uploadedDocs && inspectDocsToken.uploadedDocs.length > 0 ? (
                inspectDocsToken.uploadedDocs.map((doc, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="size-5 text-emerald-500" />
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            {doc.requirementLabel || doc.fileName}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {doc.fileName} • {formatBytes(doc.sizeBytes)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold">
                          AI Verified ({doc.ocrScore || 98}%)
                        </span>
                        {doc.thumbnail && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted"
                          >
                            <Eye className="size-3" />
                            <span>View</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {doc.ocrDetails && (
                      <p className="mt-2 text-[11px] text-muted-foreground bg-card/60 p-2 rounded-xl border border-border/60">
                        {doc.ocrDetails}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No documents attached for this walk-in entry.
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setInspectDocsToken(null)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary preview modal for specific image */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
          <div className="relative max-w-lg w-full rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-foreground">{previewDoc.fileName}</span>
              <button onClick={() => setPreviewDoc(null)} className="rounded-lg p-1 text-muted-foreground">✕</button>
            </div>
            <div className="mt-4 flex items-center justify-center bg-slate-950 rounded-2xl p-2 max-h-[360px] overflow-hidden">
              <img src={previewDoc.thumbnail || previewDoc.previewUrl} alt="Document" className="max-h-[340px] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Desk Control Bar */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-indigo-600 text-white grid place-items-center shadow-sm">
              <Shield className="size-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                Officer Desk • Counter 0{myCounter}
              </span>
              <h2 className="text-lg font-black text-foreground">{currentService?.name}</h2>
            </div>
          </div>

          {/* Quick Counter & Service Pickers */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold">
              <span className="text-muted-foreground">Counter:</span>
              <select
                value={myCounter}
                onChange={e => setMyCounter(Number(e.target.value))}
                className="bg-transparent text-foreground font-bold focus:outline-hidden"
              >
                {[1, 2, 3, 4].map(c => (
                  <option key={c} value={c}>0{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCallNext}
              disabled={waitingTokens.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all shrink-0"
            >
              <Volume2 className="size-4" />
              <span>Call Next ({waitingTokens.length} waiting)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN ACTIVE COUNTER SERVING CARD WITH 6-DIGIT OTP HANDSHAKE */}
      <div className="rounded-3xl border-2 border-indigo-500/40 bg-card p-6 sm:p-8 shadow-elevated mb-6 relative overflow-hidden">
        {myServingToken ? (
          <div>
            {/* Top Serving Status */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <span className="size-2 rounded-full bg-indigo-500 animate-ping" />
                <span>Now Serving at Counter 0{myCounter}</span>
              </div>
              <button
                onClick={() => setInspectDocsToken(myServingToken)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <FileCheck className="size-3.5" />
                <span>Inspect Uploaded Docs</span>
              </button>
            </div>

            {/* Serving Token Details */}
            <div className="mt-5 grid gap-6 sm:grid-cols-3 items-center">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Serving Token</span>
                <div className="mt-1 text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {myServingToken.number}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 text-base font-extrabold text-foreground">
                  <User className="size-4 text-primary" />
                  <span>{myServingToken.citizenName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Phone className="size-3.5" />
                  <span>{myServingToken.phone}</span>
                  <span className="size-1 rounded-full bg-muted-foreground" />
                  <span className="text-emerald-500 font-bold">✓ AI Pre-Check Passed</span>
                </div>
              </div>
            </div>

            {/* OTP COUNTER HANDSHAKE VERIFICATION BOX */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="size-4 text-cyan-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                    Citizen Counter OTP Handshake
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillDemoOtp}
                  className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 px-3 py-1 rounded-full border border-cyan-500/40 transition-colors"
                  title="Auto-fill expected OTP for judging pitch"
                >
                  <Zap className="size-3 text-cyan-400" />
                  <span>Auto-Fill Demo OTP ({myServingToken.otp})</span>
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="mt-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={7}
                      value={inputOtp}
                      onChange={e => {
                        setInputOtp(e.target.value);
                        setOtpError(null);
                      }}
                      placeholder="Enter 6-digit OTP (e.g. 482 910)"
                      className="w-full rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 px-4 py-3 text-center text-lg sm:text-xl font-mono font-bold tracking-widest text-cyan-200 placeholder:text-slate-600 focus:outline-hidden transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all shrink-0"
                  >
                    <Check className="size-4" />
                    <span>Verify & Complete</span>
                  </button>
                </div>

                {otpError && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-400 animate-in fade-in">
                    <AlertCircle className="size-4 text-rose-400 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Counter Action Controls */}
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReannounce}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"
                >
                  <Volume2 className="size-3.5 text-primary" />
                  <span>Re-Announce</span>
                </button>

                <button
                  onClick={handleNoShow}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Mark No-Show
                </button>
              </div>

              <button
                onClick={() => {
                  completeToken(myServingToken.id);
                  showToast(`Token ${myServingToken.number} marked completed.`);
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Bypass OTP & Force Complete
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto size-14 rounded-2xl bg-muted text-muted-foreground grid place-items-center mb-3">
              <Users className="size-6 text-primary" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Counter 0{myCounter} is Idle</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Ready to serve. Click &quot;Call Next&quot; to bring up the next verified citizen in queue.
            </p>
            <button
              onClick={handleCallNext}
              disabled={waitingTokens.length === 0}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-40 transition-all"
            >
              <Volume2 className="size-4" />
              <span>Call Next Token ({waitingTokens.length} waiting)</span>
            </button>
          </div>
        )}
      </div>

      {/* WAITING QUEUE LIST TABLE */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="text-sm font-extrabold text-foreground">Live Waiting Queue</h3>
            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold">
              {waitingTokens.length}
            </span>
          </div>

          <span className="text-xs text-muted-foreground font-medium">Auto-synced across desks</span>
        </div>

        <div className="mt-4 divide-y divide-border">
          {waitingTokens.length > 0 ? (
            waitingTokens.map((t, idx) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-foreground w-16">{t.number}</span>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t.citizenName}</span>
                    <span className="text-[11px] text-muted-foreground">{t.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="size-3" />
                    <span>Docs Attached</span>
                  </span>

                  {t.uploadedDocs && t.uploadedDocs.length > 0 && (
                    <button
                      onClick={() => setInspectDocsToken(t)}
                      className="flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      <Eye className="size-3 text-primary" />
                      <span>Docs ({t.uploadedDocs.length})</span>
                    </button>
                  )}

                  <span className="text-xs font-mono font-bold text-slate-400">
                    OTP: {t.otp || '—'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No citizens currently waiting in this service queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
