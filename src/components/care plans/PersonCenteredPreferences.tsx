import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../UI';
import { Heart, Edit2, Save, Trash2 } from 'lucide-react';
import type { Preference } from '../../types';
import { preferencesService } from '../../services/preferencesService';

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
  sleepPattern: '',
  mealPref: '',
  communication: '',
  socialPref: '',
  familyEngagement: '',
  isNA: false,
};

type NaField = 'sleepPattern' | 'mealPref' | 'communication' | 'socialPref' | 'familyEngagement';

export const PersonCenteredPreferences = ({
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

  const [preference, setPreference] = useState<Preference | null>(null);
  const [prefs, setPrefs] = useState(defaultDraft);

  // Track N/A flags per field (if you want per‑field N/A – client spec suggests structured N/A option, but per field is more flexible)
  // We'll implement per‑field N/A toggles to match "each field can be N/A".
  const [naFlags, setNaFlags] = useState({
    sleepPattern: false,
    mealPref: false,
    communication: false,
    socialPref: false,
    familyEngagement: false,
  });

  const exists = !!preference;

  useEffect(() => {
    onExistsChange?.(exists);
  }, [exists, onExistsChange]);

  useEffect(() => {
    if (!isVisible) return;
    if (!canManage) return;
    if (!startEditing) return;
    if (preference) return;
    setIsEditing(true);
  }, [canManage, isVisible, preference, startEditing]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await preferencesService.getByResident(residentId);
      const latest = rows[0] ?? null;
      setPreference(latest);
      if (latest) {
        setPrefs({
          sleepPattern: latest.sleepPattern ?? '',
          mealPref: latest.mealPref ?? '',
          communication: latest.communication ?? '',
          socialPref: latest.socialPref ?? '',
          familyEngagement: latest.familyEngagement ?? '',
          isNA: latest.isNA ?? false,
        });
      } else {
        setPrefs(defaultDraft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId, isVisible]);

  const updateField = (field: string, value: string | boolean) => {
    setPrefs((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNaFlag = (field: NaField) => {
    setNaFlags((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (!canManage) return;
    setMutating(true);
    setError(null);
    try {
      if (!preference) {
        const created = await preferencesService.create({
          residentId,
          sleepPattern: naFlags.sleepPattern ? '' : prefs.sleepPattern,
          mealPref: naFlags.mealPref ? '' : prefs.mealPref,
          communication: naFlags.communication ? '' : prefs.communication,
          socialPref: naFlags.socialPref ? '' : prefs.socialPref,
          familyEngagement: naFlags.familyEngagement ? '' : prefs.familyEngagement,
          isNA: prefs.isNA,
        });
        setPreference(created);
        setIsEditing(false);
        return;
      }

      const updated = await preferencesService.update(preference.id, {
        sleepPattern: naFlags.sleepPattern ? '' : prefs.sleepPattern,
        mealPref: naFlags.mealPref ? '' : prefs.mealPref,
        communication: naFlags.communication ? '' : prefs.communication,
        socialPref: naFlags.socialPref ? '' : prefs.socialPref,
        familyEngagement: naFlags.familyEngagement ? '' : prefs.familyEngagement,
        isNA: prefs.isNA,
      });
      setPreference(updated);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save preferences');
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !preference) return;
    if (!confirm('Delete these preferences?')) return;
    setMutating(true);
    setError(null);
    try {
      await preferencesService.remove(preference.id);
      setPreference(null);
      setPrefs(defaultDraft);
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete preferences');
    } finally {
      setMutating(false);
    }
  };

  const canEdit = canManage && isVisible;
  const showToolbar = isVisible && (canManage || preference);
  const titleBadge = useMemo(() => {
    if (loading) return 'Loading';
    if (!preference) return 'Not created';
    return 'Saved';
  }, [loading, preference]);

  if (!isVisible) return null;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Heart className="h-5 w-5 text-brand-500" />
          Person‑Centered Preferences
        </h2>
        {showToolbar && (
          <div className="flex items-center gap-2">
            <Badge variant={preference ? 'success' : 'warning'} className="text-xs">
              {titleBadge}
            </Badge>
            {canManage && preference && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                disabled={mutating}
                title="Delete"
                aria-label="Delete preferences"
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
                aria-label="Edit preferences"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {/* Sleep Pattern */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Sleep Pattern</p>
          {isEditing && canEdit && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={naFlags.sleepPattern}
                onChange={() => toggleNaFlag('sleepPattern')}
              />
              N/A
            </label>
          )}
        </div>
        {isEditing && canEdit ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.sleepPattern ? '' : prefs.sleepPattern}
            onChange={(e) => updateField('sleepPattern', e.target.value)}
            disabled={naFlags.sleepPattern}
            placeholder={naFlags.sleepPattern ? 'N/A – not applicable' : 'e.g., 10 PM – 6 AM'}
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.sleepPattern ? 'N/A' : prefs.sleepPattern || 'Not specified'}
          </p>
        )}
      </div>

      {/* Meal Preferences */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Meal Preferences</p>
          {isEditing && canEdit && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.mealPref} onChange={() => toggleNaFlag('mealPref')} /> N/A
            </label>
          )}
        </div>
        {isEditing && canEdit ? (
          <select
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.mealPref ? '' : prefs.mealPref}
            onChange={(e) => updateField('mealPref', e.target.value)}
            disabled={naFlags.mealPref}
          >
            <option value="">Select preference</option>
            <option>Vegetarian</option>
            <option>Low salt</option>
            <option>Soft diet</option>
            <option>Diabetic</option>
            <option>No restrictions</option>
          </select>
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.mealPref ? 'N/A' : prefs.mealPref || 'Not specified'}
          </p>
        )}
      </div>

      {/* Communication Needs */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Communication Needs</p>
          {isEditing && canEdit && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.communication} onChange={() => toggleNaFlag('communication')} /> N/A
            </label>
          )}
        </div>
        {isEditing && canEdit ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.communication ? '' : prefs.communication}
            onChange={(e) => updateField('communication', e.target.value)}
            disabled={naFlags.communication}
            placeholder="e.g., hard of hearing, prefers written notes"
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.communication ? 'N/A' : prefs.communication || 'Not specified'}
          </p>
        )}
      </div>

      {/* Social Preferences */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Social Preferences</p>
          {isEditing && canEdit && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.socialPref} onChange={() => toggleNaFlag('socialPref')} /> N/A
            </label>
          )}
        </div>
        {isEditing && canEdit ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.socialPref ? '' : prefs.socialPref}
            onChange={(e) => updateField('socialPref', e.target.value)}
            disabled={naFlags.socialPref}
            placeholder="e.g., likes group bingo, dislikes loud events"
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.socialPref ? 'N/A' : prefs.socialPref || 'Not specified'}
          </p>
        )}
      </div>

      {/* Family Engagement */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Family Engagement Preferences</p>
          {isEditing && canEdit && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.familyEngagement} onChange={() => toggleNaFlag('familyEngagement')} /> N/A
            </label>
          )}
        </div>
        {isEditing && canEdit ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.familyEngagement ? '' : prefs.familyEngagement}
            onChange={(e) => updateField('familyEngagement', e.target.value)}
            disabled={naFlags.familyEngagement}
            placeholder="e.g., daughter visits weekly, prefers phone calls"
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.familyEngagement ? 'N/A' : prefs.familyEngagement || 'Not specified'}
          </p>
        )}
      </div>

      {/* Save Button (only when editing) */}
      {isEditing && canEdit && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} icon={Save} isLoading={mutating}>
            Save Preferences
          </Button>
        </div>
      )}
    </Card>
  );
};