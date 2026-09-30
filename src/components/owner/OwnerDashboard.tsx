import { useEffect, useRef } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  ArrowRight,
  Activity,
  Network
} from 'lucide-react';
import { StatsCard, Card, Button } from '../../components/UI';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardFacilitesActions, RecentFaciltescolumns } from '../../shared/TableColumns';
import SmartTable from '../../shared/Table';
import { useGetOwnerDashboardQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { AdminDashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { RefreshButton } from '../refresh/Refresh.tsx';

export const OwnerDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const errorToastShown = useRef(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useGetOwnerDashboardQuery();

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to fetch data'));
  }, [isError, error, toast]);

  const facilities = data?.facilities ?? [];
  const branches = data?.branches ?? [];
  const residents = data?.residents ?? [];
  const alerts = data?.alerts ?? [];
  const totals = data?.totals;

  const totalFacilities = totals?.facilities ?? facilities.length;
  const totalBranches = totals?.branches ?? branches.length;
  const totalResidents = totals?.residents ?? residents.length;
  const totalCapacity = branches.reduce(
    (acc, curr) => acc + curr.residentLimit,
    0
  );
  const utilization = Math.round(totalResidents / totalCapacity * 100) || 0;
  const recentAlerts = alerts.slice(0, 4);

  if (isLoading) {
    return <AdminDashboardSkeleton />
  }

  if (isError) {
    const message = getApiErrorMessage(error, 'Failed to fetch data');
    return (
      <div className="space-y-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className='min-w-0 shrink'>
            <h1 className="text-2xl font-bold text-slate-900">
              Platform Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor all facilities and system health
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
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor all facilities and system health
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Link to="/owner/facilities/new">
            <Button icon={Building2}>Onboard Facility</Button>
          </Link>
          <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Facilities"
          value={totalFacilities}
          icon={Building2}
          trendUp={true} />

        <StatsCard
          title="Total Branches"
          value={totalBranches}
          icon={Network} />

        <StatsCard
          title="Total Residents"
          value={totalResidents.toLocaleString()}
          icon={Users}
          trendUp={true} />

        <StatsCard
          title="System Utilization"
          value={`${utilization}%`}
          icon={Activity} />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Facilities
            </h2>
            <Link
              to="/owner/facilities"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">

              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <SmartTable
              data={facilities.slice(0, 5)}
              columns={RecentFaciltescolumns}
              actions={dashboardFacilitesActions}
            />
          </div>
        </Card>

        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              System Alerts
            </h2>
          </div>
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {recentAlerts.map((alert) =>
              <div key={alert.id} className="flex gap-3 items-start">
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'Critical' ? 'bg-red-500' : alert.severity === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {alert.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    {new Date(alert.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            {recentAlerts.length === 0 &&
              <div className="text-center text-sm text-slate-500 py-8">
                No active system alerts
              </div>
            }
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              type="button"
              onClick={() => navigate('/owner/notifications')}
            >
              View All Alerts
            </Button>
          </div>
        </Card>
      </div>
    </div>);

};
