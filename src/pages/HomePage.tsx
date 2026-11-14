import React, { useState } from 'react';
import {
  QrCode,
  ArrowRight,
  Bell,
  Ticket,
  Shield,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Search,
  Volume2,
  Clock,
  Building2,
  Zap,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { CATEGORIES } from '../data/mockData';
import { ServiceCategory } from '../types';
import { usePingMEStore, getMyTokenIds } from '../lib/store';
import { playQueueChime } from '../lib/sound';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { tokens, services, callNextToken } = usePingMEStore();
  const [simulatedServing, setSimulatedServing] = useState('GM-043');
  const [simulatedPosition, setSimulatedPosition] = useState(3);
  const [simulatedWait, setSimulatedWait] = useState(8);

  // Check if user has an issued active token
  const myTokenIds = getMyTokenIds();
  const myActiveTokens = tokens.filter(
    t => myTokenIds.includes(t.id) && (t.status === 'waiting' || t.status === 'serving')
  );
  const liveToken = myActiveTokens.length > 0 ? myActiveTokens[0] : null;

  let liveService = null;
  let livePosition = 1;
  let liveWaitMin = 6;
  let nowServingToken = null;

  if (liveToken) {
    liveService = services.find(s => s.id === liveToken.serviceId);
    const serviceWaiting = tokens
      .filter(t => t.serviceId === liveToken.serviceId && t.status === 'waiting')
      .sort((a, b) => a.issuedAt - b.issuedAt);
    const idx = serviceWaiting.findIndex(t => t.id === liveToken.id);
    livePosition = idx !== -1 ? idx + 1 : 1;
    const baseWait = liveService?.baseServiceTimeMin || 6;
    liveWaitMin = Math.max(3, livePosition * baseWait);
    nowServingToken = tokens.find(t => t.serviceId === liveToken.serviceId && t.status === 'serving');
  }

  // Handle interactive preview simulation
  const handleSimulateCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQueueChime();
    if (simulatedPosition > 1) {
      setSimulatedPosition(prev => prev - 1);
      setSimulatedWait(prev => Math.max(2, prev - 3));
      setSimulatedServing(`GM-04${5 - simulatedPosition + 4}`);
    } else {
      setSimulatedPosition(3);
      setSimulatedWait(8);
      setSimulatedServing('GM-043');
    }
  };

  const steps = [
    {
      num: '01',
      icon: QrCode,
      title: 'Scan the QR',
      text: 'Scan the code at the entrance or pick a service online.',
    },
    {
      num: '02',
      icon: Sparkles,
      title: 'Guided form',
      text: 'Answer simple questions — a formal document draft is prepared for you.',
    },
    {
      num: '03',
      icon: FileCheck,
      title: 'Upload & auto-check',
      text: 'We check every required document before you join the queue.',
    },
    {
      num: '04',
      icon: Bell,
      title: 'Get pinged',
      text: "Track your token live and get alerted when it's your turn.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Ambient Glow Mesh */}
      <section className="relative overflow-hidden bg-hero text-navy-foreground hero-mesh-overlay">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" aria-hidden="true" />
        
        {/* Decorative ambient radial glows */}
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 size-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-xs">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Super App Expansion · Digital Public Services</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-white">
              Skip the line.
              <br />
              <span className="text-navy-muted">Not the service.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-navy-foreground/85 leading-relaxed">
              PingME Queue brings QR tokens, AI-guided document preparation, real-time OCR checks and live multi-counter tracking to hospitals, civic administration and state education — in one place.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => onNavigate('/split')}
                className="btn-press inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 text-base font-extrabold text-white shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
              >
                <Zap className="size-5 text-white animate-pulse" />
                Live Split Demo
              </button>

              <button
                onClick={() => onNavigate('/scan')}
                className="btn-press inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3.5 text-base font-bold text-card-foreground shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
              >
                <QrCode className="size-5 text-primary" />
                Scan Camera QR
              </button>

              <button
                onClick={() => onNavigate('/services')}
                className="btn-press inline-flex items-center gap-2 rounded-xl border border-navy-foreground/30 bg-navy-foreground/10 px-5 py-3.5 text-base font-bold text-navy-foreground backdrop-blur-md transition-all hover:bg-navy-foreground/20 hover:border-navy-foreground/50"
              >
                Explore services
                <ArrowRight className="size-4" />
              </button>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('pingme:open-command-palette'))}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-navy-foreground/70 hover:text-white transition-colors ml-1"
                title="Open quick search"
              >
                <Search className="size-3.5" />
                <span>Quick search <kbd className="rounded bg-navy-foreground/15 px-1 py-0.5 font-mono text-[10px]">⌘K</kbd></span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 text-sm border-t border-navy-foreground/15 pt-6">
              <div>
                <dt className="text-navy-foreground/70 text-xs font-medium">Public Sectors</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-white">3</dd>
              </div>
              <div>
                <dt className="text-navy-foreground/70 text-xs font-medium">Available Services</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-white">11</dd>
              </div>
              <div>
                <dt className="text-navy-foreground/70 text-xs font-medium">Wait Time Saved*</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-emerald-300">~70%</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-navy-foreground/60">
              *Real-time AI readiness gate prevents queuing with incomplete documents.
            </p>
          </div>

          {/* Interactive Live or Preview Token Card */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-r from-primary/30 via-indigo-500/20 to-emerald-500/20 blur-3xl pointer-events-none" />

            {liveToken ? (
              /* Actual Live User Token Card */
              <div
                onClick={() => onNavigate(`/token/${liveToken.id}`)}
                className="relative rounded-3xl bg-card p-6 text-card-foreground shadow-2xl border border-primary/40 cursor-pointer card-interactive ring-2 ring-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Your Active Token
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {liveToken.status === 'serving' ? 'Now Serving' : 'In Queue'}
                  </span>
                </div>

                <p className="token-number mt-4 text-5xl font-extrabold text-primary tracking-tight">
                  {liveToken.number}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-foreground truncate">
                  {liveService?.name || 'Income Certificate'}
                </p>
                <p className="text-xs text-muted-foreground">
                  District Citizen Service Centre
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-muted/80 p-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="font-display text-xl font-bold text-foreground">
                      {liveToken.status === 'serving' ? 'At Desk' : `#${livePosition}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. wait</p>
                    <p className="font-display text-xl font-bold text-foreground">
                      {liveToken.status === 'serving' ? 'Now' : `~${liveWaitMin}m`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Serving</p>
                    <p className="token-number text-xl font-bold text-primary">
                      {nowServingToken?.number || 'C1'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`/token/${liveToken.id}`)}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
                >
                  <Ticket className="size-4" />
                  <span>Open Live Digital Pass</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : (
              /* Interactive Sample Preview Token Card */
              <div className="relative rounded-3xl bg-card p-6 text-card-foreground shadow-2xl border border-border/80 card-interactive">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your token
                  </span>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-accent-foreground border border-primary/20">
                    Interactive Preview
                  </span>
                </div>

                <p className="token-number mt-4 text-5xl font-extrabold text-primary tracking-tight">
                  GM-046
                </p>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  General Medicine OPD · City General Hospital
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-muted/80 p-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="font-display text-xl font-bold text-foreground">
                      {simulatedPosition === 1 ? 'Next' : `${simulatedPosition}rd`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. wait</p>
                    <p className="font-display text-xl font-bold text-foreground">
                      ~{simulatedWait}m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Serving</p>
                    <p className="token-number text-xl font-bold text-primary">
                      {simulatedServing}
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(4 - simulatedPosition) * 33}%` }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live Chime & SMS alert ready</span>
                  </div>

                  <button
                    onClick={handleSimulateCall}
                    className="rounded-lg border border-border bg-muted/80 px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted active:scale-95 transition-all"
                    title="Advance preview queue"
                  >
                    Simulate Call
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Public Service Discovery Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 w-full" aria-labelledby="sectors">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Service discovery
            </p>
            <h2 id="sectors" className="mt-2 text-2xl font-extrabold sm:text-3xl text-foreground">
              One portal, three essential public sectors
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/services')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <span>View all 11 services</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {(Object.keys(CATEGORIES) as ServiceCategory[]).map(catKey => {
            const cat = CATEGORIES[catKey];
            return (
              <div
                key={catKey}
                onClick={() => onNavigate(`/services?category=${catKey}`)}
                className="group cursor-pointer rounded-2xl border border-border/80 bg-card p-6 shadow-sm card-interactive"
              >
                <div className="flex items-center justify-between">
                  <CategoryIcon category={catKey} size="lg" />
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
                    {catKey === 'healthcare' ? '4 OPDs' : catKey === 'certificates' ? '4 Certificates' : '3 Education'}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.label}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Browse sector
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-y border-border/70 bg-card/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary text-center sm:text-left">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl text-foreground text-center sm:text-left">
            From the entrance gate to the counter in 4 steps
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(s => {
              const IconComp = s.icon;
              return (
                <div
                  key={s.num}
                  className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs card-interactive"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-extrabold text-primary/40">
                      {s.num}
                    </span>
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <IconComp className="size-5" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {s.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Citizen Portal & Admin Gateway Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 w-full">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Citizen Portal Card */}
          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm card-interactive">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Ticket className="size-6" />
            </div>
            <h3 className="mt-6 text-xl font-extrabold text-foreground">Citizen Portal</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Join a digital queue, prepare petitions with AI guidance, receive real-time SMS alerts and track your application status live.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('/services')}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
              >
                <span>Get a digital token</span>
                <ArrowRight className="size-3.5" />
              </button>
              <button
                onClick={() => onNavigate('/status')}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
              >
                <Clock className="size-3.5" />
                <span>Track my status</span>
              </button>
            </div>
          </div>

          {/* Officer Admin Portal Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-card via-card to-indigo-500/10 p-8 shadow-sm card-interactive">
            <div className="grid size-12 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Shield className="size-6" />
            </div>
            <h3 className="mt-6 text-xl font-extrabold text-foreground">Officer Admin Dashboard</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Call tokens across Counters 1–4, review documents on the verification desk, approve or request corrections, and monitor visitor flow.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/admin')}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
              >
                <Shield className="size-3.5" />
                <span>Officer Service Desk</span>
                <ArrowRight className="size-3.5" />
              </button>
              <span className="text-xs text-muted-foreground font-medium">
                Tip: open in a 2nd tab to see multi-tab live sync!
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
