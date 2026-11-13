import React from 'react';
import { ArrowLeft, Clock, Users, FileCheck, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Building } from 'lucide-react';
import { usePingMEStore } from '../lib/store';
import { INSTITUTIONS, CATEGORIES, getWaitingTokens, getServingTokens, estimateWaitTime } from '../data/mockData';
import { CategoryIcon } from '../components/CategoryIcon';
import { ServiceOpenBadge } from '../components/Badges';

interface ServiceDetailPageProps {
  serviceId: string;
  onNavigate: (path: string) => void;
}

export function ServiceDetailPage({ serviceId, onNavigate }: ServiceDetailPageProps) {
  const { services, tokens } = usePingMEStore();

  const service = services.find(s => s.id === serviceId) || services[0];
  const institution = INSTITUTIONS.find(i => i.id === service?.institutionId);
  const categoryInfo = CATEGORIES[service?.category || 'government'];

  const waitingTokens = getWaitingTokens(tokens, service?.id || '');
  const servingTokens = getServingTokens(tokens, service?.id || '');
  const waitingCount = waitingTokens.length;
  const estimatedMins = estimateWaitTime(waitingCount + 1, service);

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-bold">Service not found.</p>
        <button
          onClick={() => onNavigate('/services')}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground font-semibold"
        >
          Return to services
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <button
          onClick={() => onNavigate('/services')}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          All services
        </button>
        <span>/</span>
        <span className="capitalize">{categoryInfo?.label}</span>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-[200px]">{service.name}</span>
      </div>

      {/* Main Header */}
      <div className="mt-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-border/80 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <CategoryIcon category={service.category} size="md" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {categoryInfo?.label}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {service.name}
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
            <Building className="size-4 text-primary" />
            <span className="text-foreground font-semibold">{institution?.name}</span>
            <span>·</span>
            <span>{institution?.hours}</span>
          </p>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {service.description}
          </p>
        </div>

        <div>
          <ServiceOpenBadge isOpen={service.isOpen} className="text-xs px-3 py-1" />
        </div>
      </div>

      {/* Content Columns */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Requirements and Guide */}
        <div className="space-y-8">
          {/* Document Requirements Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2">
              <FileCheck className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Documents to keep ready</h2>
            </div>

            {service.documents.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No formal documents required for registration. Simply proceed with your details.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border/60">
                {service.documents.map(doc => (
                  <li key={doc.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {doc.label}
                        {doc.required ? (
                          <span className="rounded bg-rose-50 px-1.5 py-0.2 text-[10px] font-bold text-rose-600 border border-rose-200">
                            Required
                          </span>
                        ) : (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </p>
                      {doc.hint && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{doc.hint}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 rounded-xl bg-muted/60 p-3.5 text-xs text-muted-foreground flex items-start gap-2 border border-border/40">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Accepted formats: PDF, JPG or PNG up to 5 MB each. An officer verifies documents before your turn.
              </span>
            </div>
          </div>

          {/* What happens next */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-base font-bold text-foreground">What happens next</h2>
            <ol className="mt-4 space-y-3 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold grid place-items-center shrink-0 text-xs">
                  1
                </span>
                <span>
                  Answer a few questions — our system generates an official application draft for you.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold grid place-items-center shrink-0 text-xs">
                  2
                </span>
                <span>
                  Upload your documents; our AI & OCR checks ensure 100% completeness before you queue.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-primary/10 text-primary font-bold grid place-items-center shrink-0 text-xs">
                  3
                </span>
                <span>
                  Get a live digital token with SMS alerts, countdown, and audio pings when your counter is ready.
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Live Queue Box & CTA */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-elevated">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Live queue</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Updating live
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-muted/60 p-4 text-center border border-border/50">
              <div>
                <p className="text-3xl font-extrabold text-foreground">{waitingCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">people waiting</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary">~{estimatedMins}</p>
                <p className="mt-1 text-xs text-muted-foreground">minutes if you join now</p>
              </div>
            </div>

            {/* Now Serving section */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Now serving · {service.counters} counters
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {servingTokens.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Counters are currently clear</p>
                ) : (
                  servingTokens.map(st => (
                    <span
                      key={st.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-soft px-3 py-1 font-mono text-xs font-bold text-accent-foreground"
                    >
                      <span>{st.number}</span>
                      <span className="text-primary/70">· C{st.counter}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6 border-t border-border pt-5">
              {service.isOpen ? (
                <button
                  onClick={() => onNavigate(`/apply/${service.id}`)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer active:scale-98"
                >
                  Start guided application
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <div className="rounded-xl bg-rose-50 p-3 text-center text-xs font-semibold text-rose-700 border border-rose-200">
                  This service is currently closed for today
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
