import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, QrCode, Shield, RotateCcw, Clock, ArrowRight, X, Volume2 } from 'lucide-react';
import { SERVICES, INSTITUTIONS } from '../data/mockData';
import { playPreviewChime } from '../lib/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onResetData: () => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate, onResetData }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
          window.dispatchEvent(new CustomEvent('pingme:open-command-palette'));
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter services
  const filteredServices = SERVICES.filter(service => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const inst = INSTITUTIONS[service.institutionId]?.name.toLowerCase() || '';
    return (
      service.name.toLowerCase().includes(q) ||
      service.shortDescription.toLowerCase().includes(q) ||
      inst.includes(q) ||
      service.category.toLowerCase().includes(q)
    );
  });

  const quickActions = [
    {
      id: 'action-scan',
      title: 'Scan QR at Entrance',
      subtitle: 'Open camera scanner & simulate office check-in',
      icon: QrCode,
      action: () => {
        onNavigate('/scan');
        onClose();
      },
    },
    {
      id: 'action-track',
      title: 'Track Application Status',
      subtitle: 'Look up live petition and token timeline',
      icon: Clock,
      action: () => {
        onNavigate('/status');
        onClose();
      },
    },
    {
      id: 'action-admin',
      title: 'Officer Admin Console',
      subtitle: 'Call tokens, counters & document review desk',
      icon: Shield,
      action: () => {
        onNavigate('/admin');
        onClose();
      },
    },
    {
      id: 'action-sound',
      title: 'Play Test Chime & Audio',
      subtitle: 'Synthesize audio chime and test speakers',
      icon: Volume2,
      action: () => {
        playPreviewChime();
      },
    },
    {
      id: 'action-reset',
      title: 'Reset Demo Data',
      subtitle: 'Restore initial demo queues, tokens & stats',
      icon: RotateCcw,
      action: () => {
        onClose();
        onResetData();
      },
    },
  ];

  const totalItems = filteredServices.length + quickActions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredServices.length) {
        const target = filteredServices[selectedIndex];
        onNavigate(`/services/${target.id}`);
        onClose();
      } else {
        const actionIdx = selectedIndex - filteredServices.length;
        if (quickActions[actionIdx]) {
          quickActions[actionIdx].action();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl transition-all duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-border/70 px-4 py-3.5">
          <Search className="size-5 text-primary shrink-0 mr-3 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a service, certificate, hospital OPD, or command..."
            className="w-full bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
              ESC to close
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-border/40">
          {/* Public Services Group */}
          {filteredServices.length > 0 && (
            <div className="py-2">
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Public Services ({filteredServices.length})
              </p>
              <div className="space-y-1">
                {filteredServices.map((service, idx) => {
                  const isSelected = selectedIndex === idx;
                  const inst = INSTITUTIONS[service.institutionId];

                  return (
                    <button
                      key={service.id}
                      onClick={() => {
                        onNavigate(`/services/${service.id}`);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1'
                          : 'hover:bg-muted/70 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`grid size-9 place-items-center rounded-lg border shrink-0 ${
                            isSelected
                              ? 'border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground'
                              : 'border-border bg-muted/60 text-primary'
                          }`}
                        >
                          <Sparkles className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {service.name}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}
                          >
                            {inst?.name} · {service.requiredDocuments.length} docs required
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isSelected
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary-soft text-accent-foreground'
                          }`}
                        >
                          ~{service.baseServiceTimeMin * 2}m wait
                        </span>
                        <ArrowRight
                          className={`size-4 transition-transform ${
                            isSelected ? 'translate-x-1 text-primary-foreground' : 'text-muted-foreground opacity-40'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions Group */}
          <div className="py-2">
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </p>
            <div className="space-y-1">
              {quickActions.map((action, aIdx) => {
                const itemIdx = filteredServices.length + aIdx;
                const isSelected = selectedIndex === itemIdx;
                const IconComponent = action.icon;

                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    onMouseEnter={() => setSelectedIndex(itemIdx)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1'
                        : 'hover:bg-muted/70 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-9 place-items-center rounded-lg border shrink-0 ${
                          isSelected
                            ? 'border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground'
                            : 'border-border bg-muted/60 text-foreground'
                        }`}
                      >
                        <IconComponent className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{action.title}</p>
                        <p
                          className={`text-xs ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {action.subtitle}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      className={`size-4 transition-transform ${
                        isSelected ? 'translate-x-1 text-primary-foreground' : 'text-muted-foreground opacity-40'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] border border-border">↑</kbd> <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] border border-border">↓</kbd> to navigate</span>
            <span><kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] border border-border">Enter</kbd> to select</span>
          </div>
          <span className="font-medium text-foreground">PingME Super App Search</span>
        </div>
      </div>
    </div>
  );
}
