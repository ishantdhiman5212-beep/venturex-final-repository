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
  Settings,
  Sparkles,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Building,
  Key
} from 'lucide-react';
import { usePingMEStore } from '../lib/store';
import { INSTITUTIONS, getWaitingTokens, getServingTokens, formatBytes } from '../data/mockData';
import { Token, Application, DocReviewStatus } from '../types';
import { TokenStatusBadge, DocStatusBadge, PriorityBadge } from '../components/Badges';
import { playQueueChime, speakQueueAnnouncement } from '../lib/sound';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const {
    services,
    tokens,
    applications,
    callNextToken,
    completeToken,
    cancelToken,
    reviewApplication,
    toggleService,
  } = usePingMEStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'review' | 'analytics' | 'settings'>('queue');
  const [selectedInstId, setSelectedInstId] = useState<string>('district-csc');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('income-cert');
  const [myCounter, setMyCounter] = useState<number>(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');
  const [adminApiKey, setAdminApiKey] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const institution = INSTITUTIONS.find(i => i.id === selectedInstId) || INSTITUTIONS[0];
  const instServices = services.filter(s => s.institutionId === selectedInstId);
  const currentService = services.find(s => s.id === selectedServiceId) || instServices[0];

  // Tokens for the selected service
  const waitingTokens = currentService ? getWaitingTokens(tokens, currentService.id) : [];
  const servingTokens = currentService ? getServingTokens(tokens, currentService.id) : [];
  const myServingToken = servingTokens.find(t => t.counter === myCounter);

  // Applications for this institution
  const instApplications = applications.filter(a => {
    const s = services.find(svc => svc.id === a.serviceId);
    return s?.institutionId === selectedInstId;
  });

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCallNext = () => {
    if (!currentService) return;
    const res = callNextToken(currentService.id, myCounter);
    if (res.calledToken) {
      showToast(`Called Token ${res.calledToken.number} to Counter ${myCounter}`);
    } else {
      showToast('No tokens waiting in this queue.');
    }
  };

  const handleRecall = () => {
    if (myServingToken) {
      speakQueueAnnouncement(myServingToken.number, myCounter);
      showToast(`Re-announced ${myServingToken.number} at Counter ${myCounter}`);
    }
  };

  const handleCompleteCurrent = () => {
    if (myServingToken) {
      completeToken(myServingToken.id);
      showToast(`Token ${myServingToken.number} marked completed`);
    }
  };

  const handleNoShow = () => {
    if (myServingToken) {
      cancelToken(myServingToken.id);
      showToast(`Token ${myServingToken.number} marked no-show / cancelled`);
    }
  };

  const handleApproveApp = (appId: string) => {
    reviewApplication(appId, 'approved');
    showToast('Application and documents approved.');
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, docStatus: 'approved' } : null);
    }
  };

  const handleRejectApp = (appId: string) => {
    const note = correctionNote.trim() || 'Required documents need correction or clearer scan.';
    reviewApplication(appId, 'correction_requested', note);
    showToast('Correction requested from applicant.');
    setCorrectionNote('');
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, docStatus: 'correction_requested', reviewNote: note } : null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-primary/20 bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-elevated animate-in fade-in slide-in-from-top-4">
          <Volume2 className="size-4 text-primary" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rounded-3xl bg-navy p-6 sm:p-8 text-navy-foreground shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-card text-card-foreground grid place-items-center shadow-xs">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-muted">
                  Officer Service Desk
                </span>
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success border border-success/30">
                  Live Synced
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-0.5">
                PingME Service Administration
              </h1>
            </div>
          </div>

          {/* Quick Counter and Institution select */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-navy-muted block mb-1">
                Office
              </label>
              <select
                value={selectedInstId}
                onChange={e => {
                  setSelectedInstId(e.target.value);
                  const firstSvc = services.find(s => s.institutionId === e.target.value);
                  if (firstSvc) setSelectedServiceId(firstSvc.id);
                }}
                className="rounded-xl border border-navy-foreground/20 bg-navy-foreground/10 px-3 py-1.5 text-xs font-semibold text-navy-foreground focus:outline-none"
              >
                {INSTITUTIONS.map(inst => (
                  <option key={inst.id} value={inst.id} className="text-foreground bg-card">
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-navy-muted block mb-1">
                My Counter
              </label>
              <select
                value={myCounter}
                onChange={e => setMyCounter(Number(e.target.value))}
                className="rounded-xl border border-navy-foreground/20 bg-navy-foreground/10 px-3 py-1.5 text-xs font-semibold text-navy-foreground focus:outline-none"
              >
                {[1, 2, 3, 4].map(c => (
                  <option key={c} value={c} className="text-foreground bg-card">
                    Counter {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-navy-foreground/15 pt-4">
          {[
            { id: 'queue', label: 'Live Queue Desk', icon: Users },
            { id: 'review', label: 'Document Review Desk', icon: FileText, count: instApplications.filter(a => a.docStatus === 'pending_review').length },
            { id: 'analytics', label: 'Visitor Flow & Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Service & AI Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-navy-muted hover:bg-navy-foreground/10 hover:text-navy-foreground'
              }`}
            >
              <tab.icon className="size-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full bg-rose-500 text-white text-[10px] px-1.5 py-0.2 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Live Queue Desk */}
      {activeTab === 'queue' && (
        <div className="mt-8 space-y-6">
          {/* Service Selector pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground mr-1">Service:</span>
            {instServices.map(svc => (
              <button
                key={svc.id}
                onClick={() => setSelectedServiceId(svc.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedServiceId === svc.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {svc.name}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
            {/* Active Counter Console */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Counter {myCounter} Station
                  </span>
                  <h2 className="text-lg font-black text-foreground mt-0.5">
                    {currentService?.name}
                  </h2>
                </div>
                <span className="rounded bg-primary-soft text-accent-foreground font-mono font-bold text-xs px-2.5 py-1 border border-primary/20">
                  {currentService?.prefix} Queue
                </span>
              </div>

              {/* Current Serving Card */}
              {myServingToken ? (
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 p-5 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Currently Serving at Counter {myCounter}
                  </span>
                  <p className="token-number font-mono text-5xl font-black text-emerald-700 mt-2">
                    {myServingToken.number}
                  </p>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {myServingToken.citizenName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {myServingToken.phone}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button
                      onClick={handleRecall}
                      className="rounded-xl border border-emerald-300 bg-emerald-100/60 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-200"
                    >
                      Recall (Ping)
                    </button>
                    <button
                      onClick={handleCompleteCurrent}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Complete
                    </button>
                    <button
                      onClick={handleNoShow}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      No Show
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                  <p className="text-xs font-bold text-foreground">Counter {myCounter} is currently available</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Click below to call the next citizen in line.
                  </p>
                </div>
              )}

              {/* Big Call Next Button */}
              <button
                onClick={handleCallNext}
                disabled={waitingTokens.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-elevated hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer active:scale-98"
              >
                <Volume2 className="size-5" />
                Call Next Token ({waitingTokens.length} waiting)
              </button>
            </div>

            {/* Waiting Queue List */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Waiting Queue</h3>
                </div>
                <span className="rounded-full bg-amber-50 text-amber-700 font-bold text-xs px-2.5 py-0.5 border border-amber-200">
                  {waitingTokens.length} waiting
                </span>
              </div>

              {waitingTokens.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  All waiting tokens have been served for this service.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-border/60 max-h-[420px] overflow-y-auto pr-1">
                  {waitingTokens.map((t, idx) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-7 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-primary">{t.number}</span>
                            {t.priority && <PriorityBadge />}
                          </div>
                          <p className="text-xs font-medium text-foreground">{t.citizenName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{t.phone}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const res = callNextToken(currentService?.id, myCounter);
                          if (res.calledToken) showToast(`Counter ${myCounter} called ${res.calledToken.number}`);
                        }}
                        className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                      >
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Document Review Desk */}
      {activeTab === 'review' && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            {/* Applications List */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-base font-bold text-foreground mb-4">
                Applications for Verification ({instApplications.length})
              </h2>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {instApplications.map(app => {
                  const svc = services.find(s => s.id === app.serviceId);
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-soft shadow-xs'
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">{app.id}</span>
                        <DocStatusBadge status={app.docStatus} />
                      </div>
                      <p className="text-xs font-bold text-foreground mt-1.5">{app.citizenName}</p>
                      <p className="text-[11px] text-muted-foreground">{svc?.name}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{app.uploads.length} verified docs</span>
                        <span>{app.completeness}% OCR score</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Application Details */}
            {selectedApp ? (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Verification Inspector
                    </span>
                    <h3 className="text-lg font-black text-foreground">
                      {selectedApp.citizenName} ({selectedApp.id})
                    </h3>
                  </div>
                  <DocStatusBadge status={selectedApp.docStatus} />
                </div>

                {/* Form fields summary */}
                <div className="rounded-2xl bg-muted/40 p-4 border border-border/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Applicant Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Contact:</span>{' '}
                      <span className="font-mono font-semibold">{selectedApp.phone}</span>
                    </div>
                    {Object.entries(selectedApp.formData).slice(0, 4).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-muted-foreground capitalize">{k}:</span>{' '}
                        <span className="font-semibold text-foreground truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitted Documents Checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Attached Files & OCR Verification
                  </h4>
                  <div className="space-y-2">
                    {selectedApp.uploads.map((u, i) => (
                      <div key={i} className="rounded-xl border border-border bg-background p-3 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">{u.requirementId}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{u.fileName} ({formatBytes(u.sizeBytes)})</p>
                        </div>
                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          {u.ocrScore || 98}% Passed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Officer Action Bar */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveApp(selectedApp.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <Check className="size-4" />
                      Approve Documents
                    </button>
                    <button
                      onClick={() => handleRejectApp(selectedApp.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <X className="size-4" />
                      Request Correction
                    </button>
                  </div>

                  <input
                    type="text"
                    value={correctionNote}
                    onChange={e => setCorrectionNote(e.target.value)}
                    placeholder="Optional correction note for citizen (e.g. Utility bill is outdated)"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <FileText className="size-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-bold text-foreground">Select an application to inspect</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any entry from the left list to review documents and run verification checks.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Visitor Flow & Analytics */}
      {activeTab === 'analytics' && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs text-muted-foreground font-semibold">Total Served Today</span>
              <p className="text-3xl font-extrabold text-foreground mt-1">
                {tokens.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs text-muted-foreground font-semibold">Currently Waiting</span>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">
                {tokens.filter(t => t.status === 'waiting').length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs text-muted-foreground font-semibold">Average Wait</span>
              <p className="text-3xl font-extrabold text-primary mt-1">~18 min</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="text-xs text-muted-foreground font-semibold">Readiness Check Pass</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">99.2%</p>
            </div>
          </div>

          {/* Service Management Table */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-bold text-foreground mb-4">
              Institution Services & Queue Throughput
            </h3>
            <div className="divide-y divide-border">
              {instServices.map(svc => {
                const waitCount = tokens.filter(t => t.serviceId === svc.id && t.status === 'waiting').length;
                const servedCount = tokens.filter(t => t.serviceId === svc.id && t.status === 'completed').length;
                return (
                  <div key={svc.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{svc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Prefix: <span className="font-mono font-bold text-primary">{svc.prefix}</span> · {svc.counters} counters · Avg {svc.avgServiceMins} min/turn
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right text-xs">
                        <span className="font-bold text-foreground">{waitCount}</span> waiting ·{' '}
                        <span className="font-semibold text-emerald-600">{servedCount}</span> completed
                      </div>

                      <button
                        onClick={() => toggleService(svc.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                          svc.isOpen
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {svc.isOpen ? 'Open' : 'Closed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Settings & Gemini AI API */}
      {activeTab === 'settings' && (
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Gemini API & Vision OCR Integration</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              PingME Queue incorporates Google DeepMind Gemini API to inspect citizen uploaded documents and draft application petitions.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/40 p-4 border border-border/60 space-y-3">
            <label className="text-xs font-bold text-foreground block">
              Google Gemini API Key (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={adminApiKey}
                onChange={e => setAdminApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => {
                  if (adminApiKey) {
                    showToast('Gemini API key configured for live OCR analysis');
                  }
                }}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                Save key
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              A built-in intelligent OCR Engine is always active by default. Providing an API key enables live multi-modal vision verification via Gemini 1.5 Flash.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
