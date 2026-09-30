import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Users,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, Button, StatsCard, Badge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { getFullName } from '../../types';
import { useGetStaffDashboardQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { AdminDashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { RefreshButton } from '../refresh/Refresh';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const errorToastShown = useRef(false);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetStaffDashboardQuery(undefined, { skip: !user?.id });

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to load dashboard'));
  }, [isError, error, toast]);

  const tasks = data?.tasks ?? [];
  const alerts = data?.alerts ?? [];
  const residents = data?.residents ?? [];

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status === 'Todo' || t.status === 'In Progress'),
    [tasks],
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === 'Done'),
    [tasks],
  );
  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .filter((a) => a.status !== 'Resolved')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [alerts],
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user ? getFullName(user).split(' ')[0] : 'Staff'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's your shift overview for today.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Link to="/staff/vitals">
            <Button icon={HeartPulse}>Log Vitals</Button>
          </Link>
          <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="My Pending Tasks"
          value={pendingTasks.length}
          icon={ClipboardList}
          iconColor="text-brand-500"
          iconBg="bg-brand-100"
        />
        <StatsCard
          title="Tasks Completed"
          value={completedTasks.length}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-100"
        />
        <StatsCard
          title="Active Alerts"
          value={recentAlerts.length}
          icon={AlertCircle}
          iconColor="text-amber-500"
          iconBg="bg-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card noPadding className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-500" /> My Tasks Today
            </h2>
            <Link
              to="/staff/tasks"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View All
            </Link>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y divide-slate-100">
              {pendingTasks.slice(0, 4).map((task) => {
                const resident = residents.find((r) => r.id === task.residentId);
                return (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getCategoryColor(task.category)}`}
                        >
                          {task.category}
                        </span>
                        <h3 className="font-medium text-slate-900 text-sm">{task.title}</h3>
                      </div>
                      <Badge variant={task.status === 'In Progress' ? 'info' : 'default'}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-1 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {resident
                          ? `${getFullName(resident)} (Rm ${resident.room})`
                          : 'General'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {pendingTasks.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No pending tasks for today!
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card noPadding>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> Recent Alerts
              </h2>
            </div>
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex gap-3"
                  >
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                        alert.severity === 'Critical'
                          ? 'bg-red-500'
                          : alert.severity === 'Warning'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <h3 className="font-medium text-slate-900 text-sm">{alert.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))}
                {recentAlerts.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-500">No active alerts.</div>
                )}
              </div>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-500" /> My Residents
              </h2>
              <Link
                to="/staff/residents"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View All
              </Link>
            </div>
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                {residents.slice(0, 4).map((resident) => (
                  <Link
                    key={resident.id}
                    to={`/staff/residents/${resident.id}`}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs">
                        {resident.firstName[0]}
                        {resident.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 text-sm">
                          {getFullName(resident)}
                        </h3>
                        <p className="text-xs text-slate-500">Room {resident.room}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </Link>
                ))}
                {residents.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No residents assigned yet.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

