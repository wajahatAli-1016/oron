import {
  User,
  Facility,
  Branch,
  Resident,
  Vital,
  Task,
  Alert,
  Rule,
  CarePlan,
  StaffMember,
  AuditLog,
  Note } from
'./types';

// ─── Users ───
export const mockUsers: User[] = [
{
  id: 'u1',
  firstName: 'Sarah',
  middleName: 'A.',
  lastName: 'Jenkins',
  email: 'owner@oron.com',
  role: 'owner',
  avatar: 'https://i.pravatar.cc/150?u=u1'
},
{
  id: 'u2',
  firstName: 'David',
  lastName: 'Miller',
  email: 'facilityadmin@sunrise.com',
  role: 'facility_admin',
  facilityId: 'fac1',
  avatar: 'https://i.pravatar.cc/150?u=u2'
},
{
  id: 'u3',
  firstName: 'Michael',
  lastName: 'Chang',
  email: 'admin@sunrise-downtown.com',
  role: 'admin',
  facilityId: 'fac1',
  branchId: 'b1',
  avatar: 'https://i.pravatar.cc/150?u=u3'
},
{
  id: 'u4',
  firstName: 'Emma',
  middleName: 'R.',
  lastName: 'Wilson',
  email: 'staff@sunrise-downtown.com',
  role: 'staff',
  facilityId: 'fac1',
  branchId: 'b1',
  avatar: 'https://i.pravatar.cc/150?u=u4'
}];


// ─── Facilities ───
export const mockFacilities: Facility[] = [
{
  id: 'fac1',
  name: 'Sunrise Senior Care',
  phone: '(555) 100-0000',
  email: 'info@sunrisesenior.com',
  type: 'Multi-Specialty',
  status: 'Active',
  contractStart: '2025-01-01',
  contractEnd: '2028-12-31',
  facilityAdminId: 'u2',
  facilityAdminName: 'David Miller',
  totalBranches: 3,
  totalResidents: 267
},
{
  id: 'fac2',
  name: 'Oakridge Care Group',
  phone: '(555) 200-0000',
  email: 'info@oakridgecare.com',
  type: 'Memory Care',
  status: 'Active',
  contractStart: '2024-06-01',
  contractEnd: '2027-05-31',
  facilityAdminId: 'u5',
  facilityAdminName: 'Lisa Wong',
  totalBranches: 2,
  totalResidents: 130
},
{
  id: 'fac3',
  name: 'Pines Retirement Group',
  phone: '(555) 300-0000',
  email: 'info@pinesretirement.com',
  type: 'Senior Living',
  status: 'Pending',
  contractStart: '2026-05-01',
  contractEnd: '2029-04-30',
  facilityAdminId: 'u6',
  facilityAdminName: 'Robert Taylor',
  totalBranches: 1,
  totalResidents: 0
}];


// ─── Branches ───
export const mockBranches: Branch[] = [
{
  id: 'b1',
  facilityId: 'fac1',
  name: 'Sunrise Downtown',
  address: '123 Sunshine Blvd, CA 90210',
  phone: '(555) 101-0001',
  type: 'Assisted Living',
  status: 'Active',
  residentLimit: 150,
  currentResidents: 142,
  branchAdminId: 'u3',
  branchAdminName: 'Michael Chang'
},
{
  id: 'b2',
  facilityId: 'fac1',
  name: 'Sunrise Westside',
  address: '456 West Ave, CA 90211',
  phone: '(555) 101-0002',
  type: 'Memory Care',
  status: 'Active',
  residentLimit: 80,
  currentResidents: 75,
  branchAdminId: 'u7',
  branchAdminName: 'Karen Lee'
},
{
  id: 'b3',
  facilityId: 'fac1',
  name: 'Sunrise Eastside',
  address: '789 East Rd, CA 90212',
  phone: '(555) 101-0003',
  type: 'Senior Living',
  status: 'Pending',
  residentLimit: 100,
  currentResidents: 50,
  branchAdminId: 'u8',
  branchAdminName: 'Tom Harris'
},
{
  id: 'b4',
  facilityId: 'fac2',
  name: 'Oakridge Main',
  address: '100 Oak Lane, TX 75001',
  phone: '(555) 201-0001',
  type: 'Memory Care',
  status: 'Active',
  residentLimit: 80,
  currentResidents: 75,
  branchAdminId: 'u9',
  branchAdminName: 'James Rodriguez'
},
{
  id: 'b5',
  facilityId: 'fac2',
  name: 'Oakridge North',
  address: '200 Oak Lane N, TX 75002',
  phone: '(555) 201-0002',
  type: 'Memory Care',
  status: 'Active',
  residentLimit: 60,
  currentResidents: 55,
  branchAdminId: 'u10',
  branchAdminName: 'Linda Chen'
},
{
  id: 'b6',
  facilityId: 'fac3',
  name: 'Pines Main Campus',
  address: '789 Pine Road, FL 33101',
  phone: '(555) 301-0001',
  type: 'Senior Living',
  status: 'Pending',
  residentLimit: 200,
  currentResidents: 0,
  branchAdminId: 'u11',
  branchAdminName: 'Nancy White'
}];


