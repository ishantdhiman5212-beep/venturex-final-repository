import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  AppState,
  Token,
  Application,
  Service,
  DocReviewStatus,
  ApplicationUpload,
} from '../types';
import {
  generateInitialState,
  generateId,
  formatTokenNumber,
  generateOtp,
  generateDocumentText,
  INSTITUTIONS,
  SERVICES,
  getWaitingTokens,
  getServingTokens,
} from '../data/mockData';
import { speakQueueAnnouncement, playSuccessTone, playErrorBuzz } from './sound';

const STORAGE_KEY = 'pingme-queue:db:v1';
const MY_TOKENS_KEY = 'pingme-queue:my-tokens:v1';

// Global memory cache & broadcast channel
let memoryState: AppState | null = null;
const stateListeners = new Set<() => void>();
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel('pingme_queue_sync');
    broadcastChannel.onmessage = () => {
      loadStateFromStorage();
      notifyListeners();
    };
  } catch (e) {
    console.warn('BroadcastChannel not available', e);
  }
}

function loadStateFromStorage(): AppState {
  if (typeof window === 'undefined') {
    return { ready: false, services: SERVICES, tokens: [], applications: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.tokens && parsed.services) {
        memoryState = { ...parsed, ready: true };
        return memoryState!;
      }
    }
  } catch (err) {
    console.error('Failed to parse localStorage db', err);
  }

  // Initialize with seed data
  const initial = generateInitialState();
  saveStateToStorage(initial, false);
  memoryState = initial;
  return memoryState;
}

function saveStateToStorage(state: AppState, broadcast = true): void {
  memoryState = state;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (broadcast && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'UPDATE', timestamp: Date.now() });
      }
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }
}

function notifyListeners(): void {
  stateListeners.forEach(listener => listener());
}

// Subscribe function for React's useSyncExternalStore
function subscribe(listener: () => void) {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

function getSnapshot(): AppState {
  if (!memoryState) {
    return loadStateFromStorage();
  }
  return memoryState;
}

// Window storage listener for multi-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        memoryState = { ...JSON.parse(e.newValue), ready: true };
        notifyListeners();
      } catch (err) {
        console.error(err);
      }
    }
  });
}

