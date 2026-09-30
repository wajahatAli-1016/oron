import { useEffect, useState } from 'react';
import {
  Settings,
  Activity,
  Edit2,
  Save,
  Info } from
'lucide-react';
import { Card, Button } from '../../components/UI';
import { Rule, RuleThreshold } from '../../types';
import { motion } from 'framer-motion';
import { useGetRulesQuery, useUpdateRuleMutation } from '../../store/api/oronApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { RulesEnginesSkeleton } from '../skeletons/RulesSkeleton';
import { RefreshButton } from '../refresh/Refresh';
export const RulesEngines = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isOwner = user?.role === 'owner';
  const [rules, setRules] = useState<Rule[]>([]);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editThresholds, setEditThresholds] = useState<RuleThreshold | null>(
    null
  );
  const [savingRuleId, setSavingRuleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: rulesData = [], isLoading: loading, isError, error: queryError, refetch, isFetching } =
    useGetRulesQuery();
  const [updateRule] = useUpdateRuleMutation();

  useEffect(() => {
    setRules(rulesData);
  }, [rulesData]);

  useEffect(() => {
    if (isError && queryError) {
      const message = getApiErrorMessage(queryError, 'Failed to load rules');
      setError(message);
      toast.error(message);
    }
  }, [isError, queryError, toast]);
  const toggleRule = async (id: string) => {
    const currentRule = rules.find((rule) => rule.id === id);
    if (!currentRule) return;

    const nextState = !currentRule.isActive;
    setSavingRuleId(id);
    setError(null);

    setRules((prevRules) =>
      prevRules.map((r) => (r.id === id ? { ...r, isActive: nextState } : r)),
    );

    try {
      const updated = await updateRule({ id, body: { isActive: nextState } }).unwrap();
      setRules((prevRules) =>
        prevRules.map((r) => (r.id === id ? updated : r)),
      );
      toast.success(`Rule ${nextState ? 'enabled' : 'disabled'} successfully.`);
    } catch (err) {
      setRules((prevRules) =>
        prevRules.map((r) => (r.id === id ? { ...r, isActive: currentRule.isActive } : r)),
      );
      const message = getApiErrorMessage(err, 'Failed to update rule status');
      setError(message);
      toast.error(message);
    } finally {
      setSavingRuleId(null);
    }
  };
  const startEditing = (rule: Rule) => {
    setEditingRuleId(rule.id);
    setEditThresholds({
      ...rule.thresholds
    });
  };
  const saveEditing = async (id: string) => {
    if (!editThresholds) {
      setEditingRuleId(null);
      setEditThresholds(null);
      return;
    }

    setSavingRuleId(id);
    setError(null);
    try {
      const updated = await updateRule({ id, body: { thresholds: editThresholds } }).unwrap();
      setRules((prevRules) =>
        prevRules.map((r) => (r.id === id ? updated : r)),
      );
      setEditingRuleId(null);
      setEditThresholds(null);
      toast.success('Rule thresholds updated successfully.');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save rule thresholds');
      setError(message);
      toast.error(message);
    } finally {
      setSavingRuleId(null);
    }
  };
  const handleThresholdChange = (field: keyof RuleThreshold, value: number) => {
    if (editThresholds) {
      setEditThresholds({
        ...editThresholds,
        [field]: value
      });
    }
  };
  // Visual gauge component for thresholds
  const ThresholdGauge = ({ rule }: {rule: Rule;}) => {
    const t = rule.thresholds;
    // Calculate percentages for the gauge based on a range that covers all thresholds
    const min = Math.min(0, t.criticalLow - 10);
    const max = t.criticalHigh + t.criticalHigh * 0.2;
    const range = max - min;
    const getPercent = (val: number) => (val - min) / range * 100;
    return (
      <div className="mt-6 mb-2">
        <div className="flex justify-between text-xs text-slate-500 mb-1 px-1">
          <span>{min}</span>
          <span>
            {max} {t.unit}
          </span>
        </div>
        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden flex">
          {/* Critical Low (Red) */}
          <div
            className="h-full bg-red-500"
            style={{
              width: `${getPercent(t.criticalLow)}%`
            }}
            title={`Critical Low: < ${t.criticalLow}`}>
          </div>

          {/* Low Warning (Yellow) */}
          <div
            className="h-full bg-amber-400"
            style={{
              width: `${getPercent(t.lowThreshold) - getPercent(t.criticalLow)}%`
            }}
            title={`Low Warning: ${t.criticalLow} - ${t.lowThreshold}`}>
          </div>

          {/* Normal (Green) */}
          <div
            className="h-full bg-emerald-500"
            style={{
              width: `${getPercent(t.highThreshold) - getPercent(t.lowThreshold)}%`
            }}
            title={`Normal: ${t.normalMin} - ${t.normalMax}`}>
          </div>

          {/* High Warning (Yellow) */}
          <div
            className="h-full bg-amber-400"
            style={{
              width: `${getPercent(t.criticalHigh) - getPercent(t.highThreshold)}%`
            }}
            title={`High Warning: ${t.highThreshold} - ${t.criticalHigh}`}>
          </div>

          {/* Critical High (Red) */}
          <div
            className="h-full bg-red-500"
            style={{
              width: `${100 - getPercent(t.criticalHigh)}%`
            }}
            title={`Critical High: > ${t.criticalHigh}`}>
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> Critical
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div> Warning
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Normal
          </div>
        </div>
      </div>);

  };

  if(loading){
    return <RulesEnginesSkeleton/>
  }
  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">Rules Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure global automated triggers for resident health states and
            alerts.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        
        <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              How Rules Work
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              The Rules Engine evaluates incoming vitals against these
              thresholds to automatically determine a resident's{' '}
              <strong>Health State</strong> and generate appropriate alerts.
            </p>
            <div className="flex items-center gap-2 mt-3 text-sm font-medium text-blue-900 bg-white/50 px-3 py-2 rounded-lg inline-flex">
              <span>Vitals Logged</span>
              <span className="text-blue-400">→</span>
              <span>Rules Evaluated</span>
              <span className="text-blue-400">→</span>
              <span>Health State Updated</span>
              <span className="text-blue-400">→</span>
              <span>Alerts Generated</span>
            </div>
          </div>
        </div>
      </Card>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {!isOwner && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Only platform owner can edit rules. You currently have view-only access.
        </div>
      )}

      {loading && (
        <Card>
          <p className="text-sm text-slate-500">Loading rules...</p>
        </Card>
      )}

      {!loading && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule, idx) =>
        <motion.div
          key={rule.id}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: idx * 0.05
          }}>
          
            <Card
            className={`h-full transition-all duration-200 ${rule.isActive ? 'border-brand-200 shadow-sm' : 'opacity-75 bg-slate-50'}`}>
            
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Activity
                  className={`h-5 w-5 ${rule.isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                
                  <h3
                  className={`font-semibold text-lg ${rule.isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  
                    {rule.name}
                  </h3>
                </div>
                <button
                onClick={() => toggleRule(rule.id)}
                disabled={savingRuleId === rule.id || !isOwner}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${rule.isActive ? 'bg-brand-500' : 'bg-slate-200'}`}>
                
                  <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4">{rule.description}</p>

              {!editingRuleId || editingRuleId !== rule.id ?
            <>
                  <ThresholdGauge rule={rule} />

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit2}
                  disabled={!rule.isActive || savingRuleId === rule.id || !isOwner}
                  onClick={() => startEditing(rule)}>
                  
                      Edit Thresholds
                    </Button>
                  </div>
                </> :

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-medium text-slate-900">
                    Edit Thresholds ({rule.thresholds.unit})
                  </h4>

                  {editThresholds &&
              <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Critical Low (&lt;)
                        </label>
                        <input
                    type="number"
                    value={editThresholds.criticalLow}
                    onChange={(e) =>
                    handleThresholdChange(
                      'criticalLow',
                      Number(e.target.value)
                    )
                    }
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Low Warning (&lt;)
                        </label>
                        <input
                    type="number"
                    value={editThresholds.lowThreshold}
                    onChange={(e) =>
                    handleThresholdChange(
                      'lowThreshold',
                      Number(e.target.value)
                    )
                    }
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500" />
                  
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          High Warning (&gt;)
                        </label>
                        <input
                    type="number"
                    value={editThresholds.highThreshold}
                    onChange={(e) =>
                    handleThresholdChange(
                      'highThreshold',
                      Number(e.target.value)
                    )
                    }
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500" />
                  
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">
                          Critical High (&gt;)
                        </label>
                        <input
                    type="number"
                    value={editThresholds.criticalHigh}
                    onChange={(e) =>
                    handleThresholdChange(
                      'criticalHigh',
                      Number(e.target.value)
                    )
                    }
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500" />
                  
                      </div>
                    </div>
              }

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRuleId(null);
                    setEditThresholds(null);
                  }}>
                  
                      Cancel
                    </Button>
                    <Button
                  size="sm"
                  icon={Save}
                  disabled={savingRuleId === rule.id}
                  onClick={() => saveEditing(rule.id)}>
                  
                      Save Changes
                    </Button>
                  </div>
                </div>
            }
            </Card>
          </motion.div>
        )}
      </div>}
    </div>);

};