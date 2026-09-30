import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Badge } from '../UI';
import type { CarePlan, Medication, Resident } from '../../types';
import { carePlanService } from '../../services/carePlanService';

type Props = {
  resident: Resident;
  facilityName?: string;
  branchName?: string;
  mode?: 'create' | 'edit';
  carePlan?: CarePlan;
  onCancel?: () => void;
  onSaved?: (carePlan: CarePlan) => void;
};

const toDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateInputToIso = (value: string) => {
  // value is YYYY-MM-DD from <input type="date">
  // backend expects ISO date string
  return new Date(`${value}T00:00:00.000Z`).toISOString();
};

const isoToDateInputValue = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return toDateInputValue(d);
};

const MEDICATION_SCHEDULE_OPTIONS = [
  'Before meal',
  'After meal',
  'With meal',
  'At bedtime',
  'Every morning',
  'Twice daily',
  'As needed',
] as const;

const scheduleSelectClass =
  'block w-full rounded-lg border border-slate-300 text-slate-900 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-3 py-2 bg-white shadow-sm transition-colors';

const scheduleOptionsForValue = (current: string) => {
  if (current && !MEDICATION_SCHEDULE_OPTIONS.includes(current as (typeof MEDICATION_SCHEDULE_OPTIONS)[number])) {
    return [current, ...MEDICATION_SCHEDULE_OPTIONS];
  }
  return [...MEDICATION_SCHEDULE_OPTIONS];
};

export const CarePlanCreateSection = ({
  resident,
  facilityName,
  branchName,
  carePlan,
  mode = 'create',
  onCancel,
  onSaved,
}: Props) => {
  const today = useMemo(() => new Date(), []);
  const defaultGenerated = useMemo(() => toDateInputValue(today), [today]);
  const defaultReview = useMemo(() => {
    const next = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return toDateInputValue(next);
  }, [today]);

  const [version, setVersion] = useState(() => (mode === 'edit' ? carePlan?.version || '1.0' : '1.0'));
  const [generatedDate, setGeneratedDate] = useState(() =>
    mode === 'edit' ? isoToDateInputValue(carePlan?.generatedDate) || defaultGenerated : defaultGenerated,
  );
  const [reviewDate, setReviewDate] = useState(() =>
    mode === 'edit' ? isoToDateInputValue(carePlan?.reviewDate) || defaultReview : defaultReview,
  );
  const [lastReviewDate, setLastReviewDate] = useState(() =>
    mode === 'edit' ? isoToDateInputValue(carePlan?.lastReviewDate) || defaultGenerated : defaultGenerated,
  );
  const [nextReviewDate, setNextReviewDate] = useState(() =>
    mode === 'edit' ? isoToDateInputValue(carePlan?.nextReviewDate) || defaultReview : defaultReview,
  );
  const [medications, setMedications] = useState<Medication[]>(() =>
    mode === 'edit' ? (carePlan?.medications ?? []) : [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emptyMedication = (): Medication => ({
    name: '',
    dosage: '',
    schedule: '',
    status: 'Active',
  });

  const addMedication = () => {
    setMedications((prev) => [...prev, emptyMedication()]);
  };

  const insertMedicationAfter = (idx: number) => {
    setMedications((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, emptyMedication());
      return next;
    });
  };

  const updateMedication = (idx: number, patch: Partial<Medication>) => {
    setMedications((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const removeMedication = (idx: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!version.trim()) {
      setFormError('Version is required');
      return;
    }
    if (!generatedDate || !reviewDate || !lastReviewDate || !nextReviewDate) {
      setFormError('All dates are required');
      return;
    }

    const sanitizedMeds = medications
      .map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        schedule: m.schedule.trim(),
        status: m.status?.trim() || 'Active',
      }))
      .filter((m) => m.name || m.dosage || m.schedule);

    // Validate partial medication rows
    const hasInvalidMedication = sanitizedMeds.some((m) => !m.name || !m.dosage || !m.schedule);
    if (hasInvalidMedication) {
      setFormError('Each medication must have name, dosage, and schedule (or remove the row).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit') {
        if (!carePlan?.id) {
          setFormError('Missing care plan id');
          return;
        }
        const updated = await carePlanService.updateCarePlan(carePlan.id, {
          generatedDate: dateInputToIso(generatedDate),
          reviewDate: dateInputToIso(reviewDate),
          version: version.trim(),
          lastReviewDate: dateInputToIso(lastReviewDate),
          nextReviewDate: dateInputToIso(nextReviewDate),
          medications: sanitizedMeds,
        });
        onSaved?.(updated);
        return;
      }

      const created = await carePlanService.createCarePlan({
        residentId: resident.id,
        branchId: resident.branchId, // must match resident branch (backend validation)
        generatedDate: dateInputToIso(generatedDate),
        reviewDate: dateInputToIso(reviewDate),
        version: version.trim(),
        lastReviewDate: dateInputToIso(lastReviewDate),
        nextReviewDate: dateInputToIso(nextReviewDate),
        signed: false,
        medications: sanitizedMeds,
      });
      onSaved?.(created);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : mode === 'edit' ? 'Failed to update care plan' : 'Failed to create care plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-brand-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === 'edit' ? 'Edit Care Plan' : 'Create Care Plan'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill out the fields manually. The <span className="font-medium">Author</span> will be set automatically to
            the logged-in user when saved.
          </p>
        </div>
        <Badge variant="info" className="shrink-0">
          Draft
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input label="Facility" value={facilityName || resident.facilityId} disabled />
        <Input label="Branch" value={branchName || resident.branchId} disabled />
        <Input label="Version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 1.0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Generated Date" type="date" value={generatedDate} onChange={(e) => setGeneratedDate(e.target.value)} />
        <Input label="Review Date" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
        <Input label="Last Review Date" type="date" value={lastReviewDate} onChange={(e) => setLastReviewDate(e.target.value)} />
        <Input label="Next Review Date" type="date" value={nextReviewDate} onChange={(e) => setNextReviewDate(e.target.value)} />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Medications</h3>
          <Button type="button" size="sm" variant="outline" onClick={addMedication}>
            Add medication
          </Button>
        </div>

        {medications.length === 0 ? (
          <p className="text-sm text-slate-500">No medications added.</p>
        ) : (
          <div className="space-y-3">
            {medications.map((m, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 p-3 rounded-lg border border-slate-200 items-end"
              >
                <Input
                  label="Name"
                  value={m.name}
                  onChange={(e) => updateMedication(idx, { name: e.target.value })}
                  placeholder="e.g. Metformin"
                />
                <Input
                  label="Dosage"
                  value={m.dosage}
                  onChange={(e) => updateMedication(idx, { dosage: e.target.value })}
                  placeholder="e.g. 500mg"
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Schedule</label>
                  <select
                    className={scheduleSelectClass}
                    value={m.schedule}
                    onChange={(e) => updateMedication(idx, { schedule: e.target.value })}
                  >
                    <option value="">Select schedule</option>
                    {scheduleOptionsForValue(m.schedule).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 text-slate-900 focus:ring-brand-500 focus:border-brand-500 sm:text-sm px-3 py-2 bg-white shadow-sm transition-colors"
                    value={m.status}
                    onChange={(e) => updateMedication(idx, { status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => insertMedicationAfter(idx)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    aria-label="Add medication after this row"
                    title="Add medication below"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMedication(idx)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    aria-label="Remove this medication"
                    title="Remove medication"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formError && <p className="text-sm text-red-600 mt-4">{formError}</p>}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
          {mode === 'edit' ? 'Update Care Plan' : 'Save Care Plan'}
        </Button>
      </div>
    </Card>
  );
};

