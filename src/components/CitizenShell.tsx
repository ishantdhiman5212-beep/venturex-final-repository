import React, { useState, useEffect } from 'react';
import { Brand } from './Brand';
import {
  Shield,
  Menu,
  X,
  RotateCcw,
  Search,
  Volume2,
  VolumeX,
  Ticket,
  Sparkles,
  QrCode,
  LayoutGrid,
  FileCheck2,
} from 'lucide-react';
import { usePingMEStore, getMyTokenIds } from '../lib/store';
import { isSoundEnabled, setSoundEnabled, playPreviewChime } from '../lib/sound';
import { CommandPalette } from './CommandPalette';

interface CitizenShellProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate: (path: string) => void;
}

export function CitizenShell({ children, activePath = '/', onNavigate }: CitizenShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [syncLatency, setSyncLatency] = useState(14);
  const [syncPulse, setSyncPulse] = useState(false);

  const { tokens, services, resetDatabase } = usePingMEStore();

  // Initialize sound state
  useEffect(() => {
    setSoundActive(isSoundEnabled());
    const handleSoundToggle = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      if (custom.detail) setSoundActive(custom.detail.enabled);
    };
    window.addEventListener('pingme:sound-toggle', handleSoundToggle);
    return () => window.removeEventListener('pingme:sound-toggle', handleSoundToggle);
  }, []);

  // Listen for global command palette trigger
  useEffect(() => {
    const handleOpenPalette = () => setCommandPaletteOpen(true);
    window.addEventListener('pingme:open-command-palette', handleOpenPalette);
    return () => window.removeEventListener('pingme:open-command-palette', handleOpenPalette);
  }, []);

  // Simulate realistic network sync latency fluctuations (11ms - 18ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncLatency(Math.floor(11 + Math.random() * 8));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Find user's latest active token
  const myTokenIds = getMyTokenIds();
  const myActiveTokens = tokens.filter(
    t => myTokenIds.includes(t.id) && (t.status === 'waiting' || t.status === 'serving')
  );
  const primaryToken = myActiveTokens.length > 0 ? myActiveTokens[0] : null;

  // Compute position / estimated wait for primary token
  let tokenPosition = 1;
  let tokenWaitMin = 5;
  if (primaryToken) {
    const serviceTokens = tokens
      .filter(t => t.serviceId === primaryToken.serviceId && t.status === 'waiting')
      .sort((a, b) => a.issuedAt - b.issuedAt);
    const tokenIndex = serviceTokens.findIndex(t => t.id === primaryToken.id);
    tokenPosition = tokenIndex !== -1 ? tokenIndex + 1 : 1;
    const targetService = services.find(s => s.id === primaryToken.serviceId);
    const baseTime = targetService?.baseServiceTimeMin || 6;
    tokenWaitMin = Math.max(3, tokenPosition * baseTime);
  }

  const navItems = [
    { path: '/', label: 'Home', icon: LayoutGrid },
    { path: '/scan', label: 'Scan QR', icon: QrCode },
    { path: '/services', label: 'Services', icon: Sparkles },
    { path: '/status', label: 'Track status', icon: FileCheck2 },
  ];

  const handleNav = (p: string) => {
    setMobileMenuOpen(false);
    onNavigate(p);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo tokens, queues, and applications to initial state?')) {
      resetDatabase();
      alert('Demo data has been reset to original factory state.');
    }
  };

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) {
      playPreviewChime();
    }
  };

  const triggerManualSync = () => {
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Banner / Frosted Glass Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl shadow-xs transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-3">
          {/* Brand Logo & Live Sync Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('/')}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-transform hover:opacity-95"
            >
              <Brand />
            </button>

            {/* Live Sync Badge */}
            <div
              onClick={triggerManualSync}
              className={`hidden md:flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-all ${
                syncPulse ? 'ring-2 ring-emerald-500 scale-105' : ''
              }`}
              title="Click to ping live event synchronizer"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold text-foreground/80">Live Synced</span>
              <span className="text-[10px] text-muted-foreground font-mono">({syncLatency}ms)</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60" aria-label="Citizen portal">
            {navItems.map(item => {
              const isActive = item.path === '/' ? activePath === '/' : activePath.startsWith(item.path);
              const IconComp = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-card text-primary shadow-xs border border-border/80 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  }`}
                >
                  <IconComp className={`size-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            {/* Active Token Floating Pill (If user holds an active token) */}
            {primaryToken && (
              <button
                onClick={() => handleNav(`/token/${primaryToken.id}`)}
                className={`group flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shadow-xs animate-in fade-in-0 ${
                  primaryToken.status === 'serving'
                    ? 'border-2 border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30 animate-pulse'
                    : 'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                title="View your active digital queue pass"
              >
                <Ticket className="size-3.5 shrink-0 text-primary" />
                <span className="font-mono">{primaryToken.number}</span>
                <span className="hidden sm:inline text-[11px] font-medium opacity-80">
                  {primaryToken.status === 'serving'
                    ? `· Serving at C${primaryToken.counter || 1}!`
                    : `· #${tokenPosition} (~${tokenWaitMin}m)`}
                </span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              </button>
            )}

            {/* Quick Search Button (Command Palette) */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-2.5 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs hover:border-primary/50 hover:text-foreground transition-all"
              title="Search public services (Ctrl+K)"
            >
              <Search className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline font-semibold">Search</span>
              <kbd className="hidden sm:inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                ⌘K
              </kbd>
            </button>

            {/* Sound & Audio Announcement Toggle */}
            <button
              onClick={toggleSound}
              className={`grid size-8 place-items-center rounded-xl border transition-all ${
                soundActive
                  ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
              title={soundActive ? 'Sound Alerts: Enabled (Click to mute)' : 'Sound Alerts: Muted (Click to enable)'}
            >
              {soundActive ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4 opacity-60" />}
            </button>

            {/* Officer Admin Portal CTA */}
            <button
              onClick={() => handleNav('/admin')}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-xs transition-all ${
                activePath.startsWith('/admin')
                  ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent'
              }`}
            >
              <Shield className="size-3.5 text-indigo-500" />
              <span className="font-bold">Officer Admin</span>
            </button>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-8 place-items-center rounded-xl border border-border md:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card/95 backdrop-blur-xl px-4 py-3 md:hidden space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Active Token Card in Mobile Menu */}
            {primaryToken && (
              <div
                onClick={() => handleNav(`/token/${primaryToken.id}`)}
                className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="size-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground font-mono">
                      Active Token: {primaryToken.number}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {primaryToken.status === 'serving'
                        ? `Proceed to Counter ${primaryToken.counter || 1}`
                        : `Position #${tokenPosition} · ~${tokenWaitMin} min wait`}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">
                  View Pass
                </span>
              </div>
            )}

            {/* Navigation links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navItems.map(item => {
                const isActive = item.path === '/' ? activePath === '/' : activePath.startsWith(item.path);
                const IconComp = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <IconComp className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Row in Mobile Menu */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Search className="size-3.5" />
                <span>Search services</span>
              </button>

              <button
                onClick={toggleSound}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {soundActive ? <Volume2 className="size-3.5 text-primary" /> : <VolumeX className="size-3.5" />}
                <span>Sound: {soundActive ? 'On' : 'Muted'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="main" className="flex-1">
        {children}
      </main>

      {/* Interactive Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNav}
        onResetData={resetDatabase}
      />

      {/* Modern High-End Public Service Footer */}
      <footer className="border-t border-border/80 bg-card/60 py-8 text-xs text-muted-foreground transition-colors">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 inline-block" />
              PingME Queue
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span>Super App Expansion · Digital Public Services</span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
              Hackathon Demo v2.0
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors hover:underline"
              title="Reset all demo queues and data to fresh state"
            >
              <RotateCcw className="size-3" />
              Reset Demo Data
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => handleNav('/admin')}
              className="hover:text-primary transition-colors hover:underline"
            >
              Officer Portal
            </button>
            <span className="text-border">|</span>
            <span>© 2026 PingME Queue · All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
