import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, ArrowRight, CheckCircle2, AlertCircle, Building2, Eye, Printer } from 'lucide-react';
import { INSTITUTIONS } from '../data/mockData';
import { Institution } from '../types';

interface ScanPageProps {
  onNavigate: (path: string) => void;
}

export function ScanPage({ onNavigate }: ScanPageProps) {
  const [selectedInstId, setSelectedInstId] = useState<string>('city-general');
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Optional real webcam feed
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useWebcam && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.warn('Webcam error:', err);
          setUseWebcam(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useWebcam]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsScanning(false);
      onNavigate(`/services?institution=${selectedInstId}`);
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim().toUpperCase();
    const found = INSTITUTIONS.find(i => i.code.toUpperCase() === code || i.id.toUpperCase() === code);
    if (found) {
      onNavigate(`/services?institution=${found.id}`);
    } else {
      setErrorMsg(`Office code "${code}" not found. Try CGH, DCSC, or SEFO.`);
    }
  };

  const selectedInst = INSTITUTIONS.find(i => i.id === selectedInstId) || INSTITUTIONS[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground border border-primary/20">
          <QrCode className="size-3.5" />
          App-free QR entry
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Scan QR to join a queue
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-xl mx-auto">
          Scan the PingME QR code at an office entrance, or choose an office below to preview its queue and services.
        </p>
      </div>

      {/* Main Scanner Box */}
      <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          {/* Viewfinder simulation */}
          <div className="relative aspect-square max-w-sm mx-auto w-full rounded-2xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
            {useWebcam ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300">
                <QrCode className="size-32 text-primary opacity-80" strokeWidth={1.5} />
                <p className="mt-4 text-xs font-medium text-slate-400">
                  Align the QR code within the frame
                </p>
              </div>
            )}

            {/* Corner markers */}
            <div className="absolute top-4 left-4 size-7 border-t-4 border-l-4 border-primary rounded-tl" />
            <div className="absolute top-4 right-4 size-7 border-t-4 border-r-4 border-primary rounded-tr" />
            <div className="absolute bottom-4 left-4 size-7 border-b-4 border-l-4 border-primary rounded-bl" />
            <div className="absolute bottom-4 right-4 size-7 border-b-4 border-r-4 border-primary rounded-br" />

            {/* Scanning line animation */}
            <div className="absolute inset-x-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scan-line pointer-events-none" />

            {/* Status pill in viewfinder */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center">
              <span className="rounded-full bg-slate-900/90 backdrop-blur-xs px-3.5 py-1 text-[11px] font-semibold text-slate-200 border border-slate-700">
                {isScanning ? 'Decoding QR code…' : `Target: ${selectedInst.code}`}
              </span>
            </div>
          </div>

          {/* Scanner controls */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Simulate office location
              </label>
              <select
                value={selectedInstId}
                onChange={e => setSelectedInstId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {INSTITUTIONS.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {selectedInst.address} · {selectedInst.hours}
              </p>
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-base font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer active:scale-98"
            >
              <QrCode className="size-5" />
              {isScanning ? 'Scanning…' : 'Simulate QR scan'}
            </button>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
              <span>Camera access:</span>
              <button
                onClick={() => setUseWebcam(!useWebcam)}
                className="text-primary hover:underline font-semibold"
              >
                {useWebcam ? 'Switch to Simulated Viewfinder' : 'Enable Device Camera'}
              </button>
            </div>

            {/* Manual Code Input Form */}
            <form onSubmit={handleManualSubmit} className="space-y-2 border-t border-border pt-4">
              <label htmlFor="manualCode" className="text-xs font-semibold text-foreground block">
                No camera? Enter the office code
              </label>
              <div className="flex gap-2">
                <input
                  id="manualCode"
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="e.g. CGH"
                  className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm uppercase placeholder:normal-case focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-input bg-secondary px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Continue
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  {errorMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Entrance QR Posters Section */}
      <div className="mt-14">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Entrance QR posters</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Tap a poster to open the office directly — handy for presenting the demo.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {INSTITUTIONS.map(inst => (
            <div
              key={inst.id}
              onClick={() => onNavigate(`/services?institution=${inst.id}`)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-elevated flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {inst.category === 'hospital' ? 'Healthcare' : inst.category === 'government' ? 'Citizen services' : 'Education'}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
                    Code {inst.code}
                  </span>
                </div>

                <div className="my-4 flex justify-center">
                  {/* Clean SVG QR Code Graphic */}
                  <div className="size-24 rounded-xl bg-slate-900 p-2.5 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                    <QrCode className="size-full text-white" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors text-center">
                  {inst.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground text-center">
                  {inst.address}
                </p>
              </div>

              <div className="mt-4 border-t border-border pt-3 text-center">
                <p className="text-[11px] font-medium text-muted-foreground">{inst.hours}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Open office services
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Already have a token?{' '}
          <button
            onClick={() => onNavigate('/status')}
            className="font-semibold text-primary hover:underline"
          >
            Track it here
          </button>
        </div>
      </div>
    </div>
  );
}
