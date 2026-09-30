import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../UI';
import { Activity, Edit2, Trash2, Plus } from 'lucide-react';
import type { Intervention } from '../../types';
import { interventionsService } from '../../services/interventionsService';

type Props = {
  residentId: string;
  canManage: boolean;
  /** If false, component will render nothing (parent shows a button first). */
  isVisible?: boolean;
  /** When there are no rows, open an initial editable row. */
  startEditing?: boolean;
  onExistsChange?: (exists: boolean) => void;
};

const emptyDraft = {
  description: '',
  responsibleStaffRole: '',
  frequency: '',
  triggerConditions: '',
  effectivenessMetric: '',
};

export const PlannedInterventions = ({
  residentId,
  canManage,
  isVisible = true,
  startEditing = false,
  onExistsChange,
}: Props) => {
  if (!residentId) return null;

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyDraft);
  const [creatingNew, setCreatingNew] = useState(false);

  const exists = interventions.length > 0;

  useEffect(() => {
    onExistsChange?.(exists);
  }, [exists, onExistsChange]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await interventionsService.getByResident(residentId);
      setInterventions(rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load interventions');
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    if (!canManage) return;
    if (!startEditing) return;
    if (interventions.length > 0) return;
    if (creatingNew || editingId) return;
    setCreatingNew(true);
    setEditForm({
      description: 'New intervention',
      responsibleStaffRole: 'Nurse',
      frequency: 'Daily',
      triggerConditions: 'N/A',
      effectivenessMetric: 'TBD',
    });
  }, [canManage, creatingNew, editingId, interventions.length, isVisible, startEditing]);

  const startEdit = (item: Intervention) => {
    if (!canManage) return;
    setCreatingNew(false);
    setEditingId(item.id);
    setEditForm({
      description: item.description ?? '',
      responsibleStaffRole: item.responsibleStaffRole ?? '',
      frequency: item.frequency ?? '',
      triggerConditions: item.triggerConditions ?? '',
      effectivenessMetric: item.effectivenessMetric ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCreatingNew(false);
    setEditForm(emptyDraft);
  };

  const saveEdit = async (id: string) => {
    if (!canManage) return;
    setMutating(true);
    setError(null);
    try {
      const updated = await interventionsService.update(id, { ...editForm });
      setInterventions((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setEditingId(null);
      setEditForm(emptyDraft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update intervention');
    } finally {
      setMutating(false);
    }
  };

  const deleteIntervention = async (id: string) => {
    if (!canManage) return;
    if (!confirm('Delete this intervention?')) return;
    setMutating(true);
    setError(null);
    try {
      await interventionsService.remove(id);
      setInterventions((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete intervention');
    } finally {
      setMutating(false);
    }
  };

  const addNewIntervention = () => {
    if (!canManage) return;
    setEditingId(null);
    setCreatingNew(true);
    setEditForm({
      description: 'New intervention',
      responsibleStaffRole: 'Nurse',
      frequency: 'Daily',
      triggerConditions: 'N/A',
      effectivenessMetric: 'TBD',
    });
  };

  const createIntervention = async () => {
    if (!canManage) return;
    setMutating(true);
    setError(null);
    try {
      const created = await interventionsService.create({
        residentId,
        description: editForm.description,
        responsibleStaffRole: editForm.responsibleStaffRole,
        frequency: editForm.frequency,
        triggerConditions: editForm.triggerConditions,
        effectivenessMetric: editForm.effectivenessMetric,
      });
      setInterventions((prev) => [created, ...prev]);
      setCreatingNew(false);
      setEditForm(emptyDraft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create intervention');
    } finally {
      setMutating(false);
    }
  };

  const canEdit = canManage && isVisible;
  const showToolbar = isVisible && (canManage || interventions.length > 0);
  const titleBadge = useMemo(() => {
    if (loading) return 'Loading';
    if (interventions.length === 0) return 'Not created';
    return 'Saved';
  }, [interventions.length, loading]);

  if (!isVisible) return null;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-500" />
          Planned Interventions
        </h2>
        {showToolbar && (
          <div className="flex items-center gap-2">
            <Badge variant={interventions.length > 0 ? 'success' : 'warning'} className="text-xs">
              {titleBadge}
            </Badge>
            {canManage && (
              <Button size="sm" icon={Plus} onClick={addNewIntervention} disabled={mutating}>
                Add Intervention
              </Button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {interventions.length === 0 && !creatingNew ? (
        <p className="text-sm text-slate-500 text-center py-4">No interventions planned yet.</p>
      ) : (
        <div className="space-y-4">
          {creatingNew && (
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Description</label>
                  <input
                    type="text"
                    className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    disabled={!canEdit || mutating}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Responsible Staff</label>
                    <select
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.responsibleStaffRole}
                      onChange={(e) =>
                        setEditForm({ ...editForm, responsibleStaffRole: e.target.value })
                      }
                      disabled={!canEdit || mutating}
                    >
                      <option>Nurse</option>
                      <option>Physiotherapist</option>
                      <option>Memory Care Specialist</option>
                      <option>Caregiver</option>
                      <option>Doctor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Frequency</label>
                    <input
                      type="text"
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.frequency}
                      onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                      disabled={!canEdit || mutating}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Trigger Conditions</label>
                  <input
                    type="text"
                    className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    value={editForm.triggerConditions}
                    onChange={(e) =>
                      setEditForm({ ...editForm, triggerConditions: e.target.value })
                    }
                    disabled={!canEdit || mutating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Effectiveness Metric</label>
                  <input
                    type="text"
                    className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    value={editForm.effectivenessMetric}
                    onChange={(e) =>
                      setEditForm({ ...editForm, effectivenessMetric: e.target.value })
                    }
                    disabled={!canEdit || mutating}
                  />
                </div>
                {canEdit && (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={cancelEdit} disabled={mutating}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={createIntervention} disabled={mutating}>
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {interventions.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Description</label>
                    <input
                      type="text"
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      disabled={!canEdit || mutating}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500">
                        Responsible Staff
                      </label>
                      <select
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.responsibleStaffRole}
                        onChange={(e) =>
                          setEditForm({ ...editForm, responsibleStaffRole: e.target.value })
                        }
                        disabled={!canEdit || mutating}
                      >
                        <option>Nurse</option>
                        <option>Physiotherapist</option>
                        <option>Memory Care Specialist</option>
                        <option>Caregiver</option>
                        <option>Doctor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Frequency</label>
                      <input
                        type="text"
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.frequency}
                        onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                        disabled={!canEdit || mutating}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      Trigger Conditions
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.triggerConditions}
                      onChange={(e) =>
                        setEditForm({ ...editForm, triggerConditions: e.target.value })
                      }
                      disabled={!canEdit || mutating}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      Effectiveness Metric
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.effectivenessMetric}
                      onChange={(e) =>
                        setEditForm({ ...editForm, effectivenessMetric: e.target.value })
                      }
                      disabled={!canEdit || mutating}
                    />
                  </div>
                  {canEdit && (
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit} disabled={mutating}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(item.id)} disabled={mutating}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-slate-500">Responsible:</span>{' '}
                        <span className="font-medium text-slate-700">{item.responsibleStaffRole}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Frequency:</span>{' '}
                        <span className="font-medium text-slate-700">{item.frequency}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Trigger:</span>{' '}
                        <span className="font-medium text-slate-700">{item.triggerConditions}</span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-slate-500">Effectiveness metric:</span>{' '}
                        <span className="font-medium text-slate-700">{item.effectivenessMetric}</span>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50"
                        disabled={mutating}
                        aria-label="Edit intervention"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteIntervention(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        disabled={mutating}
                        aria-label="Delete intervention"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};