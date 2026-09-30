import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Users,
  AlertTriangle,
  ArrowRight,
  Activity,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { StatsCard, Card, Button } from '../../components/UI';
import SmartTable from '../../shared/Table';
import { BranchesCompactActions, BranchesCompactColumns } from '../../shared/TableColumns';
import { useGetFacilityDashboardQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { AdminDashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { RefreshButton } from '../refresh/Refresh';
import { tryParseVitalsAlert } from '../../utils/vitalsAlertMessage';
import { getFullName } from '../../types';

export const FacilityAdminDashboard = () => {
  const toast = useToast();
  const errorToastShown = useRef(false);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetFacilityDashboardQuery();

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to fetch data'));
  }, [isError, error, toast]);

  const branches = data?.branches ?? [];
  const residents = data?.residents ?? [];
  const staff = data?.staff ?? [];
  const alerts = data?.alerts ?? [];
  const totals = data?.totals;

  const totalBranches = totals?.branches ?? branches.length;
  const totalResidents = totals?.residents ?? residents.length;
  const totalStaff = totals?.staff ?? staff.length;
  const totalCapacity = branches.reduce(
    (acc, curr) => acc + curr.residentLimit,
    0,
  );
  const utilization =
    Math.round((totalResidents / totalCapacity) * 100) || 0;
  const recentAlerts = alerts.slice(0, 4);

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (isError) {
    const message = getApiErrorMessage(error, 'Failed to fetch data');
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Facility Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of all branches under your management
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error loading dashboard: {message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold text-slate-900">
            Facility Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of all branches under your management
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Link to="/facility-admin/branches">
            <Button icon={Network}>Manage Branches</Button>
          </Link>
          <RefreshButton
            onRefresh={() => void refetch()}
            isLoading={isFetching}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Branches" value={totalBranches} icon={Network} />
        <StatsCard title="Total Residents" value={totalResidents} icon={Users} />
        <StatsCard title="Total Staff" value={totalStaff} icon={Users} />
        <StatsCard
          title="Overall Utilization"
          value={`${utilization}%`}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Branch Overview
            </h2>
            <Link
              to="/facility-admin/branches"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <SmartTable
            data={branches}
            columns={BranchesCompactColumns}
            actions={BranchesCompactActions}
          />
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden" noPadding>
  <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-5">
    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      Recent Alerts
    </h2>
    {/* Optional: Add badge for unread count if needed */}
  </div>
  <div className="scrollbar-hide divide-y divide-slate-100 min-h-0 h-80 overflow-y-auto">
    {recentAlerts.map((alert) => {
      // Parse vitals if your alert has that structure
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
                {vitalsParsed.bullets.map((line: string, i: number) => (
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
    {recentAlerts.length === 0 && (
      <div className="text-center text-sm text-slate-500 py-8">
        No active alerts
      </div>
    )}
  </div>
  <div className="p-4 border-t border-slate-100 bg-slate-50">
    <Link to="/facility-admin/notifications">
      <Button variant="outline" className="w-full" size="sm">
        View All Alerts
      </Button>
    </Link>
  </div>
</Card>
      </div>
    </div>
  );
};
