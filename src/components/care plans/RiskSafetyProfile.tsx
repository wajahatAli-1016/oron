import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../UI';
import { ShieldAlert, Edit2, Save, Trash2 } from 'lucide-react';
import type { RiskProfile as RiskProfileType } from '../../types';
import { riskProfileService } from '../../services/riskProfileService';

type Props = {
  residentId: string;
  canManage: boolean;
  /** If false, component will render nothing (parent shows a button first). */
  isVisible?: boolean;
  /** When creating (no existing record), open in edit mode automatically. */
  startEditing?: boolean;
  onExistsChange?: (exists: boolean) => void;
};

const defaultDraft = {
  fallRiskScore: 0,
  mobilityTrend: 'Stable',
  nearFallEvents: 0,
  vitalsTrend: 'Stable',
  narrativeInterpretation: '',
};

export const RiskSafetyProfile = ({
  residentId,
  canManage,
  isVisible = true,
  startEditing = false,
  onExistsChange,
}: Props) => {
  if (!residentId) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<RiskProfileType | null>(null);
  const [draft, setDraft] = useState(defaultDraft);

  const exists = !!profile;

  useEffect(() => {
    if (!isVisible) return;
    if (!canManage) return;
    if (!startEditing) return;
    if (profile) return;
    setIsEditing(true);
  }, [canManage, isVisible, profile, startEditing]);

  useEffect(() => {
    onExistsChange?.(exists);
  }, [exists, onExistsChange]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await riskProfileService.getByResident(residentId);
      const latest = rows[0] ?? null;
      setProfile(latest);
      if (latest) {
        setDraft({
          fallRiskScore: latest.fallRiskScore ?? 0,
          mobilityTrend: latest.mobilityTrend ?? '',
          nearFallEvents: latest.nearFallEvents ?? 0,
          vitalsTrend: latest.vitalsTrend ?? '',
          narrativeInterpretation: latest.narrativeInterpretation ?? '',
        });
      } else {
        setDraft(defaultDraft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load risk profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId, isVisible]);

  const handleSave = async () => {
    if (!canManage) return;
    setMutating(true);
    setError(null);
    try {
      if (!profile) {
        const created = await riskProfileService.create({
          residentId,
          fallRiskScore: draft.fallRiskScore,
          mobilityTrend: draft.mobilityTrend,
          nearFallEvents: draft.nearFallEvents,
          vitalsTrend: draft.vitalsTrend,
          narrativeInterpretation: draft.narrativeInterpretation,
        });
        setProfile(created);
        setIsEditing(false);
        return;
      }

      const updated = await riskProfileService.update(profile.id, {
        fallRiskScore: draft.fallRiskScore,
        mobilityTrend: draft.mobilityTrend,
        nearFallEvents: draft.nearFallEvents,
        vitalsTrend: draft.vitalsTrend,
        narrativeInterpretation: draft.narrativeInterpretation,
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save risk profile');
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !profile) return;
    if (!confirm('Delete this risk & safety profile?')) return;

    setMutating(true);
    setError(null);
    try {
      await riskProfileService.remove(profile.id);
      setProfile(null);
      setDraft(defaultDraft);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete risk profile');
    } finally {
      setMutating(false);
    }
  };

  const canEdit = canManage && isVisible;
  const showToolbar = isVisible && (canManage || profile);
  const titleBadge = useMemo(() => {
    if (loading) return 'Loading';
    if (!profile) return 'Not created';
    return 'Saved';
  }, [loading, profile]);

  if (!isVisible) return null;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-brand-500" />
          Risk & Safety Profile
        </h2>
        {showToolbar && (
          <div className="flex items-center gap-2">
            <Badge variant={profile ? 'success' : 'warning'} className="text-xs">
              {titleBadge}
            </Badge>
            {canManage && profile && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                disabled={mutating}
                title="Delete"
                aria-label="Delete risk profile"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {canManage && (
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="p-1 text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50"
                disabled={mutating}
                title="Edit"
                aria-label="Edit risk profile"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
  
        {/* Fall Risk Score (with visual bar) */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium">Fall Risk Score</p>
          {isEditing && canEdit ? (
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={draft.fallRiskScore}
                onChange={(e) => setDraft({ ...draft, fallRiskScore: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-bold text-slate-800 w-12">{draft.fallRiskScore}</span>
            </div>
          ) : (
            <div className="mt-1">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-brand-500 h-2.5 rounded-full"
                  style={{ width: `${draft.fallRiskScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-700 mt-1">{draft.fallRiskScore} out of 100</p>
            </div>
          )}
        </div>
  
        {/* Mobility Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Mobility Trend</p>
            {isEditing && canEdit ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={draft.mobilityTrend}
                onChange={(e) => setDraft({ ...draft, mobilityTrend: e.target.value })}
              >
                <option>Improving</option>
                <option>Stable</option>
                <option>Declining</option>
                <option>Consistently low</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{draft.mobilityTrend || '—'}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Near‑Fall Events (last 30d)</p>
            {isEditing && canEdit ? (
              <input
                type="number"
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={draft.nearFallEvents}
                onChange={(e) => setDraft({ ...draft, nearFallEvents: parseInt(e.target.value) })}
                min="0"
              />
            ) : (
              <p className="text-sm text-slate-800 mt-1">{draft.nearFallEvents}</p>
            )}
          </div>
        </div>
  
        {/* Vitals Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Vitals Trend</p>
            {isEditing && canEdit ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={draft.vitalsTrend}
                onChange={(e) => setDraft({ ...draft, vitalsTrend: e.target.value })}
              >
                <option>Stable</option>
                <option>Improving</option>
                <option>Declining</option>
                <option>N/A</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{draft.vitalsTrend || '—'}</p>
            )}
          </div>
        </div>
  
        {/* Narrative Interpretation */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium">Narrative Interpretation</p>
          {isEditing && canEdit ? (
            <textarea
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              rows={3}
              value={draft.narrativeInterpretation}
              onChange={(e) => setDraft({ ...draft, narrativeInterpretation: e.target.value })}
              placeholder="Describe risk summary and recommended actions..."
            />
          ) : (
            <p className="text-sm text-slate-700 mt-1">
              {draft.narrativeInterpretation || 'No narrative added yet.'}
            </p>
          )}
        </div>
  
        {/* Save Button (only when editing) */}
        {isEditing && canEdit && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} icon={Save} isLoading={mutating}>
              Save Changes
            </Button>
          </div>
        )}
      </Card>
    );
  };