// ─── Residents ───
export const mockResidents: Resident[] = [
{
  id: 'r1',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'Eleanor',
  middleName: 'M.',
  lastName: 'Roosevelt',
  dob: '1935-10-11',
  gender: 'Female',
  room: '101A',
  status: 'InPatient',
  healthState: 'Slight Deviation',
  admissionDate: '2023-02-15',
  weight: 145,
  height: '5\'4"',
  emergencyContacts: [
  {
    id: 'ec1',
    firstName: 'Franklin',
    lastName: 'Roosevelt Jr.',
    phone: '(555) 111-2222',
    relation: 'Son'
  },
  {
    id: 'ec2',
    firstName: 'Anna',
    middleName: 'E.',
    lastName: 'Roosevelt',
    phone: '(555) 111-3333',
    relation: 'Daughter',
    email: 'anna@email.com'
  }],

  medicalHistory: 'Hypertension, Type 2 Diabetes, mild arthritis.',
  allergies: 'Penicillin',
  primaryDiagnosis: 'Hypertension, Type 2 Diabetes',
  lastVitalsDate: '2026-04-08T08:30:00Z'
},
{
  id: 'r2',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'Arthur',
  lastName: 'Pendragon',
  dob: '1940-05-15',
  gender: 'Male',
  room: '205B',
  status: 'InPatient',
  healthState: 'Stable',
  admissionDate: '2024-11-10',
  weight: 160,
  height: '5\'10"',
  emergencyContacts: [
  {
    id: 'ec3',
    firstName: 'Morgan',
    lastName: 'Le Fay',
    phone: '(555) 333-4444',
    relation: 'Sister'
  }],

  medicalHistory: 'History of falls, mild cognitive impairment.',
  primaryDiagnosis: 'Mild Cognitive Impairment',
  lastVitalsDate: '2026-04-08T09:15:00Z'
},
{
  id: 'r3',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'Betty',
  lastName: 'White',
  dob: '1922-01-17',
  gender: 'Female',
  room: '302',
  status: 'Hospitalized',
  healthState: 'Early Deterioration',
  admissionDate: '2021-08-20',
  weight: 130,
  height: '5\'2"',
  emergencyContacts: [
  {
    id: 'ec4',
    firstName: 'Allen',
    lastName: 'Ludden',
    phone: '(555) 555-6666',
    relation: 'Nephew'
  },
  {
    id: 'ec5',
    firstName: 'Sue Ann',
    lastName: 'Nivens',
    phone: '(555) 777-8888',
    relation: 'Friend'
  },
  {
    id: 'ec6',
    firstName: 'Rose',
    lastName: 'Nylund',
    phone: '(555) 999-0000',
    relation: 'Friend',
    email: 'rose@email.com'
  }],

  medicalHistory: 'Osteoporosis, recent hip fracture.',
  primaryDiagnosis: 'Osteoporosis',
  lastVitalsDate: '2026-04-05T14:00:00Z'
},
{
  id: 'r4',
  branchId: 'b2',
  facilityId: 'fac1',
  firstName: 'George',
  middleName: 'H.',
  lastName: 'Burns',
  dob: '1930-01-20',
  gender: 'Male',
  room: '110',
  status: 'InPatient',
  healthState: 'Concerning Trend',
  admissionDate: '2024-03-01',
  weight: 155,
  height: '5\'8"',
  emergencyContacts: [
  {
    id: 'ec7',
    firstName: 'Gracie',
    lastName: 'Allen',
    phone: '(555) 444-5555',
    relation: 'Daughter'
  }],

  medicalHistory: "Alzheimer's disease, hypertension.",
  primaryDiagnosis: "Alzheimer's Disease",
  lastVitalsDate: '2026-04-07T10:00:00Z'
},
{
  id: 'r5',
  branchId: 'b4',
  facilityId: 'fac2',
  firstName: 'Dorothy',
  lastName: 'Zbornak',
  dob: '1938-06-12',
  gender: 'Female',
  room: '201',
  status: 'InPatient',
  healthState: 'Recovery',
  admissionDate: '2025-01-15',
  weight: 140,
  height: '5\'6"',
  emergencyContacts: [
  {
    id: 'ec8',
    firstName: 'Sophia',
    lastName: 'Petrillo',
    phone: '(555) 222-3333',
    relation: 'Mother'
  }],

  medicalHistory: 'Chronic fatigue syndrome, mild depression.',
  primaryDiagnosis: 'Chronic Fatigue Syndrome',
  lastVitalsDate: '2026-04-08T07:45:00Z'
}];


