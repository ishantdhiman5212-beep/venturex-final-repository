import React, { useState } from 'react';
import {
  Smartphone,
  Shield,
  Sparkles,
  Zap,
  RefreshCw,
  QrCode,
  FileCheck,
  Key,
  ExternalLink,
  Info,
} from 'lucide-react';
import { CitizenView } from '../components/citizen/CitizenView';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { usePingMEStore } from '../lib/store';

interface SplitDemoPageProps {
  onNavigate: (path: string) => void;
}

export function SplitDemoPage({ onNavigate }: SplitDemoPageProps) {
  const { resetDatabase } = usePingMEStore();
  const [resetToast, setResetToast] = useState(false);

  const handleReset = () => {
    resetDatabase();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2500);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      {/* Pitch Header & Controls Bar */}
      <div className="mb-8 rounded-3xl bg-navy p-6 sm:p-8 text-navy-foreground shadow-elevated">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                Live Broadcast Channel Sync Active
              </span>
              <span className="text-xs text-slate-400">• VentureX Judge Split Demo</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
              PingME Queue: Real-Time Flow Simulation
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Witness the complete lifecycle on one screen: Citizen scans QR & uploads verified docs on the left, then presents their cryptographic 6-digit OTP to the Officer Counter on the right.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 px-4 py-2.5 text-xs font-bold text-white border border-white/20 transition-all"
            >
              <RefreshCw className="size-4 text-cyan-300" />
              <span>{resetToast ? 'Database Reset!' : 'Reset Demo State'}</span>
            </button>

            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
            >
              <span>Full Admin Desk</span>
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        </div>

        {/* 3-Step Flow Ribbon */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="size-7 rounded-xl bg-cyan-500/20 text-cyan-300 grid place-items-center font-bold">1</div>
            <div>
              <span className="font-bold text-white block">Real Camera QR Scan</span>
              <span className="text-slate-400 text-[11px]">Rear camera or printable standee</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="size-7 rounded-xl bg-indigo-500/20 text-indigo-300 grid place-items-center font-bold">2</div>
            <div>
              <span className="font-bold text-white block">Doc Upload & Gemini AI</span>
              <span className="text-slate-400 text-[11px]">Real files or DigiLocker pull</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="size-7 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center font-bold">3</div>
            <div>
              <span className="font-bold text-white block">6-Digit Counter Handshake</span>
              <span className="text-slate-400 text-[11px]">Zero-phone-exposure OTP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split Columns */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* LEFT COLUMN: CITIZEN VIEW */}
        <div className="rounded-3xl border-2 border-primary/20 bg-muted/20 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Smartphone className="size-5 text-primary" />
              <h2 className="text-base font-extrabold text-foreground">Citizen Experience (Mobile / Web)</h2>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">Client Side</span>
          </div>

          <CitizenView initialServiceId="income-cert" onNavigate={onNavigate} />
        </div>

        {/* RIGHT COLUMN: ADMIN COUNTER STATION */}
        <div className="rounded-3xl border-2 border-indigo-500/20 bg-muted/20 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-indigo-500" />
              <h2 className="text-base font-extrabold text-foreground">Officer Counter Desk (Staff View)</h2>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">Admin Desk</span>
          </div>

          <AdminDashboard onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

export default SplitDemoPage;
