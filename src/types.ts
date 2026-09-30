// ─── Roles ───
export type Role = 'owner' | 'facility_admin' | 'admin' | 'staff';

// ─── Users ───
export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: Role;
  facilityId?: string; // For facility_admin: the facility they manage
  branchId?: string; // For admin/staff: the branch they belong to
  avatar?: string;
}

// ─── Facility (top-level organization) ───
export interface Facility {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Senior Living' | 'Assisted Living' | 'Memory Care' | 'Multi-Specialty';
  status: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
  contractStart: string;
  contractEnd: string;
  contractDocumentUrl?: string;
  facilityAdminId: string;
  facilityAdminName: string;
  totalBranches: number;
  totalResidents: number;
}

// ─── Branch (under a Facility) ───
export interface Branch {
  id: string;
  facilityId: string;
  name: string;
  address: string;
  phone: string;
  type: string;
  status: string;
  residentLimit: number;
  currentResidents: number;
  branchAdminId?: string | null;
  branchAdminName?: string | null;
}

// ─── Resident ───
export type ResidentStatus = 'InPatient' | 'Hospitalized' | 'Discharged';

export type ResidentHealthState =
'Stable' |
'Slight Deviation' |
'Concerning Trend' |
'Early Deterioration' |
'Active Deterioration' |
'Recovery';

export interface EmergencyContact {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  relation: string;
  email?: string;
}

export interface Resident {
  id: string;
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  room: string;
  status: ResidentStatus;
  healthState: ResidentHealthState;
  admissionDate: string;
  weight?: number;
  height?: string;
  emergencyContacts: EmergencyContact[];
  medicalHistory: string;
  allergies?: string;
  primaryDiagnosis?: string;
  lastVitalsDate?: string;
  photoUrl?: string;
}

// ─── Vitals ───
export interface Vital {
  id: string;
  residentId: string;
  branchId: string;
  facilityId?: string;
  date: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  bloodSugar?: number;
  weight?: number;
  respiratoryRate?: number;
  recordedBy?: string;
  recordedById?: string;
  thresholdEvaluation?: Record<string, unknown>;
  /** Present when backend stored a clinical summary for this reading. */
  clinicalHealthState?: ResidentHealthState | string;
  recommendedAction?: string;
  notes?: string;
}

// ─── Tasks ───
export type TaskCategory =
'Medication' |
'Bathing' |
'Vitals' |
'Therapy' |
'Observation' |
'Meal' |
'General';

export interface Task {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: 'Todo' | 'In Progress' | 'Done' | 'Deferred';
  dueDate: string;
  assignedTo?: string;
  createdBy: string;
}

// ─── Alerts ───
export interface Alert {
  id: string;
  facilityId: string;
  branchId?: string;
  residentId?: string;
  title: string;
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Unread' | 'Read' | 'Resolved';
  date: string;
  targetRoles: Role[];
  healthState?: ResidentHealthState;
}

// ─── Rules (Oron Platform Owner only) ───
export type VitalType =
'systolicBP' |
'diastolicBP' |
'heartRate' |
'oxygenSaturation' |
'temperature' |
'bloodSugar';

export interface RuleThreshold {
  normalMin: number;
  normalMax: number;
  lowThreshold: number;
  highThreshold: number;
  criticalLow: number;
  criticalHigh: number;
  unit: string;
}

export interface Rule {
  id: string;
  name: string;
  vitalType: VitalType;
  category: 'Vitals';
  thresholds: RuleThreshold;
  isActive: boolean;
  description: string;
}

export interface Medication {
  name: string;
  dosage: string;
  schedule: string;
  status: string;
}