// ─── Vitals ───
export const mockVitals: Vital[] = [
{
  id: 'v1',
  residentId: 'r1',
  branchId: 'b1',
  date: '2026-04-08T08:30:00Z',
  systolicBP: 135,
  diastolicBP: 85,
  heartRate: 78,
  temperature: 98.6,
  oxygenSaturation: 97,
  bloodSugar: 110,
  weight: 145,
  respiratoryRate: 16,
  recordedBy: 'Emma R. Wilson'
},
{
  id: 'v2',
  residentId: 'r1',
  branchId: 'b1',
  date: '2026-04-07T08:30:00Z',
  systolicBP: 142,
  diastolicBP: 92,
  heartRate: 82,
  temperature: 98.4,
  oxygenSaturation: 96,
  bloodSugar: 185,
  weight: 145.5,
  respiratoryRate: 18,
  recordedBy: 'Emma R. Wilson',
  notes: 'Patient reported mild headache.'
},
{
  id: 'v3',
  residentId: 'r1',
  branchId: 'b1',
  date: '2026-04-06T08:30:00Z',
  systolicBP: 148,
  diastolicBP: 95,
  heartRate: 88,
  temperature: 99.2,
  oxygenSaturation: 95,
  bloodSugar: 192,
  weight: 146,
  respiratoryRate: 20,
  recordedBy: 'Emma R. Wilson',
  notes: 'Elevated BP trend continuing. Notified physician.'
},
{
  id: 'v4',
  residentId: 'r2',
  branchId: 'b1',
  date: '2026-04-08T09:15:00Z',
  systolicBP: 120,
  diastolicBP: 80,
  heartRate: 72,
  temperature: 98.2,
  oxygenSaturation: 98,
  weight: 160,
  respiratoryRate: 14,
  recordedBy: 'Emma R. Wilson'
},
{
  id: 'v5',
  residentId: 'r2',
  branchId: 'b1',
  date: '2026-04-06T09:15:00Z',
  systolicBP: 125,
  diastolicBP: 82,
  heartRate: 75,
  temperature: 98.4,
  oxygenSaturation: 97,
  weight: 161,
  respiratoryRate: 15,
  recordedBy: 'Emma R. Wilson'
},
{
  id: 'v6',
  residentId: 'r3',
  branchId: 'b1',
  date: '2026-04-05T14:00:00Z',
  systolicBP: 110,
  diastolicBP: 70,
  heartRate: 65,
  temperature: 99.1,
  oxygenSaturation: 91,
  weight: 130,
  respiratoryRate: 22,
  recordedBy: 'Emma R. Wilson',
  notes: 'SpO2 dropping. Transferred to hospital.'
},
{
  id: 'v7',
  residentId: 'r4',
  branchId: 'b2',
  date: '2026-04-07T10:00:00Z',
  systolicBP: 150,
  diastolicBP: 95,
  heartRate: 92,
  temperature: 99.8,
  oxygenSaturation: 94,
  bloodSugar: 165,
  weight: 155,
  respiratoryRate: 19,
  recordedBy: 'Karen Lee',
  notes: 'Multiple vitals trending upward. Monitoring closely.'
},
{
  id: 'v8',
  residentId: 'r5',
  branchId: 'b4',
  date: '2026-04-08T07:45:00Z',
  systolicBP: 118,
  diastolicBP: 76,
  heartRate: 70,
  temperature: 98.4,
  oxygenSaturation: 97,
  weight: 140,
  respiratoryRate: 15,
  recordedBy: 'James Rodriguez',
  notes: 'Vitals improving. Recovery on track.'
}];


