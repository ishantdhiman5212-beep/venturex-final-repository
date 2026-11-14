import {
  CategoryInfo,
  Institution,
  ServiceCategory,
  Service,
  Token,
  Application,
  AppState,
} from '../types';

export const CATEGORIES: Record<ServiceCategory, CategoryInfo> = {
  hospital: {
    label: 'Hospital OPD',
    short: 'Healthcare',
    description: 'Outpatient consultations, diagnostics and lab services.',
  },
  government: {
    label: 'Government Documents',
    short: 'Citizen services',
    description: 'Certificates, ration cards and civic document assistance.',
  },
  education: {
    label: 'Educational Services',
    short: 'Education',
    description: 'Scholarships, certificates and admission verification.',
  },
};

export const INSTITUTIONS: Institution[] = [
  {
    id: 'city-general',
    code: 'CGH',
    name: 'City General Hospital',
    category: 'hospital',
    address: 'MG Road, Sector 4 (sample location)',
    hours: 'Mon–Sat · 8:00 AM – 4:00 PM',
  },
  {
    id: 'district-csc',
    code: 'DCSC',
    name: 'District Citizen Service Centre',
    category: 'government',
    address: 'Collectorate Complex, Block B (sample location)',
    hours: 'Mon–Fri · 10:00 AM – 5:00 PM',
  },
  {
    id: 'state-edu',
    code: 'SEFO',
    name: 'State Education Facilitation Office',
    category: 'education',
    address: 'Shiksha Bhawan, Civil Lines (sample location)',
    hours: 'Mon–Fri · 9:30 AM – 4:30 PM',
  },
];

const DOC_ID_PROOF = {
  id: 'id-proof',
  label: 'Identity proof (Aadhaar / Voter ID)',
  required: true,
  hint: 'Front side, clearly visible',
};

const DOC_ADDRESS_PROOF = {
  id: 'address-proof',
  label: 'Address proof',
  required: true,
  hint: 'Utility bill or rent agreement, under 3 months old',
};

const DOC_PHOTO = {
  id: 'photo',
  label: 'Passport-size photograph',
  required: true,
};