export interface CarePlan {
  id: string;
  residentId: string;
  branchId: string;
  facilityId?: string;
  generatedDate: string;
  reviewDate: string;
  // NEW fields for metadata banner
  version?: string;          // e.g., "1.2"
  lastReviewDate?: string;   // ISO date
  nextReviewDate?: string;   // ISO date
  author?: string;           // e.g., "Dr. Sarah Johnson"
  updatedBy?: string | null;
  signed?: boolean;          // default false
  signedBy?: string | null;
  signedAt?: string | null;
  medications: Medication[];
  actions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Clinical Assessment ───
export interface ClinicalAssessment {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  conditions: string[];
  allergies: string[];
  adlScores: Record<string, string>;
  mobility: string;
  cognitive: string;
  author: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Risk & Safety Profile ───
export interface RiskProfile {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  fallRiskScore: number;
  mobilityTrend: string;
  nearFallEvents: number;
  vitalsTrend: string;
  narrativeInterpretation: string;
  author: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Goals ───
export interface Goal {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  description: string;
  targetMetric: string;
  timeframe: string;
  responsibleRole: string;
  status: string;
  author: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Planned Interventions ───
export interface Intervention {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  description: string;
  responsibleStaffRole: string;
  frequency: string;
  triggerConditions: string;
  effectivenessMetric: string;
  author: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Person Centered Preferences ───
export interface Preference {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  sleepPattern: string;
  mealPref: string;
  communication: string;
  socialPref: string;
  familyEngagement: string;
  isNA: boolean;
  author: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Staff Member ───
export interface StaffMember {
  id: string;
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: 'Caregiver' | 'Nurse' | 'Coordinator';
  status: 'Active' | 'Inactive';
  lastActive?: string;
  permissions: string[];
}

// ─── Audit Log ───
export interface AuditLog {
  id: string;
  facilityId?: string;
  branchId?: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
}

// ─── Note ───
export interface Note {
  id: string;
  residentId: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'Observation' | 'Clinical' | 'General';
}

// ─── Helper to get full name ───
export function getFullName(entity: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string {
  return [entity.firstName, entity.middleName, entity.lastName].
  filter(Boolean).
  join(' ');
}

export function getEmergencyContactDisplayName(
  contact: Partial<EmergencyContact> & { name?: string },
): string {
  const fromParts = getFullName({
    firstName: contact.firstName ?? '',
    middleName: contact.middleName,
    lastName: contact.lastName ?? '',
  }).trim();
  if (fromParts) return fromParts;
  const legacyName = contact.name?.trim();
  return legacyName || 'Unknown contact';
}

export function normalizeEmergencyContacts(value: unknown): EmergencyContact[] {
  let raw: unknown = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const contact = entry as Record<string, unknown>;
      const legacyName = String(contact.name ?? '').trim();
      const firstName = String(contact.firstName ?? contact.first_name ?? '').trim();
      const middleName =
        String(contact.middleName ?? contact.middle_name ?? '').trim() || undefined;
      const lastName = String(contact.lastName ?? contact.last_name ?? '').trim();
      const phone = String(
        contact.phone ?? contact.phoneNumber ?? contact.phone_number ?? '',
      ).trim();
      const relation = String(
        contact.relation ?? contact.relationship ?? '',
      ).trim();
      const email = String(contact.email ?? '').trim() || undefined;
      const id = String(contact.id ?? `contact-${index}`);

      if (!firstName && !lastName && !legacyName && !phone) return null;

      if (legacyName && !firstName && !lastName) {
        const parts = legacyName.split(/\s+/).filter(Boolean);
        return {
          id,
          firstName: parts[0] ?? legacyName,
          middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : undefined,
          lastName: parts.length > 1 ? parts[parts.length - 1] : '',
          phone,
          relation,
          email,
        };
      }

      return {
        id,
        firstName,
        middleName,
        lastName,
        phone,
        relation,
        email,
      };
    })
    .filter((contact): contact is EmergencyContact => contact !== null);
}

// Note type definition matching your backend
export interface Note {
  id: string;
  residentId: string;
  author: string;
  content: string;
  timestamp: string; // ISO date string
  type: 'Observation' | 'Clinical' | 'General';
  createdAt?: string;
  updatedAt?: string;
}

// Request types
export interface CreateNoteRequest {
  residentId: string;
  author: string;
  content: string;
  type: 'Observation' | 'Clinical' | 'General';
  timestamp?: string; // Optional, will use current time if not provided
}

export interface UpdateNoteRequest {
  residentId?: string;
  author?: string;
  content?: string;
  type?: 'Observation' | 'Clinical' | 'General';
  timestamp?: string;
}

// Filter types
export interface NoteFilters {
  residentId?: string;
  type?: string;
  author?: string;
  startDate?: string;
  endDate?: string;
}
export interface RefreshButtonProps {
  onRefresh?: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  text?: string;
  position?: "fixed" | "inline";
}

// Note type constants (optional, for easier usage)
export const NoteTypes = {
  OBSERVATION: 'Observation' as const,
  CLINICAL: 'Clinical' as const,
  GENERAL: 'General' as const,
} as const;

export type NoteType = typeof NoteTypes[keyof typeof NoteTypes];