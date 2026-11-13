import React from 'react';
import { QrCode, Sparkles } from 'lucide-react';

interface BrandProps {
  className?: string;
  inverted?: boolean;
  showBadge?: boolean;
}

export function Brand({ className = '', inverted = false, showBadge = true }: BrandProps) {
  return (
    <div className={`flex items-center gap-3 font-display select-none ${className}`}>
      {/* High-tech Icon Emblem with ambient glow ring */}
      <div className="relative group">
        <div
          className={`relative grid size-10 place-items-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 ${
            inverted
              ? 'bg-navy-foreground text-primary shadow-md'
              : 'bg-gradient-to-br from-primary via-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/25'
          }`}
        >
          <QrCode className="size-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.4} />
          
          {/* Pulsing Live Connectivity Radar Dot */}
          <span className="absolute -right-1 -top-1 flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          </span>
        </div>
      </div>

      {/* Typography Hierarchy */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold tracking-tight text-lg text-foreground">
            Ping<span className="text-primary">ME</span>
          </span>
          <span className="rounded-md bg-gradient-to-r from-primary/15 to-indigo-500/15 border border-primary/25 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-primary">
            Queue
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-tight text-muted-foreground mt-0.5">
          One Gateway to Essential Services
        </span>
      </div>
    </div>
  );
}