export const SERVICES: Service[] = [
  {
    id: 'opd-general',
    institutionId: 'city-general',
    category: 'hospital',
    name: 'General Medicine OPD',
    description: 'Consultation for fever, infections, BP, diabetes and general health concerns.',
    prefix: 'GM',
    counters: 3,
    avgServiceMins: 8,
    isOpen: true,
    requiresReview: false,
    fields: [
      { id: 'age', label: 'Age', type: 'number', required: true, placeholder: 'e.g. 42' },
      { id: 'gender', label: 'Gender', type: 'select', required: true, options: ['Female', 'Male', 'Other'] },
      { id: 'symptoms', label: 'Main symptoms', type: 'textarea', required: true, placeholder: 'e.g. Fever and cough for 3 days' },
      { id: 'visitType', label: 'Visit type', type: 'select', required: true, options: ['New patient', 'Follow-up'] },
    ],
    documents: [
      { id: 'id-proof', label: 'Identity proof', required: false, hint: 'Optional for OPD registration' },
      { id: 'prev-rx', label: 'Previous prescription', required: false, hint: 'Only for follow-up visits' },
    ],
  },
  {
    id: 'opd-paediatrics',
    institutionId: 'city-general',
    category: 'hospital',
    name: 'Paediatrics OPD',
    description: 'Child health consultations, vaccinations and growth check-ups.',
    prefix: 'PD',
    counters: 2,
    avgServiceMins: 10,
    isOpen: true,
    requiresReview: false,
    fields: [
      { id: 'childName', label: "Child's name", type: 'text', required: true },
      { id: 'age', label: "Child's age (years)", type: 'number', required: true },
      { id: 'symptoms', label: 'Reason for visit', type: 'textarea', required: true, placeholder: 'e.g. Vaccination due / cold' },
    ],
    documents: [
      { id: 'vaccine-card', label: 'Vaccination card', required: false },
    ],
  },
  {
    id: 'opd-ortho',
    institutionId: 'city-general',
    category: 'hospital',
    name: 'Orthopaedics OPD',
    description: 'Bone, joint and injury consultations with X-ray referral.',
    prefix: 'OR',
    counters: 1,
    avgServiceMins: 12,
    isOpen: true,
    requiresReview: false,
    fields: [
      { id: 'age', label: 'Age', type: 'number', required: true },
      { id: 'symptoms', label: 'Pain / injury details', type: 'textarea', required: true },
    ],
    documents: [
      { id: 'xray', label: 'Previous X-ray report', required: false },
    ],
  },
  {
    id: 'lab-diagnostics',
    institutionId: 'city-general',
    category: 'hospital',
    name: 'Lab & Diagnostics',
    description: 'Blood tests, sample collection and report pickup.',
    prefix: 'LB',
    counters: 2,
    avgServiceMins: 5,
    isOpen: true,
    requiresReview: false,
    fields: [
      { id: 'testType', label: 'Test type', type: 'select', required: true, options: ['Blood test', 'Urine test', 'Report pickup', 'ECG'] },
      { id: 'doctor', label: 'Referring doctor', type: 'text', required: false },
    ],
    documents: [
      { id: 'lab-slip', label: "Doctor's test slip", required: true, hint: 'Photo of the referral slip' },
    ],
  },
  {
    id: 'income-cert',
    institutionId: 'district-csc',
    category: 'government',
    name: 'Income Certificate',
    description: 'Apply for an annual family income certificate for schemes and admissions.',
    prefix: 'IC',
    counters: 2,
    avgServiceMins: 12,
    isOpen: true,
    requiresReview: true,
    fields: [
      { id: 'fatherName', label: "Father's / Guardian's name", type: 'text', required: true },
      { id: 'occupation', label: 'Occupation', type: 'text', required: true },
      { id: 'annualIncome', label: 'Annual family income (₹)', type: 'number', required: true },
      { id: 'purpose', label: 'Purpose', type: 'select', required: true, options: ['Scholarship', 'College admission', 'Government scheme', 'Loan application'] },
      { id: 'address', label: 'Residential address', type: 'textarea', required: true },
    ],
    documents: [
      DOC_ID_PROOF,
      DOC_ADDRESS_PROOF,
      { id: 'income-proof', label: 'Salary slip / self-declaration', required: true },
      DOC_PHOTO,
    ],
  },
  {
    id: 'residence-cert',
    institutionId: 'district-csc',
    category: 'government',
    name: 'Residence / Domicile Certificate',
    description: 'Proof of residence for jobs, education quotas and local benefits.',
    prefix: 'RC',
    counters: 1,
    avgServiceMins: 10,
    isOpen: true,
    requiresReview: true,
    fields: [
      { id: 'fatherName', label: "Father's / Guardian's name", type: 'text', required: true },
      { id: 'yearsResiding', label: 'Years at current address', type: 'number', required: true },
      { id: 'address', label: 'Residential address', type: 'textarea', required: true },
    ],
    documents: [
      DOC_ID_PROOF,
      DOC_ADDRESS_PROOF,
      DOC_PHOTO,
    ],
  },
  {
    id: 'birth-cert',
    institutionId: 'district-csc',
    category: 'government',
    name: 'Birth Certificate',
    description: 'Register a birth or request a certified copy of a birth record.',
    prefix: 'BC',
    counters: 1,
    avgServiceMins: 9,
    isOpen: true,
    requiresReview: true,
    fields: [
      { id: 'childName', label: "Child's full name", type: 'text', required: true },
      { id: 'dob', label: 'Date of birth', type: 'date', required: true },
      { id: 'placeOfBirth', label: 'Place of birth (hospital)', type: 'text', required: true },
      { id: 'parents', label: "Parents' names", type: 'text', required: true },
    ],
    documents: [
      { id: 'hospital-record', label: 'Hospital discharge record', required: true },
      { id: 'parent-id', label: 'Parent identity proof', required: true },
    ],
  },
  {
    id: 'ration-update',
    institutionId: 'district-csc',
    category: 'government',
    name: 'Ration Card Update',
    description: 'Add or remove family members and update ration card details.',
    prefix: 'RN',
    counters: 1,
    avgServiceMins: 8,
    isOpen: false,
    requiresReview: true,
    fields: [
      { id: 'cardNumber', label: 'Ration card number', type: 'text', required: true },
      { id: 'changeType', label: 'Type of change', type: 'select', required: true, options: ['Add family member', 'Remove family member', 'Address change'] },
    ],
    documents: [
      { id: 'ration-card', label: 'Existing ration card copy', required: true },
      DOC_ID_PROOF,
    ],
  },
  {
    id: 'scholarship',
    institutionId: 'state-edu',
    category: 'education',
    name: 'Post-Matric Scholarship',
    description: 'Submit and verify scholarship applications for higher studies.',
    prefix: 'SC',
    counters: 2,
    avgServiceMins: 11,
    isOpen: true,
    requiresReview: true,
    fields: [
      { id: 'institute', label: 'College / Institute', type: 'text', required: true },
      { id: 'course', label: 'Course & year', type: 'text', required: true, placeholder: 'e.g. B.Sc. 2nd year' },
      { id: 'lastPercentage', label: 'Last exam percentage', type: 'number', required: true },
      { id: 'annualIncome', label: 'Annual family income (₹)', type: 'number', required: true },
    ],
    documents: [
      { id: 'marksheet', label: 'Previous year marksheet', required: true },
      { id: 'income-cert', label: 'Income certificate', required: true },
      { id: 'bonafide', label: 'Bonafide certificate', required: true },
      { id: 'bank-passbook', label: 'Bank passbook (first page)', required: false },
    ],
  },
  {
    id: 'transfer-cert',
    institutionId: 'state-edu',
    category: 'education',
    name: 'Transfer Certificate Attestation',
    description: 'Attestation of transfer and migration certificates.',
    prefix: 'TC',
    counters: 1,
    avgServiceMins: 7,
    isOpen: true,
    requiresReview: true,
    fields: [
      { id: 'school', label: 'Issuing school', type: 'text', required: true },
      { id: 'yearOfLeaving', label: 'Year of leaving', type: 'number', required: true },
    ],
    documents: [
      { id: 'tc-original', label: 'Original transfer certificate', required: true },
      DOC_ID_PROOF,
    ],
  },
  {
    id: 'admission-verify',
    institutionId: 'state-edu',
    category: 'education',
    name: 'Admission Document Verification',
    description: 'Verification of certificates for state quota admissions.',
    prefix: 'AV',
    counters: 2,
    avgServiceMins: 9,
    isOpen: true,
    requiresReview: true,
    fields: [
      { id: 'rollNo', label: 'Counselling roll number', type: 'text', required: true },
      { id: 'category', label: 'Admission category', type: 'select', required: true, options: ['General', 'OBC', 'SC', 'ST', 'EWS'] },
    ],
    documents: [
      { id: 'marksheet', label: 'Class 12 marksheet', required: true },
      { id: 'allotment', label: 'Seat allotment letter', required: true },
      { id: 'caste-cert', label: 'Category certificate', required: false },
    ],
  },
];