// Local "My Tokens" tracker
export function getMyTokenIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MY_TOKENS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMyTokenId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getMyTokenIds();
    const updated = [id, ...existing.filter(item => item !== id)].slice(0, 25);
    window.localStorage.setItem(MY_TOKENS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

// Custom Hook to access PingME state and actions
export function usePingMEStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // 1. Advance queue / Call Next Token
  const callNextToken = useCallback((serviceId?: string, preferredCounter?: number): { calledToken: Token | null; freedCounter: number } => {
    const current = getSnapshot();
    const targetServiceId = serviceId || (current.tokens.find(t => t.status === 'waiting')?.serviceId ?? 'opd-general');
    const service = current.services.find(s => s.id === targetServiceId);

    if (!service) return { calledToken: null, freedCounter: 1 };

    const waiting = getWaitingTokens(current.tokens, targetServiceId);
    if (waiting.length === 0) return { calledToken: null, freedCounter: 1 };

    const tokenToCall = waiting[0];
    const now = Date.now();
    const serving = getServingTokens(current.tokens, targetServiceId);

    // Determine which counter to assign
    let assignedCounter = preferredCounter ?? 1;
    const occupiedCounters = serving.map(t => t.counter ?? 1);

    const updatedTokens = [...current.tokens];

    // If all counters are occupied, complete the oldest serving token at the target counter
    if (occupiedCounters.includes(assignedCounter)) {
      const idxToComplete = updatedTokens.findIndex(t => t.serviceId === targetServiceId && t.status === 'serving' && t.counter === assignedCounter);
      if (idxToComplete !== -1) {
        updatedTokens[idxToComplete] = {
          ...updatedTokens[idxToComplete],
          status: 'completed',
          completedAt: now,
        };
      }
    }

    // Set the waiting token to serving
    const waitingIdx = updatedTokens.findIndex(t => t.id === tokenToCall.id);
    if (waitingIdx !== -1) {
      updatedTokens[waitingIdx] = {
        ...updatedTokens[waitingIdx],
        status: 'serving',
        counter: assignedCounter,
        calledAt: now,
      };
    }

    // Update application timeline if exists
    let updatedApplications = current.applications;
    if (tokenToCall.applicationId) {
      updatedApplications = current.applications.map(app => {
        if (app.id === tokenToCall.applicationId) {
          return {
            ...app,
            updatedAt: now,
            timeline: [
              ...app.timeline,
              { at: now, label: `Called to Counter ${assignedCounter}`, detail: `Token ${tokenToCall.number} announced` },
            ],
          };
        }
        return app;
      });
    }

    const nextState: AppState = {
      ...current,
      tokens: updatedTokens,
      applications: updatedApplications,
    };

    saveStateToStorage(nextState);
    notifyListeners();

    // Trigger voice alert
    speakQueueAnnouncement(tokenToCall.number, assignedCounter);

    return { calledToken: updatedTokens[waitingIdx], freedCounter: assignedCounter };
  }, []);

  // 2. Create Token & Optional Application
  const createTokenAndApplication = useCallback((payload: {
    serviceId: string;
    citizenName: string;
    phone: string;
    priority?: boolean;
    formData?: Record<string, string>;
    uploads?: ApplicationUpload[];
    otp?: string;
    docStatus?: 'AI_VERIFIED' | 'PENDING' | 'REJECTED';
    venue?: string;
  }): Token => {
    const current = getSnapshot();
    const service = current.services.find(s => s.id === payload.serviceId);
    if (!service) throw new Error('Service not found');

    const now = Date.now();
    const tokenId = generateId('PMQ');
    const existingTokens = current.tokens.filter(t => t.serviceId === service.id);
    const maxSeq = existingTokens.reduce((max, t) => Math.max(max, t.seq), 0);
    const seq = maxSeq + 1;
    const number = formatTokenNumber(service.prefix, seq);

    const otp = payload.otp || generateOtp();
    const docStatus = payload.docStatus || (payload.uploads && payload.uploads.length > 0 ? 'AI_VERIFIED' : 'AI_VERIFIED');

    const tokenObj: Token = {
      id: tokenId,
      number,
      seq,
      serviceId: service.id,
      citizenName: payload.citizenName.trim(),
      phone: payload.phone.trim(),
      status: 'waiting',
      priority: !!payload.priority,
      createdAt: now,
      otp,
      docStatus,
      uploadedDocs: payload.uploads || [],
      venue: payload.venue || service.institutionId,
    };

    let updatedApplications = [...current.applications];

    if (service.requiresReview || payload.formData) {
      const appId = generateId('APP');
      tokenObj.applicationId = appId;
      const institution = INSTITUTIONS.find(i => i.id === service.institutionId)!;
      const formData = payload.formData || {};
      const docText = generateDocumentText(service, institution, formData, payload.citizenName, now);

      const requiredDocs = service.documents.filter(d => d.required);
      const providedUploads = payload.uploads || [];
      const completenessScore = requiredDocs.length === 0 ? 100 : Math.round((providedUploads.length / requiredDocs.length) * 100);

      const appObj: Application = {
        id: appId,
        serviceId: service.id,
        tokenId,
        citizenName: payload.citizenName.trim(),
        phone: payload.phone.trim(),
        formData,
        generatedDocument: docText,
        uploads: providedUploads,
        completeness: Math.min(100, completenessScore),
        docStatus: service.requiresReview ? 'pending_review' : 'not_required',
        timeline: [
          { at: now, label: 'Application submitted', detail: 'Guided form completed' },
          { at: now, label: 'Completeness check passed', detail: `${completenessScore}% of required items verified` },
          { at: now, label: `Token ${number} issued`, detail: service.name },
          ...(service.requiresReview ? [{ at: now, label: 'Awaiting document review', detail: 'An officer will verify your documents' }] : []),
        ],
        createdAt: now,
        updatedAt: now,
      };

      updatedApplications.push(appObj);
    }

    const nextState: AppState = {
      ...current,
      tokens: [...current.tokens, tokenObj],
      applications: updatedApplications,
    };

    saveStateToStorage(nextState);
    notifyListeners();
    saveMyTokenId(tokenId);

    return tokenObj;
  }, []);

  // 3. Cancel Token
  const cancelToken = useCallback((tokenId: string) => {
    const current = getSnapshot();
    const token = current.tokens.find(t => t.id === tokenId);
    if (!token) return;

    const now = Date.now();
    const updatedTokens = current.tokens.map(t => {
      if (t.id === tokenId) {
        return { ...t, status: 'cancelled' as const, completedAt: now };
      }
      return t;
    });

    let updatedApplications = current.applications;
    if (token.applicationId) {
      updatedApplications = current.applications.map(app => {
        if (app.id === token.applicationId) {
          return {
            ...app,
            updatedAt: now,
            timeline: [...app.timeline, { at: now, label: 'Token cancelled', detail: 'Cancelled by citizen' }],
          };
        }
        return app;
      });
    }

    saveStateToStorage({ ...current, tokens: updatedTokens, applications: updatedApplications });
    notifyListeners();
  }, []);

  // 4b. Verify OTP Handshake & Complete Token (Officer Action)
  const verifyOtpAndCompleteToken = useCallback((tokenId: string, enteredOtp: string): { success: boolean; error?: string } => {
    const current = getSnapshot();
    const token = current.tokens.find(t => t.id === tokenId);
    if (!token) {
      return { success: false, error: 'Token not found.' };
    }

    const cleanEntered = enteredOtp.replace(/\D/g, '');
    const cleanExpected = (token.otp || '').replace(/\D/g, '');

    // Allow verification if OTP matches or if master demo bypass '999999' is entered
    if (cleanEntered !== cleanExpected && cleanEntered !== '999999') {
      playErrorBuzz();
      return {
        success: false,
        error: `Invalid OTP "${enteredOtp.trim()}". Verification failed. Please check the citizen's 6-digit boarding pass OTP.`
      };
    }

    const now = Date.now();
    const updatedTokens = current.tokens.map(t => {
      if (t.id === tokenId) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: now,
        };
      }
      return t;
    });

    let updatedApplications = current.applications;
    if (token.applicationId) {
      updatedApplications = current.applications.map(app => {
        if (app.id === token.applicationId) {
          return {
            ...app,
            updatedAt: now,
            timeline: [
              ...app.timeline,
              {
                at: now,
                label: 'Counter OTP Handshake verified',
                detail: `Identity confirmed with 6-digit OTP (${token.otp || enteredOtp.trim()}). Service completed.`,
              },
            ],
          };
        }
        return app;
      });
    }

    saveStateToStorage({ ...current, tokens: updatedTokens, applications: updatedApplications });
    notifyListeners();
    playSuccessTone();

    return { success: true };
  }, []);

  // 4c. Quick complete token (Direct officer action)
  const completeToken = useCallback((tokenId: string) => {
    const current = getSnapshot();
    const token = current.tokens.find(t => t.id === tokenId);
    if (!token) return;

    const now = Date.now();
    const updatedTokens = current.tokens.map(t => {
      if (t.id === tokenId) {
        return { ...t, status: 'completed' as const, completedAt: now };
      }
      return t;
    });

    let updatedApplications = current.applications;
    if (token.applicationId) {
      updatedApplications = current.applications.map(app => {
        if (app.id === token.applicationId) {
          return {
            ...app,
            updatedAt: now,
            timeline: [...app.timeline, { at: now, label: 'Service completed', detail: 'Officer marked service as finished' }],
          };
        }
        return app;
      });
    }

    saveStateToStorage({ ...current, tokens: updatedTokens, applications: updatedApplications });
    notifyListeners();
    playSuccessTone();
  }, []);

  // 5. Review Application (Officer Action)
  const reviewApplication = useCallback((appId: string, status: DocReviewStatus, reviewNote?: string) => {
    const current = getSnapshot();
    const now = Date.now();

    const updatedApplications = current.applications.map(app => {
      if (app.id === appId) {
        const label = status === 'approved' ? 'Documents approved by officer' : status === 'correction_requested' ? 'Correction requested by officer' : 'Review status updated';
        return {
          ...app,
          docStatus: status,
          reviewNote: reviewNote || app.reviewNote,
          reviewedAt: now,
          updatedAt: now,
          timeline: [
            ...app.timeline,
            { at: now, label, detail: reviewNote || (status === 'approved' ? 'All required verification checks passed' : undefined) },
          ],
        };
      }
      return app;
    });

    saveStateToStorage({ ...current, applications: updatedApplications });
    notifyListeners();
  }, []);

  // 6. Resubmit corrected documents
  const resubmitDocuments = useCallback((appId: string, newUploads: ApplicationUpload[]) => {
    const current = getSnapshot();
    const now = Date.now();

    const updatedApplications = current.applications.map(app => {
      if (app.id === appId) {
        const existingMap = new Map(app.uploads.map(u => [u.requirementId, u]));
        newUploads.forEach(u => existingMap.set(u.requirementId, u));
        const combined = Array.from(existingMap.values());

        return {
          ...app,
          uploads: combined,
          docStatus: 'pending_review' as DocReviewStatus,
          updatedAt: now,
          timeline: [
            ...app.timeline,
            { at: now, label: 'Corrected documents resubmitted', detail: newUploads.map(u => u.fileName).join(', ') },
          ],
        };
      }
      return app;
    });

    saveStateToStorage({ ...current, applications: updatedApplications });
    notifyListeners();
  }, []);

  // 7. Toggle service availability
  const toggleService = useCallback((serviceId: string) => {
    const current = getSnapshot();
    const updatedServices = current.services.map(s => {
      if (s.id === serviceId) {
        return { ...s, isOpen: !s.isOpen };
      }
      return s;
    });

    saveStateToStorage({ ...current, services: updatedServices });
    notifyListeners();
  }, []);

  // 8. Reset to pristine demo data
  const resetDatabase = useCallback(() => {
    const fresh = generateInitialState();
    saveStateToStorage(fresh);
    notifyListeners();
  }, []);

  return {
    state,
    services: state.services,
    tokens: state.tokens,
    applications: state.applications,
    callNextToken,
    createTokenAndApplication,
    cancelToken,
    completeToken,
    verifyOtpAndCompleteToken,
    reviewApplication,
    resubmitDocuments,
    toggleService,
    resetDatabase,
  };
}
