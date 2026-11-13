export type ServiceCategory = 'hospital' | 'government' | 'education';

export interface CategoryInfo {
  label: string;
  short: string;
  description: string;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  address: string;
  hours: string;
}

export interface ServiceField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface DocumentRequirement {
  id: string;
  label: string;
  required: boolean;
  hint?: string;
}

export interface Service {
  id: string;
  institutionId: string;
  category: ServiceCategory;
  name: string;
  description: string;
  prefix: string;
  counters: number;
  avgServiceMins: number;
  isOpen: boolean;
  requiresReview: boolean;
  fields: ServiceField[];
  documents: DocumentRequirement[];
}

export type TokenStatus = 'waiting' | 'serving' | 'completed' | 'cancelled';

export interface Token {
  id: string;
  number: string;
  seq: number;
  serviceId: string;
  citizenName: string;
  phone: string;
  status: TokenStatus;
  priority: boolean;
  counter?: number;
  createdAt: number;
  calledAt?: number;
  completedAt?: number;
  applicationId?: string;
}

export interface ApplicationUpload {
  requirementId: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: number;
  simulated?: boolean;
  fileData?: string;
  ocrVerified?: boolean;
  ocrScore?: number;
  ocrDetails?: string;
}

export interface TimelineEvent {
  at: number;
  label: string;
  detail?: string;
}

export type DocReviewStatus = 'pending_review' | 'approved' | 'correction_requested' | 'not_required';

export interface Application {
  id: string;
  serviceId: string;
  tokenId: string;
  citizenName: string;
  phone: string;
  formData: Record<string, string>;
  generatedDocument: string;
  uploads: ApplicationUpload[];
  completeness: number;
  docStatus: DocReviewStatus;
  reviewNote?: string;
  reviewedAt?: number;
  timeline: TimelineEvent[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  ready: boolean;
  services: Service[];
  tokens: Token[];
  applications: Application[];
}
