import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../UI';
import { Target, Edit2, Trash2, Plus } from 'lucide-react';
import type { Goal } from '../../types';
import { goalsService } from '../../services/goalsService';
import { staffService } from '../../services/staffService';

const roleSelectClass =
  'w-full min-w-0 mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

type Props = {
  residentId: string;
  branchId?: string;
  canManage: boolean;
  /** If false, component will render nothing (parent shows a button first). */
  isVisible?: boolean;
  /** When there are no rows, open an initial editable row. */
  startEditing?: boolean;
  onExistsChange?: (exists: boolean) => void;
};

const emptyDraft = {
  description: '',
  targetMetric: '',
  timeframe: '',
  responsibleRole: '',
};

export const GoalsOfCare = ({
  residentId,
  branchId,
  canManage,
  isVisible = true,
  startEditing = false,
  onExistsChange,
}: Props) => {
  if (!residentId) return null;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyDraft);
  const [creatingNew, setCreatingNew] = useState(false);
  const [staffRoleOptions, setStaffRoleOptions] = useState<string[]>([
    'Caregiver',
    'Nurse',
    'Coordinator',
  ]);

  const exists = goals.length > 0;

  const responsibleRoleOptions = useMemo(() => {
    const roles = new Set(staffRoleOptions);
    goals.forEach((g) => {
      const label = g.responsibleRole?.trim();
      if (label) roles.add(label);
    });
    const current = editForm.responsibleRole?.trim();
    if (current) roles.add(current);
    return [...roles].sort((a, b) => a.localeCompare(b));
  }, [staffRoleOptions, goals, editForm.responsibleRole]);

  const defaultResponsibleRole = responsibleRoleOptions[0] ?? 'Caregiver';

  useEffect(() => {
    onExistsChange?.(exists);
  }, [exists, onExistsChange]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await goalsService.getByResident(residentId);
      setGoals(rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load goals');
      setGoals([]);
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
    let cancelled = false;
    const loadRoles = async () => {
      try {
        const roles = await staffService.getStaffRoleOptions(
          branchId ? { branchId } : {},
        );
        if (!cancelled && roles.length > 0) setStaffRoleOptions(roles);
      } catch {
        /* keep default role list */
      }
    };
    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, [branchId, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    if (!canManage) return;
    if (!startEditing) return;
    if (goals.length > 0) return;
    if (creatingNew || editingId) return;
    // open an initial create row
    setCreatingNew(true);
    setEditForm({
      description: 'New goal',
      targetMetric: 'TBD',
      timeframe: '1 month',
      responsibleRole: defaultResponsibleRole,
    });
  }, [
    canManage,
    creatingNew,
    defaultResponsibleRole,
    editingId,
    goals.length,
    isVisible,
    startEditing,
  ]);
  
  const startEdit = (goal: Goal) => {
    if (!canManage) return;
    setCreatingNew(false);
    setEditingId(goal.id);
    setEditForm({
      description: goal.description ?? '',
      targetMetric: goal.targetMetric ?? '',
      timeframe: goal.timeframe ?? '',
      responsibleRole: goal.responsibleRole ?? '',
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
      const updated = await goalsService.update(id, {
        description: editForm.description,
        targetMetric: editForm.targetMetric,
        timeframe: editForm.timeframe,
        responsibleRole: editForm.responsibleRole,
      });
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setEditingId(null);
      setEditForm(emptyDraft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update goal');
    } finally {
      setMutating(false);
    }
  };
  
  const deleteGoal = async (id: string) => {
    if (!canManage) return;
    if (!confirm('Delete this goal?')) return;
    setMutating(true);
    setError(null);
    try {
      await goalsService.remove(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete goal');
    } finally {
      setMutating(false);
    }
  };
  
  const addNewGoal = () => {
    if (!canManage) return;
    setEditingId(null);
    setCreatingNew(true);
    setEditForm({
      description: 'New goal',
      targetMetric: 'TBD',
      timeframe: '1 month',
      responsibleRole: defaultResponsibleRole,
    });
  };

  const createGoal = async () => {
    if (!canManage) return;
    setMutating(true);
    setError(null);
    try {
      const created = await goalsService.create({
        residentId,
        description: editForm.description,
        targetMetric: editForm.targetMetric,
        timeframe: editForm.timeframe,
        responsibleRole: editForm.responsibleRole,
        status: 'Active',
      });
      setGoals((prev) => [created, ...prev]);
      setCreatingNew(false);
      setEditForm(emptyDraft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create goal');
    } finally {
      setMutating(false);
    }
  };
  
  const canEdit = canManage && isVisible;
  const showToolbar = isVisible && (canManage || goals.length > 0);
  const titleBadge = useMemo(() => {
    if (loading) return 'Loading';
    if (goals.length === 0) return 'Not created';
    return 'Saved';
  }, [goals.length, loading]);

  if (!isVisible) return null;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-500" />
          Goals of Care
        </h2>
        {showToolbar && (
          <div className="flex items-center gap-2">
            <Badge variant={goals.length > 0 ? 'success' : 'warning'} className="text-xs">
              {titleBadge}
            </Badge>
            {canManage && (
              <Button size="sm" icon={Plus} onClick={addNewGoal} disabled={mutating}>
                Add Goal
              </Button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
  
      {(goals.length === 0 && !creatingNew) ? (
        <p className="text-sm text-slate-500 text-center py-4">No goals defined yet.</p>
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
                    <label className="block text-xs font-medium text-slate-500">Target Metric</label>
                    <input
                      type="text"
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.targetMetric}
                      onChange={(e) => setEditForm({ ...editForm, targetMetric: e.target.value })}
                      disabled={!canEdit || mutating}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Timeframe</label>
                    <input
                      type="text"
                      className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                      value={editForm.timeframe}
                      onChange={(e) => setEditForm({ ...editForm, timeframe: e.target.value })}
                      disabled={!canEdit || mutating}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500">Responsible Staff Role</label>
                  <select
                    className={roleSelectClass}
                    value={editForm.responsibleRole}
                    onChange={(e) => setEditForm({ ...editForm, responsibleRole: e.target.value })}
                    disabled={!canEdit || mutating}
                  >
                    <option value="">Select role</option>
                    {responsibleRoleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                {canEdit && (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit} disabled={mutating}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={createGoal} disabled={mutating}>
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {goals.map((goal) => (
            <div key={goal.id} className="border border-slate-200 rounded-lg p-4">
              {editingId === goal.id ? (
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
                      <label className="block text-xs font-medium text-slate-500">Target Metric</label>
                      <input
                        type="text"
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.targetMetric}
                        onChange={(e) => setEditForm({ ...editForm, targetMetric: e.target.value })}
                        disabled={!canEdit || mutating}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Timeframe</label>
                      <input
                        type="text"
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.timeframe}
                        onChange={(e) => setEditForm({ ...editForm, timeframe: e.target.value })}
                        disabled={!canEdit || mutating}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Responsible Staff Role</label>
                    <select
                      className={roleSelectClass}
                      value={editForm.responsibleRole}
                      onChange={(e) => setEditForm({ ...editForm, responsibleRole: e.target.value })}
                      disabled={!canEdit || mutating}
                    >
                      <option value="">Select role</option>
                      {responsibleRoleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  {canEdit && (
                    <div className="flex justify-end gap-2 mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={cancelEdit} disabled={mutating}>
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={() => saveEdit(goal.id)} disabled={mutating}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{goal.description}</p>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-slate-500">Target:</span>{' '}
                          <span className="font-medium text-slate-700">{goal.targetMetric}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeframe:</span>{' '}
                          <span className="font-medium text-slate-700">{goal.timeframe}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Responsible:</span>{' '}
                          <span className="font-medium text-slate-700">{goal.responsibleRole}</span>
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(goal)}
                          className="p-1 text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50"
                          disabled={mutating}
                          aria-label="Edit goal"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          disabled={mutating}
                          aria-label="Delete goal"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {goal.status && (
                    <div className="mt-2">
                      <Badge variant="success" className="text-xs bg-green-50 text-green-700">
                        {goal.status}
                      </Badge>
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