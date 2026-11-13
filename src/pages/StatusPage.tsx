import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  Building,
  Printer
} from 'lucide-react';
import { usePingMEStore, getMyTokenIds } from '../lib/store';
import { INSTITUTIONS, SERVICES } from '../data/mockData';
import { TokenStatusBadge, DocStatusBadge } from '../components/Badges';

interface StatusPageProps {
  initialId?: string;
  onNavigate: (path: string) => void;
}

export function StatusPage({ initialId, onNavigate }: StatusPageProps) {
  const { applications, tokens, services } = usePingMEStore();
  const [searchInput, setSearchInput] = useState(initialId || '');
  const [activeQuery, setActiveQuery] = useState(initialId || '');
  const [showDocModal, setShowDocModal] = useState(false);

  const myTokenIds = getMyTokenIds();

  // Find matching application or token
  const matchedData = React.useMemo(() => {
    if (!activeQuery.trim()) {
      // Default to the first available application or local device token
      if (myTokenIds.length > 0) {
        const localToken = tokens.find(t => t.id === myTokenIds[0]);
        if (localToken?.applicationId) {
          const app = applications.find(a => a.id === localToken.applicationId);
          return { app, token: localToken };
        }
        if (localToken) return { token: localToken };
      }
      return { app: applications[0], token: tokens.find(t => t.id === applications[0]?.tokenId) };
    }

    const q = activeQuery.trim().toUpperCase();

    // 1. Try application ID
    let app = applications.find(a => a.id.toUpperCase() === q || a.id.toUpperCase().includes(q));
    // 2. Try token ID (PMQ-...)
    let token = tokens.find(t => t.id.toUpperCase() === q || t.id.toUpperCase().includes(q));
    // 3. Try token number (e.g. IC-021)
    if (!token) {
      token = tokens.find(t => t.number.toUpperCase() === q);
    }
    // Cross match
    if (token && !app && token.applicationId) {
      app = applications.find(a => a.id === token.applicationId);
    }
    if (app && !token) {
      token = tokens.find(t => t.id === app.tokenId);
    }

    return { app, token };
  }, [activeQuery, applications, tokens, myTokenIds]);

  const app = matchedData.app;
  const token = matchedData.token;
  const service = services.find(s => s.id === (app?.serviceId || token?.serviceId));
  const institution = INSTITUTIONS.find(i => i.id === service?.institutionId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Track your application
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Application status
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your tracking ID, token number or application ID — or pick one issued on this device.
        </p>
      </div>

      {/* Lookup Search Form */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="e.g. PMQ-V4YE2N, IC-021, APP-DBP5PW"
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Look up
          </button>
        </form>

        {/* Demo Quick ID Buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Try a demo ID:</span>
          {applications.slice(0, 3).map(demoApp => (
            <button
              key={demoApp.id}
              onClick={() => {
                setSearchInput(demoApp.id);
                setActiveQuery(demoApp.id);
              }}
              className="rounded-lg bg-muted px-2 py-1 font-mono text-[11px] font-semibold text-primary hover:bg-primary-soft transition-colors"
            >
              {demoApp.id}
            </button>
          ))}
        </div>

        {/* Local tokens on this device */}
        {myTokenIds.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              On this device
            </p>
            <div className="flex flex-wrap gap-2">
              {myTokenIds.map(tid => {
                const myTok = tokens.find(t => t.id === tid);
                const mySvc = services.find(s => s.id === myTok?.serviceId);
                if (!myTok) return null;
                return (
                  <button
                    key={tid}
                    onClick={() => {
                      setSearchInput(tid);
                      setActiveQuery(tid);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeQuery === tid
                        ? 'border-primary bg-primary-soft text-accent-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="font-mono font-bold text-primary">{myTok.number}</span>
                    <span>·</span>
                    <span className="truncate max-w-[120px]">{mySvc?.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Application Status Details */}
      {(app || token) ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {institution?.name}
                </p>
                <h2 className="text-2xl font-extrabold text-foreground mt-1">
                  {service?.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Applicant: <span className="font-semibold text-foreground">{app?.citizenName || token?.citizenName}</span> · Application ID: <span className="font-mono font-bold text-foreground">{app?.id || token?.id}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {token && <TokenStatusBadge status={token.status} />}
                {app && <DocStatusBadge status={app.docStatus} />}
              </div>
            </div>

            {/* Live Token Link if Token exists */}
            {token && (
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary-soft p-4">
                <div className="flex items-center gap-3">
                  <span className="token-number font-mono text-2xl font-bold text-primary">
                    {token.number}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-accent-foreground">Active queue token</p>
                    <p className="text-[11px] text-muted-foreground">Status: {token.status}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate(`/token/${token.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Live token tracking
                  <ExternalLink className="size-3.5" />
                </button>
              </div>
            )}

            {/* Officer review note if correction requested */}
            {app?.docStatus === 'correction_requested' && app.reviewNote && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs">
                <p className="font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="size-4" />
                  Officer Review Note:
                </p>
                <p className="mt-1 text-rose-700 font-medium">{app.reviewNote}</p>
              </div>
            )}

            {/* Timeline */}
            {app && app.timeline && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-foreground mb-4">Application timeline</h3>
                <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                  {app.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">{event.label}</p>
                      {event.detail && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{event.detail}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {new Date(event.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Documents List */}
            {app && app.uploads && app.uploads.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">Verified documents</h3>
                  <span className="text-xs font-bold text-emerald-600">
                    {app.completeness}% complete
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {app.uploads.map((u, i) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[180px]">{u.fileName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Requirement: {u.requirementId}</p>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {u.ocrScore || 98}% Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Document Button */}
            {app?.generatedDocument && (
              <div className="mt-6 border-t border-border pt-4 flex justify-end">
                <button
                  onClick={() => setShowDocModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                >
                  <Eye className="size-3.5 text-primary" />
                  View generated document (Simulated AI)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <FileText className="size-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm font-bold text-foreground">No application found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please check the tracking ID or select a service to create one.
          </p>
        </div>
      )}

      {/* Document View Modal */}
      {showDocModal && app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-elevated max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Generated petition letter</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                  title="Print"
                >
                  <Printer className="size-4" />
                </button>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto my-4 bg-muted/30 p-4 rounded-xl border border-border/60">
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                {app.generatedDocument}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDocModal(false)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
