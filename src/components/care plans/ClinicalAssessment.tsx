import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../UI';
import { TagListField } from '../common/TagListField';
import { ClipboardList, Edit2, Save, Trash2 } from 'lucide-react';
import type { ClinicalAssessment as ClinicalAssessmentType } from '../../types';
import { clinicalAssessmentService } from '../../services/clinicalAssessmentService';


type Props = {
  residentId: string;
  canManage: boolean;
  /** If false, component will render nothing (parent shows a button first). */
  isVisible?: boolean;
  /** When creating (no existing record), open in edit mode automatically. */
  startEditing?: boolean;
  onExistsChange?: (exists: boolean) => void;
};

const assessmentSelectClass =
  'w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const defaultDraft = {
  conditions: [] as string[],
  allergies: [] as string[],
  adlScores: {
    bathing: 'Independent',
    dressing: 'Independent',
    toileting: 'Independent',
    eating: 'Independent',
    transferring: 'Independent',
    continence: 'Continent',
  } as Record<string, string>,
  mobility: 'Walks independently',
  cognitive: 'Intact',
};

export const ClinicalAssessment = ({
  residentId,
  canManage,
  isVisible = true,
  startEditing = false,
  onExistsChange,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<ClinicalAssessmentType | null>(null);
  const [draft, setDraft] = useState(defaultDraft);

  const exists = !!assessment;

  useEffect(() => {
    if (!isVisible) return;
    if (!canManage) return;
    if (!startEditing) return;
    if (assessment) return;
    setIsEditing(true);
  }, [assessment, canManage, isVisible, startEditing]);

  useEffect(() => {
    onExistsChange?.(exists);
  }, [exists, onExistsChange]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await clinicalAssessmentService.getByResident(residentId);
      const latest = rows[0] ?? null;
      setAssessment(latest);
      if (latest) {
        setDraft({
          conditions: latest.conditions ?? [],
          allergies: latest.allergies ?? [],
          adlScores: (latest.adlScores ?? {}) as Record<string, string>,
          mobility: latest.mobility ?? '',
          cognitive: latest.cognitive ?? '',
        });
      } else {
        setDraft(defaultDraft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load clinical assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId, isVisible]);
  
    // Helper to update nested fields
    const updateAdlScore = (key: string, value: string) => {
      setDraft(prev => ({
        ...prev,
        adlScores: { ...prev.adlScores, [key]: value },
      }));
    };
  
    const handleSave = async () => {
      if (!canManage) return;
      setMutating(true);
      setError(null);
      try {
        if (!assessment) {
          const created = await clinicalAssessmentService.create({
            residentId,
            conditions: draft.conditions,
            allergies: draft.allergies,
            adlScores: draft.adlScores,
            mobility: draft.mobility,
            cognitive: draft.cognitive,
          });
          setAssessment(created);
          setIsEditing(false);
          return;
        }

        const updated = await clinicalAssessmentService.update(assessment.id, {
          conditions: draft.conditions,
          allergies: draft.allergies,
          adlScores: draft.adlScores,
          mobility: draft.mobility,
          cognitive: draft.cognitive,
        });
        setAssessment(updated);
        setIsEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save clinical assessment');
      } finally {
        setMutating(false);
      }
    };

    const handleDelete = async () => {
      if (!canManage || !assessment) return;
      if (!confirm('Delete this clinical assessment?')) return;

      setMutating(true);
      setError(null);
      try {
        await clinicalAssessmentService.remove(assessment.id);
        setAssessment(null);
        setDraft(defaultDraft);
        setIsEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete clinical assessment');
      } finally {
        setMutating(false);
      }
    };
  
    // ADL options for dropdowns
    const adlOptions = [
      'Independent',
      'Supervision',
      'Moderate assist',
      'Total assist',
    ];
    const continenceOptions = ['Continent', 'Occasional accidents', 'Incontinent'];

    const physicalAdlKeys = [
      'bathing',
      'dressing',
      'toileting',
      'eating',
      'transferring',
      'continence',
    ] as const;

    const mobilityOptions = [
      'Walks independently',
      'Walks with cane',
      'Uses walker',
      'Wheelchair dependent',
      'Bedridden',
    ];

    const cognitiveOptions = [
      'Intact',
      'Mild cognitive impairment',
      'Moderate to severe impairment',
    ];

    const canEdit = canManage && isVisible;
    const showToolbar = isVisible && (canManage || assessment);
    const titleBadge = useMemo(() => {
      if (loading) return 'Loading';
      if (!assessment) return 'Not created';
      return 'Saved';
    }, [assessment, loading]);

    if (!isVisible) return null;
  
    return (
      <Card className="overflow-hidden min-w-0">
        {/* Header – unchanged */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-500" />
            Clinical & Functional Assessment
          </h2>
          {/* Badge and action buttons – unchanged */}
          {showToolbar && (
            <div className="flex items-center gap-2">
              <Badge variant={assessment ? 'success' : 'warning'} className="text-xs">
                {titleBadge}
              </Badge>
              {canManage && assessment && (
                <button onClick={handleDelete} disabled={mutating} className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {canManage && (
                <button onClick={() => setIsEditing(v => !v)} disabled={mutating} className="p-1 text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50">
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
  
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
  
        <div className="space-y-6">
          {/* Group 1: Medical Conditions & Allergies – card‑like row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conditions Card */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Medical Conditions
              </p>
              {isEditing && canEdit ? (
                <TagListField
                  items={draft.conditions}
                  onChange={(conditions) => setDraft({ ...draft, conditions })}
                  placeholder="e.g. Hypertension"
                />
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {draft.conditions.length > 0 ? (
                    draft.conditions.map((c, i) => (
                      <Badge key={i} variant="default" className="bg-white text-slate-700 border-slate-200">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">— None recorded —</span>
                  )}
                </div>
              )}
            </div>

            {/* Allergies Card */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Allergies
              </p>
              {isEditing && canEdit ? (
                <TagListField
                  items={draft.allergies}
                  onChange={(allergies) => setDraft({ ...draft, allergies })}
                  placeholder="e.g. Penicillin"
                  badgeVariant="danger"
                />
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {draft.allergies.length > 0 ? (
                    draft.allergies.map((a, i) => (
                      <Badge key={i} variant="danger" className="bg-red-100 text-red-700 border-red-200">
                        {a}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">— No known allergies —</span>
                  )}
                </div>
              )}
            </div>
          </div>
  
          {/* Functional assessment: ADLs + mobility + cognitive in one balanced card */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm min-w-0 overflow-hidden">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Functional Assessment
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-600 mb-2">Physical ADLs</p>
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
                  {physicalAdlKeys.map((key) => {
                    const val = draft.adlScores[key] ?? '';
                    const options = key === 'continence' ? continenceOptions : adlOptions;
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-[minmax(5.5rem,7rem)_minmax(0,1fr)] gap-2 sm:gap-3 items-center px-3 py-2.5 min-w-0"
                      >
                        <span className="capitalize text-sm font-medium text-slate-700">
                          {key}
                        </span>
                        {isEditing && canEdit ? (
                          <select
                            className={assessmentSelectClass}
                            value={val}
                            onChange={(e) => updateAdlScore(key, e.target.value)}
                          >
                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm font-medium text-slate-800 break-words">
                            {val || '—'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-600 mb-2">Other functional measures</p>
                <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <div className="flex flex-col gap-2 px-3 py-3 min-w-0">
                    <span className="text-sm font-medium text-slate-700">Mobility Status</span>
                    {isEditing && canEdit ? (
                      <select
                        className={assessmentSelectClass}
                        value={draft.mobility}
                        onChange={(e) => setDraft({ ...draft, mobility: e.target.value })}
                      >
                        {mobilityOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm font-medium text-slate-800 break-words">
                        {draft.mobility || '—'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 px-3 py-3 min-w-0">
                    <span className="text-sm font-medium text-slate-700">Cognitive Screening</span>
                    {isEditing && canEdit ? (
                      <select
                        className={assessmentSelectClass}
                        value={draft.cognitive}
                        onChange={(e) => setDraft({ ...draft, cognitive: e.target.value })}
                      >
                        {cognitiveOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm font-medium text-slate-800 break-words">
                        {draft.cognitive || '—'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && canEdit && (
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={handleSave} icon={Save} isLoading={mutating}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };
  