// ─── Alerts ───
export const mockAlerts: Alert[] = [
// Owner Alerts
{
  id: 'a1_owner',
  facilityId: 'fac2',
  title: 'Contract Expiring Soon',
  message: 'Facility contract for Oakridge Care Group expires in 30 days.',
  severity: 'Warning',
  status: 'Unread',
  date: '2026-04-01T10:00:00Z',
  targetRoles: ['owner']
},
{
  id: 'a2_owner',
  facilityId: 'fac1',
  branchId: 'b1',
  title: 'High Utilization Alert',
  message: 'Sunrise Downtown has reached 95% of its resident limit.',
  severity: 'Info',
  status: 'Unread',
  date: '2026-04-07T09:00:00Z',
  targetRoles: ['owner', 'facility_admin']
},
{
  id: 'a3_owner',
  facilityId: 'fac3',
  title: 'New Facility Onboarded',
  message: 'Pines Retirement Group setup is pending admin completion.',
  severity: 'Info',
  status: 'Read',
  date: '2026-03-15T14:30:00Z',
  targetRoles: ['owner']
},
{
  id: 'a4_owner',
  facilityId: 'fac1',
  title: 'Compliance Review Due',
  message: 'Annual HIPAA compliance review for Sunrise Senior Care is due.',
  severity: 'Warning',
  status: 'Unread',
  date: '2026-04-08T08:00:00Z',
  targetRoles: ['owner', 'facility_admin']
},

// Facility Admin Alerts
{
  id: 'a1_facadmin',
  facilityId: 'fac1',
  branchId: 'b1',
  residentId: 'r1',
  title: 'Elevated Blood Pressure',
  message:
  'Eleanor M. Roosevelt recorded BP of 148/95, exceeding high threshold (>140/>90).',
  severity: 'Warning',
  status: 'Unread',
  date: '2026-04-06T08:35:00Z',
  targetRoles: ['facility_admin', 'admin'],
  healthState: 'Slight Deviation'
},
{
  id: 'a2_facadmin',
  facilityId: 'fac1',
  branchId: 'b2',
  residentId: 'r4',
  title: 'Concerning Vital Trends',
  message:
  'George H. Burns showing multiple elevated vitals. SpO2 at 94%, BP 150/95.',
  severity: 'Warning',
  status: 'Unread',
  date: '2026-04-07T10:05:00Z',
  targetRoles: ['facility_admin', 'admin'],
  healthState: 'Concerning Trend'
},

// Admin / Staff Alerts
{
  id: 'a1_admin',
  facilityId: 'fac1',
  branchId: 'b1',
  residentId: 'r1',
  title: 'High Blood Sugar',
  message:
  'Eleanor M. Roosevelt recorded blood sugar of 192 mg/dL (threshold: >180).',
  severity: 'Warning',
  status: 'Unread',
  date: '2026-04-06T08:35:00Z',
  targetRoles: ['admin', 'staff'],
  healthState: 'Slight Deviation'
},
{
  id: 'a2_admin',
  facilityId: 'fac1',
  branchId: 'b1',
  residentId: 'r3',
  title: 'Low Oxygen Saturation — Hospital Transfer',
  message:
  'Betty White recorded SpO2 of 91% (critical threshold: <92%). Transferred to General Hospital.',
  severity: 'Critical',
  status: 'Resolved',
  date: '2026-04-05T15:30:00Z',
  targetRoles: ['admin', 'staff', 'facility_admin'],
  healthState: 'Early Deterioration'
},
{
  id: 'a3_admin',
  facilityId: 'fac1',
  branchId: 'b1',
  title: 'Staff Shortage',
  message: 'Night shift is understaffed by 1 caregiver at Sunrise Downtown.',
  severity: 'Info',
  status: 'Unread',
  date: '2026-04-08T14:00:00Z',
  targetRoles: ['admin', 'facility_admin']
},
{
  id: 'a4_staff',
  facilityId: 'fac1',
  branchId: 'b1',
  residentId: 'r2',
  title: 'Missed Medication',
  message: 'Arthur Pendragon missed morning dosage of Donepezil.',
  severity: 'Warning',
  status: 'Unread',
  date: '2026-04-08T10:00:00Z',
  targetRoles: ['staff', 'admin']
},
{
  id: 'a5_staff',
  facilityId: 'fac1',
  branchId: 'b1',
  title: 'New Task Assigned',
  message: 'You have been assigned a new task: Physical Therapy Assist.',
  severity: 'Info',
  status: 'Unread',
  date: '2026-04-08T08:00:00Z',
  targetRoles: ['staff']
}];


// ─── Tasks ───
export const mockTasks: Task[] = [
{
  id: 't1',
  residentId: 'r1',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Administer Morning Meds',
  description: 'Lisinopril 10mg, Metformin 500mg',
  category: 'Medication',
  status: 'Todo',
  dueDate: '2026-04-08T09:00:00Z',
  assignedTo: 'u4',
  createdBy: 'u3'
},
{
  id: 't2',
  residentId: 'r2',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Physical Therapy Assist',
  description: 'Assist Arthur with walking exercises in the courtyard.',
  category: 'Therapy',
  status: 'In Progress',
  dueDate: '2026-04-08T11:00:00Z',
  assignedTo: 'u4',
  createdBy: 'u3'
},
{
  id: 't3',
  residentId: 'r1',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Check Blood Sugar',
  description: 'Post-lunch blood sugar check required.',
  category: 'Vitals',
  status: 'Todo',
  dueDate: '2026-04-08T13:30:00Z',
  assignedTo: 'u4',
  createdBy: 'System'
},
{
  id: 't4',
  residentId: 'r3',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Follow up on Hospital Transfer',
  description: 'Call General Hospital for an update on Betty White.',
  category: 'General',
  status: 'Done',
  dueDate: '2026-04-06T10:00:00Z',
  assignedTo: 'u3',
  createdBy: 'u3'
},
{
  id: 't5',
  residentId: 'r2',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Evening Meds',
  description: 'Donepezil 5mg',
  category: 'Medication',
  status: 'Todo',
  dueDate: '2026-04-08T20:00:00Z',
  assignedTo: 'u4',
  createdBy: 'System'
},
{
  id: 't6',
  residentId: 'r1',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Morning Bath Assist',
  description: 'Assist Eleanor with morning bathing routine.',
  category: 'Bathing',
  status: 'Done',
  dueDate: '2026-04-08T07:00:00Z',
  assignedTo: 'u4',
  createdBy: 'u3'
},
{
  id: 't7',
  residentId: 'r1',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Lunch Meal Assist',
  description: 'Ensure low sodium diet is followed. Monitor intake.',
  category: 'Meal',
  status: 'Todo',
  dueDate: '2026-04-08T12:00:00Z',
  assignedTo: 'u4',
  createdBy: 'u3'
},
{
  id: 't8',
  residentId: 'r2',
  branchId: 'b1',
  facilityId: 'fac1',
  title: 'Behavioral Observation',
  description:
  'Monitor Arthur for signs of confusion or agitation during afternoon.',
  category: 'Observation',
  status: 'Todo',
  dueDate: '2026-04-08T15:00:00Z',
  assignedTo: 'u4',
  createdBy: 'u3'
}];


