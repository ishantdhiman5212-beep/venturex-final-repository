import React, { useState, useMemo } from 'react';
import { Search, X, Users, Clock, FileText, ArrowRight, Building2, MapPin } from 'lucide-react';
import { usePingMEStore } from '../lib/store';
import { INSTITUTIONS, CATEGORIES, getWaitingTokens, estimateWaitTime } from '../data/mockData';
import { ServiceCategory } from '../types';
import { ServiceOpenBadge } from '../components/Badges';
import { CategoryIcon } from '../components/CategoryIcon';

interface ServicesPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
  initialInstitution?: string;
}

export function ServicesPage({ onNavigate, initialCategory, initialInstitution }: ServicesPageProps) {
  const { services, tokens } = usePingMEStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(initialInstitution || null);

  const activeInstitution = INSTITUTIONS.find(i => i.id === selectedInstitutionId);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      // Institution filter
      if (selectedInstitutionId && service.institutionId !== selectedInstitutionId) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inst = INSTITUTIONS.find(i => i.id === service.institutionId);
        const nameMatch = service.name.toLowerCase().includes(q);
        const descMatch = service.description.toLowerCase().includes(q);
        const instMatch = inst?.name.toLowerCase().includes(q) || false;
        const docMatch = service.documents.some(d => d.label.toLowerCase().includes(q));
        if (!nameMatch && !descMatch && !instMatch && !docMatch) return false;
      }
      return true;
    });
  }, [services, selectedCategory, selectedInstitutionId, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Page Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Service catalog
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Find a public service
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Choose a service to check requirements, draft your application and join the digital queue.
        </p>
      </div>

      {/* Institution Filter Banner (if scanned / selected) */}
      {activeInstitution && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Scanned office
                </span>
                <span className="rounded bg-primary/20 px-1.5 py-0.2 font-mono text-xs font-bold text-accent-foreground">
                  {activeInstitution.code}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground">
                {activeInstitution.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeInstitution.address} · {activeInstitution.hours}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedInstitutionId(null)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-xs hover:bg-muted transition-colors"
          >
            <X className="size-3.5" />
            Clear office filter
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All services ({services.length})
          </button>
          {(Object.keys(CATEGORIES) as ServiceCategory[]).map(catKey => {
            const count = services.filter(s => s.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === catKey
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {CATEGORIES[catKey].label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search services or docs…"
            className="w-full rounded-xl border border-input bg-card pl-9 pr-8 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map(service => {
          const institution = INSTITUTIONS.find(i => i.id === service.institutionId);
          const waitingTokens = getWaitingTokens(tokens, service.id);
          const waitingCount = waitingTokens.length;
          const waitMins = estimateWaitTime(waitingCount + 1, service);
          const requiredDocCount = service.documents.filter(d => d.required).length;

          return (
            <div
              key={service.id}
              onClick={() => onNavigate(`/services/${service.id}`)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elevated flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <CategoryIcon category={service.category} size="sm" />
                  <ServiceOpenBadge isOpen={service.isOpen} />
                </div>

                <h3 className="mt-4 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground/70" />
                  {institution?.name}
                </p>

                <p className="mt-2.5 text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{waitingCount}</span> waiting
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-amber-600" />
                    ~{waitMins} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="size-3.5 text-blue-600" />
                    {requiredDocCount} docs
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    View & join
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground mt-8">
          <Search className="size-8 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-base font-semibold text-foreground">No services found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or clearing the category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedInstitutionId(null);
            }}
            className="mt-4 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground hover:bg-muted"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
