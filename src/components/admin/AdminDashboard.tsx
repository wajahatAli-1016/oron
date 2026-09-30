import { useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Activity,
  ClipboardList,
  AlertCircle,
  Plus,
  HeartPulse,
} from 'lucide-react';
import { StatsCard, Card, Badge, Button } from '../../components/UI';
import { Link } from 'react-router-dom';
import { getFullName } from '../../types';
import { tryParseVitalsAlert } from '../../utils/vitalsAlertMessage';
import { useGetBranchDashboardQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { AdminDashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { RefreshButton } from '../refresh/Refresh';

export const AdminDashboard = () => {
  const toast = useToast();
  const errorToastShown = useRef(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBranchDashboardQuery();

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to fetch dashboard data'));
  }, [isError, error, toast]);

  const residents = data?.residents ?? [];
  const tasks = data?.tasks ?? [];
  const alerts = data?.alerts ?? [];
  const staff = data?.staff ?? [];

  const activeResidents = useMemo(
    () => residents.filter((r) => r.status === 'InPatient').length,
    [residents],
  );
  const pendingTasks = useMemo(
    () =>
      tasks.filter((t) => t.status === 'Todo' || t.status === 'In Progress').length,
    [tasks],
  );
  const adminAlerts = useMemo(
    () => alerts.filter((a) => a.targetRoles.includes('admin')),
    [alerts],
  );

  const todaysAdminAlerts = useMemo(() => {
    const now = new Date();
    return adminAlerts
      .filter((a) => {
        const d = new Date(a.date);
        if (Number.isNaN(d.getTime())) return false;
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [adminAlerts]);

  const unreadTodaysAlerts = useMemo(
    () => todaysAdminAlerts.filter((a) => a.status === 'Unread').length,
    [todaysAdminAlerts],
  );
  const criticalAlerts = useMemo(
    () =>
      adminAlerts.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved')
        .length,
    [adminAlerts],
  );
  const staffCount = staff.length;
  const recentTasks = useMemo(() => tasks.slice(0, 4), [tasks]);

  const getTaskCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (isError) {
    const message = getApiErrorMessage(error, 'Failed to fetch dashboard data');
    return (
      <div className="space-y-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 shrink">
            <h1 className="text-2xl font-bold text-slate-900">Branch Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage residents, staff, and daily operations for your branch
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64 text-red-500">
          Error loading dashboard: {message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold text-slate-900">Branch Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage residents, staff, and daily operations for your branch
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Link to="/admin/vitals">
            <Button variant="secondary" icon={HeartPulse}>
              Enter Vitals
            </Button>
          </Link>
          <Link to="/admin/residents/new">
            <Button icon={Plus}>Add Resident</Button>
          </Link>
          <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="InPatient Residents" value={activeResidents} icon={Users} />
        <StatsCard title="Active Staff" value={staffCount} icon={Activity} />
        <StatsCard title="Pending Tasks" value={pendingTasks} icon={ClipboardList} />
        <StatsCard
          title="Critical Alerts"
          value={criticalAlerts}
          icon={AlertCircle}
          trend={criticalAlerts > 0 ? 'Requires attention' : 'All clear'}
          trendUp={criticalAlerts === 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        <Card className="flex min-h-0 flex-col overflow-hidden" noPadding>
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Today's Tasks</h2>
            <Link
              to="/admin/tasks"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View Board
            </Link>
          </div>
          <div className="scrollbar-hide h-80 min-h-0 space-y-3 overflow-y-auto p-5">
            {recentTasks.map((task) => {
              const resident = residents.find((r) => r.id === task.residentId);
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTaskCategoryColor(task.category)}`}
                      >
                        {task.category}
                      </span>
                    </div>
                    <Badge
                      variant={
                        task.status === 'Todo'
                          ? 'default'
                          : task.status === 'In Progress'
                            ? 'info'
                            : 'success'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{resident ? getFullName(resident) : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      <span>
                        Due:{' '}
                        {new Date(task.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {recentTasks.length === 0 && (
              <div className="text-center text-sm text-slate-500 py-8">
                No tasks for today.
              </div>
            )}
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden" noPadding>
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Today's Alerts</h2>
            <Badge variant="danger">
              {unreadTodaysAlerts} New
            </Badge>
          </div>
          <div className="scrollbar-hide divide-y divide-slate-100 min-h-0 h-80 overflow-y-auto">
            {todaysAdminAlerts.map((alert) => {
              const vitalsParsed = tryParseVitalsAlert(alert);
              const resident = alert.residentId
                ? residents.find((r) => r.id === alert.residentId)
                : null;
              return (
                <div
                  key={alert.id}
                  className={`p-5 flex gap-4 ${alert.status === 'Unread' ? 'bg-slate-50/50' : ''}`}
                >
                  <div
                    className={`mt-1 p-2 rounded-full shrink-0 h-fit ${
                      alert.severity === 'Critical'
                        ? 'bg-red-100 text-red-600'
                        : alert.severity === 'Warning'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {vitalsParsed ? vitalsParsed.displayTitle : alert.title}
                      </p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(alert.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {vitalsParsed ? (
                      <ul className="mt-1 list-none space-y-1 pl-0 text-sm text-slate-600">
                        {vitalsParsed.bullets.map((line, i) => (
                          <li key={`${alert.id}-vital-${i}`} className="flex gap-2">
                            <span className="text-slate-400 shrink-0" aria-hidden>
                              •
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                    )}
                    {resident && !vitalsParsed && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          Resident: {getFullName(resident)}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          Room: {resident.room}
                        </span>
                      </div>
                    )}
                    {resident?.room && vitalsParsed && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          Room: {resident.room}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {todaysAdminAlerts.length === 0 && (
              <div className="text-center text-sm text-slate-500 py-8">
                No alerts for today.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