// ─── Rules (Oron Platform Owner Only) ───
export const mockRules: Rule[] = [
{
  id: 'rule1',
  name: 'Systolic Blood Pressure',
  vitalType: 'systolicBP',
  category: 'Vitals',
  thresholds: {
    normalMin: 90,
    normalMax: 140,
    lowThreshold: 90,
    highThreshold: 140,
    criticalLow: 80,
    criticalHigh: 180,
    unit: 'mmHg'
  },
  isActive: true,
  description:
  'Monitors systolic blood pressure. Alerts generated when readings fall outside normal range.'
},
{
  id: 'rule2',
  name: 'Diastolic Blood Pressure',
  vitalType: 'diastolicBP',
  category: 'Vitals',
  thresholds: {
    normalMin: 60,
    normalMax: 90,
    lowThreshold: 60,
    highThreshold: 90,
    criticalLow: 50,
    criticalHigh: 110,
    unit: 'mmHg'
  },
  isActive: true,
  description:
  'Monitors diastolic blood pressure. Alerts generated when readings fall outside normal range.'
},
{
  id: 'rule3',
  name: 'Heart Rate',
  vitalType: 'heartRate',
  category: 'Vitals',
  thresholds: {
    normalMin: 60,
    normalMax: 100,
    lowThreshold: 50,
    highThreshold: 100,
    criticalLow: 40,
    criticalHigh: 130,
    unit: 'bpm'
  },
  isActive: true,
  description:
  'Monitors resting heart rate. Critical alerts for extreme values.'
},
{
  id: 'rule4',
  name: 'Oxygen Saturation (SpO2)',
  vitalType: 'oxygenSaturation',
  category: 'Vitals',
  thresholds: {
    normalMin: 95,
    normalMax: 100,
    lowThreshold: 92,
    highThreshold: 100,
    criticalLow: 88,
    criticalHigh: 100,
    unit: '%'
  },
  isActive: true,
  description: 'Monitors blood oxygen levels. Critical alert below 88%.'
},
{
  id: 'rule5',
  name: 'Temperature',
  vitalType: 'temperature',
  category: 'Vitals',
  thresholds: {
    normalMin: 97,
    normalMax: 99,
    lowThreshold: 96,
    highThreshold: 100.4,
    criticalLow: 95,
    criticalHigh: 103,
    unit: '°F'
  },
  isActive: true,
  description: 'Monitors body temperature. Alerts for fever or hypothermia.'
},
{
  id: 'rule6',
  name: 'Blood Glucose',
  vitalType: 'bloodSugar',
  category: 'Vitals',
  thresholds: {
    normalMin: 70,
    normalMax: 140,
    lowThreshold: 70,
    highThreshold: 180,
    criticalLow: 60,
    criticalHigh: 250,
    unit: 'mg/dL'
  },
  isActive: true,
  description:
  'Monitors blood glucose levels. Critical alerts for hypo/hyperglycemia.'
}];


