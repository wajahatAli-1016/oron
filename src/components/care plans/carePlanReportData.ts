import type {
  CarePlan,
  ClinicalAssessment,
  Goal,
  Intervention,
  Preference,
  RiskProfile,
} from '../../types';
import { clinicalAssessmentService } from '../../services/clinicalAssessmentService';
import { riskProfileService } from '../../services/riskProfileService';
import { goalsService } from '../../services/goalsService';
import { interventionsService } from '../../services/interventionsService';
import { preferencesService } from '../../services/preferencesService';

export type CarePlanReportSections = {
  clinical: ClinicalAssessment | null;
  risk: RiskProfile | null;
  goals: Goal[];
  interventions: Intervention[];
  preference: Preference | null;
};

export async function fetchCarePlanReportSections(
  residentId: string,
): Promise<CarePlanReportSections> {
  const [clinicalRows, riskRows, goals, interventions, preferenceRows] = await Promise.all([
    clinicalAssessmentService.getByResident(residentId),
    riskProfileService.getByResident(residentId),
    goalsService.getByResident(residentId),
    interventionsService.getByResident(residentId),
    preferencesService.getByResident(residentId),
  ]);

  return {
    clinical: clinicalRows[0] ?? null,
    risk: riskRows[0] ?? null,
    goals,
    interventions,
    preference: preferenceRows[0] ?? null,
  };
}

export function formatReportDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatReportList(items?: string[] | null): string {
  if (!items?.length) return '—';
  return items.join(', ');
}

export type CarePlanReportContext = {
  residentName: string;
  facilityName: string;
  branchName: string;
  carePlan: CarePlan;
  sections: CarePlanReportSections;
  generatedAt: string;
};