const CITIZEN_NAMES = [
  'Ananya Sharma', 'Rahul Verma', 'Priya Nair', 'Mohammed Irfan',
  'Sneha Patil', 'Arjun Reddy', 'Kavita Singh', 'Rohan Das',
  'Fatima Khan', 'Vikram Joshi', 'Meera Iyer', 'Suresh Kumar',
  'Pooja Mehta', 'Aditya Rao', 'Lakshmi Menon', 'Imran Sheikh',
  'Neha Gupta', 'Karan Malhotra', 'Divya Pillai', 'Sanjay Mishra',
  'Ritu Bansal', 'Abhishek Sen', 'Gayatri Hegde', 'Nikhil Jain'
];

export function generateOtp(): string {
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  return `${p1} ${p2}`;
}

export function formatTokenNumber(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

export function generateId(prefix: 'PMQ' | 'APP', existingIds?: Set<string>): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const fullId = `${prefix}-${code}`;
    if (!existingIds || !existingIds.has(fullId)) {
      return fullId;
    }
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function generateDocumentText(
  service: Service,
  institution: Institution,
  formData: Record<string, string>,
  citizenName: string,
  timestamp: number
): string {
  const dateStr = new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const name = citizenName.trim() || '[Applicant name]';

  if (service.category === 'hospital') {
    const fieldsList = service.fields
      .map(f => `• ${f.label}: ${formData[f.id]?.trim() || '—'}`)
      .join('\n');

    return `OPD REGISTRATION SLIP — ${service.name.toUpperCase()}
${institution.name}
Date: ${dateStr}

Patient name: ${name}
${fieldsList}

Triage note (auto-summarised):
Patient reports "${formData['symptoms'] || formData['testType'] || 'routine visit'}". Please present this slip and any previous prescriptions at the registration desk when your token is called.

This slip was prepared digitally through PingME Queue.`;
  }

  const detailsList = service.fields
    .map(f => `   ${f.label}: ${formData[f.id]?.trim() || '—'}`)
    .join('\n');

  const docList = service.documents
    .map((d, idx) => `   ${idx + 1}. ${d.label}`)
    .join('\n');

  return `To,
The Officer-in-Charge,
${institution.name}

Date: ${dateStr}

Subject: Application for ${service.name}

Respected Sir/Madam,

I, ${name}, respectfully request the issue/processing of ${service.name.toLowerCase()} in my name. The details required for processing are furnished below:

${detailsList}

I hereby declare that the information provided above is true and correct to the best of my knowledge. I have attached the supporting documents listed below for verification.

Enclosures:
${docList}

Kindly process my application at the earliest.

Yours faithfully,
${name}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function getWaitingTokens(tokens: Token[], serviceId: string): Token[] {
  return tokens
    .filter(t => t.serviceId === serviceId && t.status === 'waiting')
    .sort((a, b) => Number(b.priority) - Number(a.priority) || a.createdAt - b.createdAt);
}

export function getServingTokens(tokens: Token[], serviceId: string): Token[] {
  return tokens
    .filter(t => t.serviceId === serviceId && t.status === 'serving')
    .sort((a, b) => (a.counter ?? 0) - (b.counter ?? 0));
}

export function getTokenQueuePosition(tokens: Token[], token: Token): number {
  if (token.status !== 'waiting') return 0;
  const waiting = getWaitingTokens(tokens, token.serviceId);
  return waiting.findIndex(t => t.id === token.id) + 1;
}

export function estimateWaitTime(position: number, service: Service): number {
  if (position <= 0) return 0;
  return Math.ceil((position * service.avgServiceMins) / Math.max(1, service.counters));
}

// Deterministic seed generator
function createPrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateInitialState(now = Date.now()): AppState {
  const prng = createPrng(20261114);
  const tokens: Token[] = [];
  const applications: Application[] = [];
  let citizenIdx = 0;

  const nextCitizen = () => CITIZEN_NAMES[citizenIdx++ % CITIZEN_NAMES.length];
  const nextPhone = () => `9${Math.floor(1e8 + prng() * 899999999)}`;

  const serviceStats: Record<string, { completed: number; waiting: number; start: number }> = {
    'opd-general': { completed: 38, waiting: 7, start: 1 },
    'opd-paediatrics': { completed: 17, waiting: 4, start: 1 },
    'opd-ortho': { completed: 11, waiting: 3, start: 1 },
    'lab-diagnostics': { completed: 26, waiting: 5, start: 1 },
    'income-cert': { completed: 14, waiting: 4, start: 1 },
    'residence-cert': { completed: 9, waiting: 2, start: 1 },
    'birth-cert': { completed: 6, waiting: 2, start: 1 },
    'ration-update': { completed: 5, waiting: 0, start: 1 },
    scholarship: { completed: 12, waiting: 3, start: 1 },
    'transfer-cert': { completed: 4, waiting: 1, start: 1 },
    'admission-verify': { completed: 8, waiting: 2, start: 1 },
  };

  let idCounter = 1000;
  const createId = (p: string) => `${p}-${(idCounter++).toString(36).toUpperCase()}D`;

  for (const s of SERVICES) {
    const cfg = serviceStats[s.id] || { completed: 5, waiting: 2, start: 1 };
    let seq = cfg.start;

    // Completed tokens earlier today
    for (let i = 0; i < cfg.completed; i++) {
      const createdAt = now - Math.round((420 - (i / cfg.completed) * 380) * 60000);
      const callDelay = Math.round((6 + prng() * 18) * 60000);
      const isCancelled = prng() < 0.06;
      tokens.push({
        id: createId('PMQ'),
        number: formatTokenNumber(s.prefix, seq),
        seq: seq++,
        serviceId: s.id,
        citizenName: nextCitizen(),
        phone: nextPhone(),
        status: isCancelled ? 'cancelled' : 'completed',
        priority: prng() < 0.1,
        counter: 1 + Math.floor(prng() * s.counters),
        createdAt,
        calledAt: isCancelled ? undefined : createdAt + callDelay,
        completedAt: createdAt + callDelay + s.avgServiceMins * 60000,
      });
    }

    // Currently serving tokens
    if (s.isOpen) {
      const activeCounters = Math.min(s.counters, 2);
      for (let c = 1; c <= activeCounters; c++) {
        const createdAt = now - Math.round((20 + prng() * 15) * 60000);
        const sampleDocs = s.documents.map(d => ({
          requirementId: d.id,
          requirementLabel: d.label,
          fileName: `${d.id}_verified.pdf`,
          sizeBytes: 340000 + Math.round(prng() * 400000),
          mimeType: 'application/pdf',
          uploadedAt: createdAt,
          simulated: true,
          ocrVerified: true,
          ocrScore: 98,
          ocrDetails: 'AI Pre-Check Passed: Clear resolution, applicant name and seal authenticated.',
        }));

        tokens.push({
          id: createId('PMQ'),
          number: formatTokenNumber(s.prefix, seq),
          seq: seq++,
          serviceId: s.id,
          citizenName: nextCitizen(),
          phone: nextPhone(),
          status: 'serving',
          priority: false,
          counter: c,
          createdAt,
          calledAt: now - Math.round(prng() * 5 * 60000),
          otp: generateOtp(),
          docStatus: 'AI_VERIFIED',
          uploadedDocs: sampleDocs,
          venue: s.institutionId,
        });
      }
    }

    // Currently waiting tokens
    for (let w = 0; w < cfg.waiting; w++) {
      const createdAt = now - Math.round((cfg.waiting - w) * (3 + prng() * 3) * 60000);
      const tokenDocs = s.documents.map(d => ({
        requirementId: d.id,
        requirementLabel: d.label,
        fileName: `${d.id}_document.pdf`,
        sizeBytes: 250000 + Math.round(prng() * 500000),
        mimeType: 'application/pdf',
        uploadedAt: createdAt,
        simulated: true,
        ocrVerified: true,
        ocrScore: 97,
        ocrDetails: 'Verified via OCR Engine: Document headers match requirements.',
      }));

      const tokenObj: Token = {
        id: createId('PMQ'),
        number: formatTokenNumber(s.prefix, seq),
        seq: seq++,
        serviceId: s.id,
        citizenName: nextCitizen(),
        phone: nextPhone(),
        status: 'waiting',
        priority: w === 1 && s.category === 'hospital',
        createdAt,
        otp: generateOtp(),
        docStatus: 'AI_VERIFIED',
        uploadedDocs: tokenDocs,
        venue: s.institutionId,
      };

      if (s.requiresReview) {
        const appId = createId('APP');
        tokenObj.applicationId = appId;
        const institution = INSTITUTIONS.find(inst => inst.id === s.institutionId)!;

        const formData: Record<string, string> = {};
        for (const f of s.fields) {
          formData[f.id] = f.options?.[0] ?? (f.type === 'number' ? '120000' : f.type === 'date' ? '2026-03-14' : 'Sample entry');
        }

        const docStatus = w === 0 ? 'correction_requested' : w === 1 ? 'approved' : 'pending_review';

        applications.push({
          id: appId,
          serviceId: s.id,
          tokenId: tokenObj.id,
          citizenName: tokenObj.citizenName,
          phone: tokenObj.phone,
          formData,
          generatedDocument: generateDocumentText(s, institution, formData, tokenObj.citizenName, createdAt),
          uploads: s.documents.filter(d => d.required).map(d => ({
            requirementId: d.id,
            fileName: `${d.id}-scan.pdf`,
            sizeBytes: 220000 + Math.round(prng() * 900000),
            mimeType: 'application/pdf',
            uploadedAt: createdAt,
            simulated: true,
            ocrVerified: true,
            ocrScore: 98,
            ocrDetails: 'Verified via OCR Engine: Document headers match requirements.',
          })),
          completeness: 100,
          docStatus,
          reviewNote: docStatus === 'correction_requested' ? 'Address proof is older than 3 months. Please upload a recent utility bill.' : undefined,
          reviewedAt: docStatus === 'pending_review' ? undefined : createdAt + 240000,
          timeline: [
            { at: createdAt, label: 'Application submitted', detail: 'Guided form completed' },
            { at: createdAt, label: 'Completeness check passed', detail: '100% of required items verified' },
            { at: createdAt, label: `Token ${tokenObj.number} issued`, detail: s.name },
            ...(docStatus === 'approved' ? [{ at: createdAt + 240000, label: 'Documents approved by officer' }] : []),
            ...(docStatus === 'correction_requested' ? [{ at: createdAt + 240000, label: 'Correction requested by officer' }] : []),
          ],
          createdAt,
          updatedAt: createdAt,
        });
      }

      tokens.push(tokenObj);
    }
  }

  return {
    ready: true,
    services: SERVICES,
    tokens,
    applications,
  };
}
