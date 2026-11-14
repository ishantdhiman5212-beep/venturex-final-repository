import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import {
  Camera,
  QrCode,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Copy,
  Zap,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import { INSTITUTIONS, SERVICES } from '../data/mockData';
import { playScanBeep } from '../lib/sound';

interface ScanPageProps {
  onNavigate: (path: string) => void;
}

export function ScanPage({ onNavigate }: ScanPageProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'standee'>('camera');
  const [selectedInstId, setSelectedInstId] = useState<string>('city-general');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const qrRegionId = 'pingme-scan-page-qr-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const selectedInst = INSTITUTIONS.find(i => i.id === selectedInstId) || INSTITUTIONS[0];
  const instServices = SERVICES.filter(s => s.institutionId === selectedInst.id);
  const primaryService = instServices[0];

  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pingme-queue.onrender.com';
  const standeeUrl = `${hostUrl}/apply/${primaryService?.id || 'opd-general'}?venue=${selectedInst.id}`;

  useEffect(() => {
    if (activeTab !== 'camera') {
      stopScanner();
      return;
    }

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [activeTab]);

  const startScanner = async () => {
    try {
      setCameraError(null);
      const el = document.getElementById(qrRegionId);
      if (!el) return;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      }

      if (html5QrCodeRef.current.isScanning) return;

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {}
      );
    } catch (err: unknown) {
      console.warn('Scanner error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Camera access blocked by browser. Click "Simulate Instant QR Scan" below to demo immediately.'
          : 'Camera device unavailable on this system. Use the demo fallback button below.'
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleSuccess = (rawText: string) => {
    playScanBeep();
    setScannedData(rawText);
    stopScanner();

    let targetInstId = selectedInstId;
    let targetServiceId: string | undefined = undefined;

    try {
      if (rawText.startsWith('http')) {
        const url = new URL(rawText);
        const venueParam = url.searchParams.get('venue') || url.searchParams.get('institution');
        const serviceParam = url.searchParams.get('service');
        if (venueParam) targetInstId = venueParam;
        if (serviceParam) targetServiceId = serviceParam;
      } else {
        const found = INSTITUTIONS.find(i => i.code.toUpperCase() === rawText.trim().toUpperCase() || i.id === rawText.trim());
        if (found) targetInstId = found.id;
      }
    } catch {}

    setTimeout(() => {
      if (targetServiceId) {
        onNavigate(`/apply/${targetServiceId}?venue=${targetInstId}`);
      } else {
        onNavigate(`/services?institution=${targetInstId}`);
      }
    }, 800);
  };

  const handleSimulateScan = (instId?: string) => {
    setIsScanning(true);
    playScanBeep();
    const inst = instId || selectedInstId;
    setScannedData(`PINGME://VENUE/${inst.toUpperCase()}`);

    setTimeout(() => {
      setIsScanning(false);
      onNavigate(`/services?institution=${inst}`);
    }, 700);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim().toUpperCase();
    const found = INSTITUTIONS.find(i => i.code.toUpperCase() === code || i.id.toUpperCase() === code);
    if (found) {
      playScanBeep();
      onNavigate(`/services?institution=${found.id}`);
    } else {
      setCameraError(`Office code "${code}" not found. Try CGH, DCSC, or SEFO.`);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(standeeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground border border-primary/20">
          <QrCode className="size-3.5" />
          Real Camera & Standee QR Flow
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Scan QR to join a queue
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-xl mx-auto">
          Scan the PingME physical QR code at any venue entrance using your live webcam or mobile phone camera.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="mt-8 flex justify-center">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5 text-xs font-bold w-full max-w-md">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="size-4 text-primary" />
            <span>Live Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('standee')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
              activeTab === 'standee'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="size-4 text-emerald-500" />
            <span>Venue Standee (Printable)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Real Camera Scanner Box */}
      {activeTab === 'camera' ? (
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Camera Viewfinder */}
            <div className="relative aspect-square max-w-sm mx-auto w-full rounded-2xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
              <div id={qrRegionId} className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

              {/* Viewfinder brackets */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-4 left-4 size-7 border-t-4 border-l-4 border-primary rounded-tl" />
                <div className="absolute top-4 right-4 size-7 border-t-4 border-r-4 border-primary rounded-tr" />
                <div className="absolute bottom-4 left-4 size-7 border-b-4 border-l-4 border-primary rounded-bl" />
                <div className="absolute bottom-4 right-4 size-7 border-b-4 border-r-4 border-primary rounded-br" />

                <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-pulse top-1/2 -translate-y-1/2" />
              </div>

              {scannedData && (
                <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center text-emerald-100 z-20 animate-in fade-in">
                  <CheckCircle2 className="size-12 text-emerald-400 mb-2 animate-bounce" />
                  <p className="text-sm font-bold">QR Code Verified!</p>
                  <p className="text-xs text-emerald-300 font-mono mt-1">{scannedData}</p>
                </div>
              )}
            </div>

            {/* Controls & Fallbacks */}
            <div className="flex flex-col justify-center">
              <h2 className="text-lg font-bold text-foreground">Point Camera at QR Code</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Hold your device up to the PingME QR standee or poster at any counter entrance to automatically open the document checklist and token generator.
              </p>

              {cameraError && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Demo 1-Click Fallback Button */}
              <div className="mt-6 pt-4 border-t border-border">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Fast Demo / Judging Pitch Fallback:
                </span>
                <button
                  onClick={() => handleSimulateScan(selectedInstId)}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-bold text-primary-foreground shadow-md hover:brightness-105 active:scale-95 transition-all"
                >
                  <Zap className="size-4" />
                  <span>Simulate Instant QR Scan ({selectedInst.code})</span>
                </button>
              </div>

              {/* Manual Code Input */}
              <form onSubmit={handleManualSubmit} className="mt-5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Or enter office code manually:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="e.g. CGH, DCSC, SEFO"
                    className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs font-bold text-foreground uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: Printable Standee */
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card flex flex-col items-center max-w-xl mx-auto text-center">
          <div className="w-full mb-5 text-left">
            <label className="text-xs font-bold text-foreground block mb-1.5">Select Venue Standee:</label>
            <select
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-bold text-foreground"
            >
              {INSTITUTIONS.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} — {inst.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border-2 border-primary/20 bg-white p-6 shadow-elevated text-center flex flex-col items-center w-full max-w-sm">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-3">
              <Building2 className="size-4 text-primary" />
              <span>{selectedInst.name}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-inner">
              <QRCodeSVG value={standeeUrl} size={200} level="H" includeMargin={true} />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Official PingME Physical Standee QR</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 font-medium max-w-[240px]">
              Point your phone camera here to scan and join the live queue immediately.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 w-full">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              <Copy className="size-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Standee Link'}</span>
            </button>
            <button
              onClick={() => handleSimulateScan(selectedInst.id)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Zap className="size-3.5" />
              <span>Test Scan This Standee</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanPage;
