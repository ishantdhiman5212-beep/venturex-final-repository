import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import {
  Camera,
  QrCode,
  X,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Printer,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { INSTITUTIONS, SERVICES } from '../data/mockData';
import { playScanBeep } from '../lib/sound';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (payload: { institutionId: string; serviceId?: string }) => void;
  defaultVenue?: string;
}

export function QRModal({ isOpen, onClose, onScanSuccess, defaultVenue }: QRModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'standee'>('camera');
  const [selectedInstId, setSelectedInstId] = useState<string>(defaultVenue || 'city-general');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const qrRegionId = 'pingme-html5-qrcode-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const selectedInst = INSTITUTIONS.find(i => i.id === selectedInstId) || INSTITUTIONS[0];
  const instServices = SERVICES.filter(s => s.institutionId === selectedInst.id);
  const primaryService = instServices[0];

  // Scannable target URL for the standee
  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pingme-queue.onrender.com';
  const standeeUrl = `${hostUrl}/apply/${primaryService?.id || 'opd-general'}?venue=${selectedInst.id}`;

  // Start Html5Qrcode scanner when tab is camera
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCameraScanner();
      return;
    }

    let isMounted = true;
    const timer = setTimeout(() => {
      startCameraScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const startCameraScanner = async () => {
    try {
      setCameraError(null);
      const el = document.getElementById(qrRegionId);
      if (!el) return;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
      }

      const qrScanner = html5QrCodeRef.current;
      if (qrScanner.isScanning) {
        return;
      }

      await qrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Frame scanner callback on no-code (silent)
        }
      );

      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera scanner initialization error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Camera access was blocked by your browser. You can click "Simulate Instant QR Scan" below to demo immediately.'
          : 'Could not access device camera. Use the demo fallback button below.'
      );
      setCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping QR scanner:', err);
      }
    }
    setCameraActive(false);
  };

  const handleSuccessfulScan = (rawText: string) => {
    playScanBeep();
    setScannedData(rawText);
    stopCameraScanner();

    // Parse payload: could be URL with venue/service, JSON, or code
    let targetInstId = selectedInstId;
    let targetServiceId: string | undefined = undefined;

    try {
      if (rawText.startsWith('http')) {
        const url = new URL(rawText);
        const venueParam = url.searchParams.get('venue') || url.searchParams.get('institution');
        const serviceParam = url.searchParams.get('service');
        if (venueParam) targetInstId = venueParam;
        if (serviceParam) targetServiceId = serviceParam;
      } else if (rawText.startsWith('{')) {
        const parsed = JSON.parse(rawText);
        if (parsed.venue || parsed.institutionId) targetInstId = parsed.venue || parsed.institutionId;
        if (parsed.service || parsed.serviceId) targetServiceId = parsed.service || parsed.serviceId;
      } else {
        const matched = INSTITUTIONS.find(
          i => i.code.toUpperCase() === rawText.trim().toUpperCase() || i.id.toUpperCase() === rawText.trim().toUpperCase()
        );
        if (matched) targetInstId = matched.id;
      }
    } catch {
      // Use fallback matched inst
    }

    setTimeout(() => {
      onScanSuccess({ institutionId: targetInstId, serviceId: targetServiceId });
      onClose();
    }, 700);
  };

  const handleSimulateInstantScan = (instId?: string) => {
    setIsSimulating(true);
    playScanBeep();
    const inst = instId || selectedInstId;
    setScannedData(`PINGME://VENUE/${inst.toUpperCase()}`);

    setTimeout(() => {
      setIsSimulating(false);
      onScanSuccess({ institutionId: inst });
      onClose();
    }, 600);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(standeeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden sm:p-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-primary-soft text-accent-foreground grid place-items-center border border-primary/20">
              <QrCode className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">PingME Venue Entry</h2>
              <p className="text-xs text-muted-foreground">Scan venue QR code or view standee display</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="size-4 text-primary" />
            <span>Scan Venue QR (Live Camera)</span>
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
            <span>Venue Standee (Printable QR)</span>
          </button>
        </div>

        {/* TAB 1: Live Camera Scanner */}
        {activeTab === 'camera' && (
          <div className="mt-6 flex flex-col items-center">
            {/* Viewfinder frame */}
            <div className="relative aspect-square w-full max-w-[280px] rounded-2xl bg-slate-950 overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
              {/* HTML5 QR Container */}
              <div id={qrRegionId} className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

              {/* Viewfinder Overlay Frame */}
              <div className="pointer-events-none absolute inset-0">
                {/* Corner Brackets */}
                <div className="absolute top-3 left-3 size-7 border-t-4 border-l-4 border-primary rounded-tl" />
                <div className="absolute top-3 right-3 size-7 border-t-4 border-r-4 border-primary rounded-tr" />
                <div className="absolute bottom-3 left-3 size-7 border-b-4 border-l-4 border-primary rounded-bl" />
                <div className="absolute bottom-3 right-3 size-7 border-b-4 border-r-4 border-primary rounded-br" />

                {/* Animated scanning laser line */}
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-pulse top-1/2 -translate-y-1/2" />
              </div>

              {/* Success overlay */}
              {scannedData && (
                <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center text-emerald-100 z-20 animate-in fade-in">
                  <CheckCircle2 className="size-12 text-emerald-400 mb-2 animate-bounce" />
                  <p className="text-sm font-bold">QR Detected!</p>
                  <p className="text-xs text-emerald-300 font-mono mt-1 truncate max-w-[200px]">{scannedData}</p>
                  <p className="text-[11px] text-emerald-400 mt-2 font-medium">Unlocking document upload...</p>
                </div>
              )}
            </div>

            {/* Error or blocked notice */}
            {cameraError && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-left text-xs text-amber-700 dark:text-amber-300">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-500" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Helper tips */}
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Hold any PingME venue QR code in front of the camera, or scan the Standee on Tab 2.
            </p>

            {/* Demo Fallback Button */}
            <div className="mt-4 w-full pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => handleSimulateInstantScan(selectedInstId)}
                disabled={isSimulating}
                className="w-full flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-bold text-primary-foreground shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <Zap className="size-4" />
                <span>Simulate Instant QR Scan (Demo Fallback)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Venue Standee QR (Printable / Phone Scan) */}
        {activeTab === 'standee' && (
          <div className="mt-6 flex flex-col items-center">
            {/* Venue Selector */}
            <div className="w-full mb-4">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Select Venue Standee:
              </label>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-bold text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {INSTITUTIONS.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.code} — {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scannable QR Card */}
            <div className="relative rounded-3xl border-2 border-primary/20 bg-white p-5 shadow-elevated text-center flex flex-col items-center">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm mb-3">
                <Building2 className="size-4 text-primary" />
                <span>{selectedInst.name}</span>
              </div>

              {/* Scannable SVG QR Code */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-inner">
                <QRCodeSVG
                  value={standeeUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Official PingME Physical Standee QR</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 font-medium max-w-[220px]">
                Point your phone camera here to test mobile web entry
              </p>
            </div>

            {/* Standee Actions */}
            <div className="mt-5 grid grid-cols-2 gap-2 w-full">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                <Copy className="size-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Scan Link'}</span>
              </button>
              <button
                onClick={() => handleSimulateInstantScan(selectedInst.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Zap className="size-3.5" />
                <span>Test Scan Standee</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export for compatibility
export default QRModal;
