import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Share2,
  Volume2,
  FileText,
  Building,
  RotateCcw
} from 'lucide-react';
import { usePingMEStore } from '../lib/store';
import { INSTITUTIONS, getTokenQueuePosition, estimateWaitTime, getServingTokens, getWaitingTokens } from '../data/mockData';
import { TokenStatusBadge } from '../components/Badges';
import { playQueueChime } from '../lib/sound';

interface TokenPageProps {
  tokenId: string;
  onNavigate: (path: string) => void;
}

export function TokenPage({ tokenId, onNavigate }: TokenPageProps) {
  const { tokens, services, applications, callNextToken, cancelToken } = usePingMEStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const token = tokens.find(t => t.id === tokenId);
  const service = services.find(s => s.id === token?.serviceId);
  const institution = INSTITUTIONS.find(i => i.id === service?.institutionId);
  const application = applications.find(a => a.id === token?.applicationId);

  const position = token ? getTokenQueuePosition(tokens, token) : 0;
  const aheadCount = Math.max(0, position - 1);
  const waitMins = service ? estimateWaitTime(position, service) : 0;
  const servingTokens = service ? getServingTokens(tokens, service.id) : [];

  // When token status transitions to 'serving', chime immediately!
  useEffect(() => {
    if (token?.status === 'serving') {
      playQueueChime();
    }
  }, [token?.status]);

  const handleCallNext = () => {
    if (!service) return;
    const res = callNextToken(service.id);
    if (res.calledToken) {
      setToastMessage(`Counter ${res.freedCounter} called ${res.calledToken.number}`);
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setToastMessage('No more tokens waiting in this queue.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleConfirmCancel = () => {
    if (token) {
      cancelToken(token.id);
      setShowCancelDialog(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Token not found</h1>
        <p className="mt-2 text-xs text-muted-foreground">The token may have expired or was created in another session.</p>
        <button
          onClick={() => onNavigate('/status')}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          Check application status
        </button>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercent = token.status === 'completed'
    ? 100
    : token.status === 'serving'
    ? 90
    : token.status === 'cancelled'
    ? 0
    : Math.max(15, Math.min(85, Math.round((1 - (position / Math.max(position + 3, 5))) * 100)));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-primary/20 bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-elevated animate-in fade-in slide-in-from-top-4">
          <Volume2 className="size-4 text-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Token Pass Card */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card relative overflow-hidden">
            {/* Background ambient gradient */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Digital queue pass
                </p>
                <h1 className="token-number mt-2 text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">
                  {token.number}
                </h1>
              </div>
              <div>
                <TokenStatusBadge status={token.status} className="text-xs px-3 py-1" />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-lg font-bold text-foreground">{service?.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building className="size-3 text-muted-foreground" />
                {institution?.name}
              </p>
            </div>

            {/* Turn Announcement Banner if Serving */}
            {token.status === 'serving' ? (
              <div className="mt-6 rounded-2xl bg-emerald-500 text-white p-5 text-center shadow-elevated animate-pulse">
                <p className="text-xs uppercase tracking-wider font-bold">Now calling</p>
                <p className="text-2xl font-black mt-1">Please proceed to Counter {token.counter}!</p>
                <p className="text-xs opacity-90 mt-1">Have your original documents ready for inspection.</p>
              </div>
            ) : token.status === 'waiting' ? (
              /* Stat boxes */
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-muted/60 p-4 text-center border border-border/50">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{position}th</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Your position</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary">~{waitMins} min</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Est. wait</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{aheadCount}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Ahead of you</p>
                </div>
              </div>
            ) : token.status === 'completed' ? (
              <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-800">Service completed</p>
                <p className="text-xs text-muted-foreground mt-0.5">Thank you for using PingME Queue.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-center border border-rose-200">
                <p className="text-sm font-bold text-rose-800">Token cancelled</p>
                <p className="text-xs text-rose-600 mt-0.5">This queue token is no longer active.</p>
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1.5">
                <span>Joined</span>
                <span>Your turn</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* SECURE 6-DIGIT COUNTER OTP BOX */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white border-2 border-indigo-500/40 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="size-4 text-cyan-400" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                    Counter Verification OTP
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Docs Verified
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono text-cyan-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                    {token.otp || '482 910'}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Share this 6-digit OTP at <strong>Counter 01</strong> to confirm your identity without exposing your phone number.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const otpCode = (token.otp || '482 910').replace(/\s+/g, '');
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(otpCode);
                      setToastMessage('6-digit OTP copied to clipboard!');
                      setTimeout(() => setToastMessage(null), 2500);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 text-xs font-bold text-white border border-white/20 transition-all shrink-0"
                >
                  <Share2 className="size-3.5" />
                  <span>Copy OTP</span>
                </button>
              </div>
            </div>

            {/* SMS Notification Banner */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-xs">
              <span className="text-muted-foreground">
                SMS alerts sent to: <span className="font-mono font-bold text-foreground">{token.phone}</span>
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                Simulated SMS
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Info */}
        <div className="space-y-6">
          {/* Now Serving Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-sm font-bold text-foreground">Now serving</h3>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {servingTokens.length === 0 ? (
                <div className="col-span-2 text-xs text-muted-foreground italic py-2">
                  No tokens currently serving
                </div>
              ) : (
                servingTokens.map(st => (
                  <div key={st.id} className="rounded-xl border border-primary/20 bg-primary-soft p-3 text-center">
                    <p className="text-[10px] font-semibold text-primary uppercase">Counter {st.counter}</p>
                    <p className="font-mono text-base font-bold text-accent-foreground mt-0.5">{st.number}</p>
                  </div>
                ))
              )}
            </div>

            {/* Interactive Demo Control */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">Demo control</span>
                <span className="text-[10px] font-bold text-primary uppercase bg-primary-soft px-1.5 py-0.2 rounded">
                  Simulated
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">
                Move the queue forward, or call tokens from the Admin dashboard in another tab.
              </p>
              <button
                onClick={handleCallNext}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Volume2 className="size-3.5 text-primary" />
                Call next token
              </button>
            </div>
          </div>

          {/* Tracking ID & Application Info */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Tracking ID
              </p>
              <p className="font-mono text-sm font-bold text-foreground mt-0.5">
                {token.id}
              </p>
            </div>

            {token.applicationId && (
              <button
                onClick={() => onNavigate(`/status?id=${token.id}`)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                <FileText className="size-3.5" />
                Application status
              </button>
            )}

            {token.status === 'waiting' && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="w-full rounded-xl px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Cancel my token
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated">
            <h3 className="text-base font-bold text-foreground">Cancel this token?</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Are you sure you want to forfeit your place in the queue? You will need to take a new token if you return.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Keep token
              </button>
              <button
                onClick={handleConfirmCancel}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