// ─── Care Plans ───
// ─── Care Plans ───
export const mockCarePlans: CarePlan[] = [
  {
    id: 'cp1',
    residentId: 'r1',
    branchId: 'b1',
    generatedDate: '2026-03-01T00:00:00Z',
    reviewDate: '2026-06-01T00:00:00Z',
    // New Metadata Fields
    version: '1.2',
    lastReviewDate: '2026-03-01T00:00:00Z',
    nextReviewDate: '2026-06-01T00:00:00Z',
    author: 'Dr. Sarah Johnson',
    signed: true,
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        schedule: 'Morning',
        status: 'Active'
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        schedule: 'Morning, Evening',
        status: 'Active'
      },
      {
        name: 'Aspirin',
        dosage: '81mg',
        schedule: 'Morning',
        status: 'Active'
      }
    ],
    actions: [
      'Monitor blood pressure daily',
      'Check blood sugar before meals',
      'Encourage 30 mins light activity',
      'Low sodium diet adherence',
      'Weekly weight check'
    ]
  },
  {
    id: 'cp2',
    residentId: 'r2',
    branchId: 'b1',
    generatedDate: '2026-02-15T00:00:00Z',
    reviewDate: '2026-05-15T00:00:00Z',
    // New Metadata Fields
    version: '2.0',
    lastReviewDate: '2025-11-15T00:00:00Z',
    nextReviewDate: '2026-05-15T00:00:00Z',
    author: 'Nurse Michael Chen',
    signed: true,
    medications: [
      {
        name: 'Donepezil',
        dosage: '5mg',
        schedule: 'Evening',
        status: 'Active'
      },
      {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        schedule: 'Morning',
        status: 'Active'
      }
    ],
    actions: [
      'Assist with daily walking',
      'Monitor for confusion or agitation',
      'Ensure clear pathways in room to prevent falls',
      'Cognitive stimulation activities daily'
    ]
  },
  {
    id: 'cp3',
    residentId: 'r3',
    branchId: 'b1',
    generatedDate: '2026-01-10T00:00:00Z',
    reviewDate: '2026-04-10T00:00:00Z',
    // New Metadata Fields
    version: '1.0',
    lastReviewDate: '2026-01-10T00:00:00Z',
    nextReviewDate: '2026-04-10T00:00:00Z',
    author: 'Dr. Emily White',
    signed: false, // Pending signature
    medications: [
      {
        name: 'Alendronate',
        dosage: '70mg',
        schedule: 'Weekly',
        status: 'Active'
      },
      {
        name: 'Calcium',
        dosage: '600mg',
        schedule: 'Twice Daily',
        status: 'Active'
      },
      {
        name: 'Acetaminophen',
        dosage: '500mg',
        schedule: 'As needed',
        status: 'Active'
      }
    ],
    actions: [
      'Assist with transfers',
      'Monitor pain levels',
      'Coordinate with physical therapy',
      'Fall prevention protocol'
    ]
  }
];


// ─── Staff Members ───
export const mockStaffMembers: StaffMember[] = [
{
  id: 'sm1',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'Emma',
  middleName: 'R.',
  lastName: 'Wilson',
  email: 'staff@sunrise-downtown.com',
  role: 'Caregiver',
  status: 'Active',
  lastActive: '2026-04-08T10:30:00Z',
  permissions: ['View Residents', 'Edit Vitals', 'Manage Tasks']
},
{
  id: 'sm2',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'James',
  lastName: 'Rodriguez',
  email: 'jrodriguez@sunrise-downtown.com',
  role: 'Nurse',
  status: 'Active',
  lastActive: '2026-04-08T09:15:00Z',
  permissions: [
  'View Residents',
  'Edit Vitals',
  'Manage Care Plans',
  'Manage Tasks']

},
{
  id: 'sm3',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'Linda',
  lastName: 'Chen',
  email: 'lchen@sunrise-downtown.com',
  role: 'Coordinator',
  status: 'Active',
  lastActive: '2026-04-07T16:45:00Z',
  permissions: ['View Residents', 'View Reports', 'Manage Tasks']
},
{
  id: 'sm4',
  branchId: 'b1',
  facilityId: 'fac1',
  firstName: 'Robert',
  lastName: 'Taylor',
  email: 'rtaylor@sunrise-downtown.com',
  role: 'Caregiver',
  status: 'Inactive',
  lastActive: '2026-03-15T11:20:00Z',
  permissions: ['View Residents', 'Edit Vitals', 'Manage Tasks']
},
{
  id: 'sm5',
  branchId: 'b2',
  facilityId: 'fac1',
  firstName: 'Patricia',
  lastName: 'Gomez',
  email: 'pgomez@sunrise-westside.com',
  role: 'Nurse',
  status: 'Active',
  lastActive: '2026-04-08T08:00:00Z',
  permissions: [
  'View Residents',
  'Edit Vitals',
  'Manage Care Plans',
  'Manage Tasks']

}];


