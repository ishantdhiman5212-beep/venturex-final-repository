import React from 'react';
import { TokenStatus, DocReviewStatus } from '../types';
import { Clock, CheckCircle2, AlertCircle, XCircle, Sparkles, ShieldCheck } from 'lucide-react';

export function TokenStatusBadge({ status, className = '' }: { status: TokenStatus; className?: string }) {
  if (status === 'serving') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success border border-success/30 animate-pulse ${className}`}>
        <span className="size-1.5 rounded-full bg-success animate-ping" />
        Serving now
      </span>
    );
  }

  if (status === 'waiting') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60 ${className}`}>
        <Clock className="size-3" />
        Waiting
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200 ${className}`}>
        <CheckCircle2 className="size-3 text-slate-500" />
        Completed
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200 ${className}`}>
      <XCircle className="size-3" />
      Cancelled
    </span>
  );
}

export function DocStatusBadge({ status, className = '' }: { status: DocReviewStatus; className?: string }) {
  if (status === 'approved') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success border border-success/30 ${className}`}>
        <ShieldCheck className="size-3" />
        Approved
      </span>
    );
  }

  if (status === 'correction_requested') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200 ${className}`}>
        <AlertCircle className="size-3" />
        Correction requested
      </span>
    );
  }

  if (status === 'pending_review') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 ${className}`}>
        <Clock className="size-3" />
        Pending review
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ${className}`}>
      Not required
    </span>
  );
}

export function ServiceOpenBadge({ isOpen, className = '' }: { isOpen: boolean; className?: string }) {
  if (isOpen) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 ${className}`}>
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Open
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200 ${className}`}>
      <span className="size-1.5 rounded-full bg-slate-400" />
      Closed
    </span>
  );
}

export function PriorityBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200 ${className}`}>
      <Sparkles className="size-3 text-purple-600" />
      Priority
    </span>
  );
}
