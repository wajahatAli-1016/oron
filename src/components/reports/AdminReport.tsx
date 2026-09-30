import { useMemo, useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { Printer, Search } from 'lucide-react';
import { OwnerReportSkeleton } from '../skeletons/ReportsSkeleton';
import {
  useGetBranchDashboardQuery,
  useGetVitalsQuery,
} from '../../store/api/oronApi';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { getFullName, type Resident, type StaffMember } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RefreshButton } from '../refresh/Refresh';

export const AdminReport = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || '';

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError: dashboardError,
    error: dashboardErr,
    refetch: refetchDashboard,
  } = useGetBranchDashboardQuery(undefined, { skip: !branchId });

  const {
    data: vitals = [],
    isLoading: vitalsLoading,
    isFetching: vitalsFetching,
    isError: vitalsError,
    error: vitalsErr,
    refetch: refetchVitals,
  } = useGetVitalsQuery(undefined, { skip: !branchId });

  const [selectedResidentId, setSelectedResidentId] = useState<string>('all');
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [residentPickerOpen, setResidentPickerOpen] = useState(false);
  const residentPickerRef = useRef<HTMLDivElement>(null);

  const tasks = dashboard?.tasks ?? [];
  const alerts = dashboard?.alerts ?? [];
  const staff = (dashboard?.staff ?? []) as StaffMember[];
  const residents = dashboard?.residents ?? [];

  const loading =
    dashboardLoading ||
    vitalsLoading ||
    dashboardFetching ||
    vitalsFetching;

  const queryError = dashboardError
    ? getApiErrorMessage(dashboardErr, 'Failed to load report data')
    : vitalsError
      ? getApiErrorMessage(vitalsErr, 'Failed to load report data')
      : null;

  const error = !branchId
    ? 'Missing branch context. Please re-login.'
    : queryError;

  const refetchAll = () => {
    void refetchDashboard();
    void refetchVitals();
  };

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, days: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  const dayLabel = (d: Date) => d.toLocaleString('en-US', { weekday: 'short' });

  const branchTasks = useMemo(() => tasks, [tasks]);
  const branchAlerts = useMemo(
    () => alerts.filter((a) => a.status !== 'Resolved'),
    [alerts],
  );
  const branchStaff = useMemo(() => staff, [staff]);
  const branchVitals = useMemo(
    () => vitals.filter((v) => v.branchId === branchId),
    [vitals, branchId],
  );
  const branchResidents = useMemo(() => residents, [residents]);

  const selectedResidentLabel = useMemo(() => {
    if (selectedResidentId === 'all') return 'All residents';
    const r = branchResidents.find((x) => x.id === selectedResidentId);
    return r ? getFullName(r) : 'Select a resident';
  }, [selectedResidentId, branchResidents]);

  const filteredResidentsForPicker = useMemo(() => {
    const q = residentSearchQuery.trim().toLowerCase();
    const sorted: Resident[] = [...branchResidents].sort((a, b) =>
      getFullName(a).localeCompare(getFullName(b), undefined, { sensitivity: 'base' }),
    );
    if (!q) {
      return sorted.slice(0, 48);
    }
    return sorted
      .filter((r) => {
        const name = getFullName(r).toLowerCase();
        const room = (r.room || '').toLowerCase();
        return name.includes(q) || room.includes(q);
      })
      .slice(0, 120);
  }, [branchResidents, residentSearchQuery]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = residentPickerRef.current;
      if (!el || !residentPickerOpen) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setResidentPickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [residentPickerOpen]);

  const selectResidentForTrend = (id: string) => {
    setSelectedResidentId(id);
    setResidentSearchQuery('');
    setResidentPickerOpen(false);
  };

  const selectedResident = useMemo(() => {
    if (selectedResidentId === 'all') return null;
    return branchResidents.find((r) => r.id === selectedResidentId) || null;
  }, [branchResidents, selectedResidentId]);

  const vitalsForTrend = useMemo(() => {
    if (selectedResidentId === 'all') return branchVitals;
    return branchVitals.filter((v) => v.residentId === selectedResidentId);
  }, [branchVitals, selectedResidentId]);

  const vitalsTrendData = useMemo(() => {
    const now = new Date();
    const windowStart = startOfDay(addDays(now, -6));
    const windowEnd = addDays(windowStart, 7);

    const inWindow = vitalsForTrend
      .map((v) => ({ ...v, _date: new Date(v.date) }))
      .filter((v) => !Number.isNaN(v._date.getTime()))
      .filter((v) => v._date >= windowStart && v._date < windowEnd);

    const avg = (vals: Array<number | undefined>) => {
      const xs = vals.filter((x): x is number => typeof x === 'number' && !Number.isNaN(x));
      if (xs.length === 0) return 0;
      return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
    };

    return Array.from({ length: 7 }).map((_, idx) => {
      const dayStart = addDays(windowStart, idx);
      const next = addDays(dayStart, 1);
      const forDay = inWindow.filter((v) => v._date >= dayStart && v._date < next);
      return {
        day: dayLabel(dayStart),
        avgSystolic: avg(forDay.map((v) => v.systolicBP)),
        avgDiastolic: avg(forDay.map((v) => v.diastolicBP)),
        avgHR: avg(forDay.map((v) => v.heartRate)),
      };
    });
  }, [vitalsForTrend]);

  const taskData = useMemo(() => {
    const categoryCounts = branchTasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [branchTasks]);

  const TASK_COLORS = [
    '#A855F7',
    '#06B6D4',
    '#EF4444',
    '#22C55E',
    '#F59E0B',
    '#F97316',
    '#64748B',
  ];

  const alertData = useMemo(() => {
    const stateCounts = branchAlerts.reduce(
      (acc, alert) => {
        if (alert.healthState) {
          acc[alert.healthState] = (acc[alert.healthState] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(stateCounts).map(([name, count]) => ({ name, count }));
  }, [branchAlerts]);

  const staffActivityData = useMemo(() => {
    const now = new Date();
    const since = startOfDay(addDays(now, -6));

    const vitalsInWindow = branchVitals
      .map((v) => ({ ...v, _date: new Date(v.date) }))
      .filter((v) => !Number.isNaN(v._date.getTime()))
      .filter((v) => v._date >= since);

    const tasksCompleted = new Map<string, number>();
    for (const t of branchTasks) {
      if (t.status !== 'Done') continue;
      if (!t.assignedTo) continue;
      tasksCompleted.set(t.assignedTo, (tasksCompleted.get(t.assignedTo) || 0) + 1);
    }

    const vitalsLogged = new Map<string, number>();
    for (const v of vitalsInWindow) {
      if (!v.recordedById) continue;
      vitalsLogged.set(v.recordedById, (vitalsLogged.get(v.recordedById) || 0) + 1);
    }

    return branchStaff
      .map((s) => ({
        id: s.id,
        name: s.firstName,
        tasksCompleted: tasksCompleted.get(s.id) || 0,
        vitalsLogged: vitalsLogged.get(s.id) || 0,
      }))
      .sort(
        (a, b) =>
          b.tasksCompleted + b.vitalsLogged - (a.tasksCompleted + a.vitalsLogged),
      );
  }, [branchStaff, branchTasks, branchVitals]);

  if (loading) {
    return <OwnerReportSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Branch Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Analytics on resident health, staff performance, and operations for your branch.
            </p>
          </div>
        </div>
        <Card>
          <div className="text-sm text-red-600">Error loading report: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold text-slate-900">Branch Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Analytics on resident health, staff performance, and operations for your branch.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Button variant="outline" icon={Printer} onClick={() => window.print()}>
            Print Report
          </Button>
          <RefreshButton onRefresh={refetchAll} isLoading={dashboardFetching || vitalsFetching} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 shrink-0">Average Vitals Trends</h2>
            <div
              ref={residentPickerRef}
              className="relative w-full min-w-0 sm:max-w-[min(100%,20rem)] sm:shrink-0 flex flex-col gap-1.5 mr-2 sm:mr-3"
            >
              <div className="relative">
                <Input
                  placeholder="Search by name or room…"
                  icon={Search}
                  value={residentSearchQuery}
                  aria-label="Search residents by name or room"
                  onChange={(e) => {
                    setResidentSearchQuery(e.target.value);
                    setResidentPickerOpen(true);
                  }}
                  onFocus={() => setResidentPickerOpen(true)}
                  autoComplete="off"
                  style={{ width: '17rem' }}
                />
                {residentPickerOpen && (
                  <ul
                    className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    role="listbox"
                  >
                  <li role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedResidentId === 'all'}
                      className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                        selectedResidentId === 'all' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-800'
                      }`}
                      onClick={() => selectResidentForTrend('all')}
                    >
                      All residents
                    </button>
                  </li>
                  {filteredResidentsForPicker.map((r) => {
                    const name = getFullName(r);
                    const active = selectedResidentId === r.id;
                    return (
                      <li key={r.id} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`flex w-full flex-col items-stretch px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                            active ? 'bg-indigo-50 text-indigo-900' : 'text-slate-800'
                          }`}
                          onClick={() => selectResidentForTrend(r.id)}
                        >
                          <span className="font-medium">{name}</span>
                          {r.room ? (
                            <span className="text-xs text-slate-500">Room {r.room}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                  {!residentSearchQuery.trim() && branchResidents.length > 48 ? (
                    <li className="px-3 py-2 text-[11px] text-slate-500 border-t border-slate-100">
                      Showing 48 of {branchResidents.length}. Type to search for more.
                    </li>
                  ) : null}
                  {residentSearchQuery.trim() && filteredResidentsForPicker.length === 0 ? (
                    <li className="px-3 py-4 text-center text-sm text-slate-500">No residents match.</li>
                  ) : null}
                  {residentSearchQuery.trim() && filteredResidentsForPicker.length >= 120 ? (
                    <li className="px-3 py-2 text-[11px] text-slate-500 border-t border-slate-100">
                      Showing first 120 matches. Refine your search.
                    </li>
                  ) : null}
                </ul>
                )}
              </div>
              
            </div>
          </div>
          {selectedResident && (
            <p className="text-xs text-slate-500 -mt-3 mb-4 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-blue-400"></span>
              Showing averages for
              <span className="font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 px-2 py-0.5 rounded-md">
                {getFullName(selectedResident)}
              </span>
            </p>
          )}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={vitalsTrendData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-[12px] text-slate-600">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="avgSystolic"
                  name="Avg Systolic"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgDiastolic"
                  name="Avg Diastolic"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHR"
                  name="Avg Heart Rate"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Tasks by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Alerts by Health State</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alertData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Staff Activity (This Week)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={staffActivityData}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar
                  dataKey="tasksCompleted"
                  name="Tasks Completed"
                  stackId="a"
                  fill="#0D9488"
                  radius={[0, 0, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="vitalsLogged"
                  name="Vitals Logged"
                  stackId="a"
                  fill="#38BDF8"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