// ─── Audit Logs ───
export const mockAuditLogs: AuditLog[] = [
{
  id: 'al1',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-08T08:30:00Z',
  user: 'Emma R. Wilson',
  action: 'Vitals Recorded',
  details: 'Recorded vitals for Eleanor M. Roosevelt',
  ipAddress: '192.168.1.105'
},
{
  id: 'al2',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-08T08:15:00Z',
  user: 'Michael Chang',
  action: 'Login',
  details: 'Successful login to Sunrise Downtown branch',
  ipAddress: '192.168.1.101'
},
{
  id: 'al3',
  timestamp: '2026-04-07T14:20:00Z',
  user: 'Sarah A. Jenkins',
  action: 'Rule Modified',
  details: 'Updated threshold for Systolic Blood Pressure rule',
  ipAddress: '10.0.0.50'
},
{
  id: 'al4',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-07T10:00:00Z',
  user: 'James Rodriguez',
  action: 'Care Plan Updated',
  details: 'Updated care plan for Arthur Pendragon',
  ipAddress: '192.168.1.110'
},
{
  id: 'al5',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-06T09:30:00Z',
  user: 'Michael Chang',
  action: 'Staff Created',
  details: 'Created account for Linda Chen',
  ipAddress: '192.168.1.101'
},
{
  id: 'al6',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-05T15:45:00Z',
  user: 'Emma R. Wilson',
  action: 'Alert Resolved',
  details: 'Resolved Hospital Transfer alert for Betty White',
  ipAddress: '192.168.1.105'
},
{
  id: 'al7',
  facilityId: 'fac1',
  timestamp: '2026-04-05T12:00:00Z',
  user: 'David Miller',
  action: 'Branch Reviewed',
  details: 'Reviewed Sunrise Westside branch performance',
  ipAddress: '192.168.1.200'
},
{
  id: 'al8',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-04T11:15:00Z',
  user: 'Michael Chang',
  action: 'Resident Added',
  details: 'Added new resident Arthur Pendragon',
  ipAddress: '192.168.1.101'
},
{
  id: 'al9',
  timestamp: '2026-04-03T08:00:00Z',
  user: 'Sarah A. Jenkins',
  action: 'Contract Viewed',
  details: 'Viewed contract for Sunrise Senior Care',
  ipAddress: '10.0.0.50'
},
{
  id: 'al10',
  facilityId: 'fac1',
  branchId: 'b1',
  timestamp: '2026-04-02T16:30:00Z',
  user: 'Michael Chang',
  action: 'Report Exported',
  details: 'Exported Monthly Vitals Report for Sunrise Downtown',
  ipAddress: '192.168.1.101'
}];


// ─── Notes ───
export const mockNotes: Note[] = [
{
  id: 'n1',
  residentId: 'r1',
  author: 'Emma R. Wilson',
  content:
  'Eleanor was in good spirits this morning. Ate full breakfast. Low sodium diet followed.',
  timestamp: '2026-04-08T08:45:00Z',
  type: 'Observation'
},
{
  id: 'n2',
  residentId: 'r1',
  author: 'James Rodriguez',
  content:
  'Complained of mild headache. Monitored BP, slightly elevated at 142/92. Physician notified.',
  timestamp: '2026-04-07T14:30:00Z',
  type: 'Clinical'
},
{
  id: 'n3',
  residentId: 'r2',
  author: 'Emma R. Wilson',
  content:
  'Arthur seemed confused during morning walk. Redirected back to room. No agitation.',
  timestamp: '2026-04-08T09:30:00Z',
  type: 'Observation'
},
{
  id: 'n4',
  residentId: 'r3',
  author: 'James Rodriguez',
  content:
  'Betty transferred to hospital after fall in bathroom. SpO2 was 91%. Family notified.',
  timestamp: '2026-04-05T15:00:00Z',
  type: 'Clinical'
},
{
  id: 'n5',
  residentId: 'r1',
  author: 'Michael Chang',
  content:
  "Reviewed Eleanor's care plan with family. They are satisfied with current approach. Discussed blood sugar management.",
  timestamp: '2026-04-06T11:00:00Z',
  type: 'General'
}];

// mockData.ts - add this array
export const mockClinicalAssessments = [
  {
    residentId: 'r1',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Sulfa'],
    adlScores: {
      bathing: 'Moderate assist',
      dressing: 'Independent',
      toileting: 'Independent',
      eating: 'Supervision',
      transferring: 'Moderate assist',
      continence: 'Continent',
    },
    mobility: 'Walks with cane',
    cognitive: 'Mild cognitive impairment',
  },
  {
    residentId: 'r2',
    conditions: ['Alzheimer’s', 'Osteoarthritis'],
    allergies: ['None'],
    adlScores: {
      bathing: 'Total assist',
      dressing: 'Moderate assist',
      toileting: 'Moderate assist',
      eating: 'Supervision',
      transferring: 'Total assist',
      continence: 'Occasional accidents',
    },
    mobility: 'Wheelchair dependent',
    cognitive: 'Moderate to severe impairment',
  },
  {
    residentId: 'r3',
    conditions: ['Osteoporosis', 'Chronic Pain'],
    medications: [
      { name: 'Alendronate', dose: '70mg', schedule: 'Weekly' },
      { name: 'Calcium', dose: '600mg', schedule: 'Twice daily' },
    ],
    allergies: ['Codeine'],
    adlScores: {
      bathing: 'Supervision',
      dressing: 'Independent',
      toileting: 'Independent',
      eating: 'Independent',
      transferring: 'Moderate assist',
      continence: 'Continent',
    },
    mobility: 'Uses walker',
    cognitive: 'Intact',
  },
];

// mockData.ts
export const mockRiskProfiles = [
  {
    residentId: 'r1',
    fallRiskScore: 68,                 // out of 100
    mobilityTrend: 'Declining',
    nearFallEvents: 2,
    vitalsTrend: 'Stable',
    narrativeInterpretation: 'Recent decline in mobility and two near‑falls increase fall risk. Recommend PT evaluation.',
  },
  {
    residentId: 'r2',
    fallRiskScore: 85,
    mobilityTrend: 'Consistently low',
    nearFallEvents: 0,
    vitalsTrend: 'N/A',
    narrativeInterpretation: 'High fall risk due to cognitive decline and wheelchair dependency. Ensure bed alarms and hourly rounding.',
  },
  {
    residentId: 'r3',
    fallRiskScore: 42,
    mobilityTrend: 'Improving',
    nearFallEvents: 1,
    vitalsTrend: 'Stable',
    narrativeInterpretation: 'Moderate risk. Pain management and walker use need reinforcement.',
  },
];


// mockData.ts
export const mockGoals = [
  {
    id: 'g1',
    residentId: 'r1',
    description: 'Reduce blood pressure to below 130/80 mmHg',
    targetMetric: 'BP < 130/80',
    timeframe: '3 months',
    responsibleRole: 'Nurse',
    status: 'Active',
  },
  {
    id: 'g2',
    residentId: 'r1',
    description: 'Increase walking distance to 100 meters without rest',
    targetMetric: '100 meters',
    timeframe: '6 weeks',
    responsibleRole: 'Physiotherapist',
    status: 'Active',
  },
  {
    id: 'g3',
    residentId: 'r2',
    description: 'Reduce frequency of agitation episodes by 50%',
    targetMetric: 'Agitation < 3x/week',
    timeframe: '2 months',
    responsibleRole: 'Memory Care Specialist',
    status: 'Active',
  },
  {
    id: 'g4',
    residentId: 'r3',
    description: 'Maintain pain level at ≤ 3 out of 10',
    targetMetric: 'Pain score ≤ 3',
    timeframe: 'Ongoing',
    responsibleRole: 'Nurse',
    status: 'Active',
  },
];


// mockData.ts
export const mockInterventions = [
  {
    id: 'i1',
    residentId: 'r1',
    description: 'Monitor blood pressure twice daily',
    responsibleStaffRole: 'Nurse',
    frequency: 'Twice daily',
    triggerConditions: 'If BP > 140/90, notify provider',
    effectivenessMetric: 'BP below 130/80 for 1 week',
  },
  {
    id: 'i2',
    residentId: 'r1',
    description: 'Physical therapy 3x per week',
    responsibleStaffRole: 'Physiotherapist',
    frequency: '3 times per week',
    triggerConditions: 'N/A',
    effectivenessMetric: 'Walk 100m without rest',
  },
  {
    id: 'i3',
    residentId: 'r2',
    description: 'Bed alarm and hourly rounding',
    responsibleStaffRole: 'Caregiver',
    frequency: 'Every hour',
    triggerConditions: 'If resident attempts to get up alone',
    effectivenessMetric: 'Zero falls',
  },
  {
    id: 'i4',
    residentId: 'r3',
    description: 'Administer pain medication before PT session',
    responsibleStaffRole: 'Nurse',
    frequency: 'Before PT (3x/week)',
    triggerConditions: 'Pain score > 3',
    effectivenessMetric: 'Pain score ≤ 3 during PT',
  },
];

// mockData.ts
export const mockPreferences = [
  {
    residentId: 'r1',
    sleepPattern: '10:00 PM – 6:00 AM',
    mealPref: 'Vegetarian, low salt',
    communication: 'Prefers written notes, hard of hearing',
    socialPref: 'Likes group bingo and gardening',
    familyEngagement: 'Daughter visits every Sunday',
    isNA: false,
  },
  {
    residentId: 'r2',
    sleepPattern: 'Frequent night awakenings, naps during day',
    mealPref: 'Soft diet, needs feeding assistance',
    communication: 'Responds to gentle tone, music therapy',
    socialPref: 'Enjoys one‑on‑one conversation, dislikes loud groups',
    familyEngagement: 'Wife calls daily',
    isNA: false,
  },
  {
    residentId: 'r3',
    sleepPattern: 'Sleeps 9 PM – 7 AM',
    mealPref: 'No restrictions, enjoys coffee',
    communication: 'Clear speech, uses hearing aid',
    socialPref: 'Likes card games and movie nights',
    familyEngagement: 'Son visits every weekend',
    isNA: false,
  },
];
