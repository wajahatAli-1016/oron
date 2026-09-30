import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Network,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  Activity,
  Users } from
'lucide-react';
import { Card, Button, Badge } from '../../components/UI';
import { useGetBranchByIdQuery } from '../../store/api/oronApi';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { ResidentDetailsSkeleton } from '../skeletons/DetailsSkeleton';
import { RefreshButton } from '../refresh/Refresh';

export const BranchDetails = () => {
  const { id } = useParams();
  const {
    data: branch,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBranchByIdQuery(id!, { skip: !id });

  const handleRefresh = async () => {
    await refetch();
  };

  useEffect(() => {
    if (!branch) return;
    sessionStorage.setItem(`breadcrumb:branches:${branch.id}`, branch.name);
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [branch]);

  const errorMessage = !id
    ? 'Branch ID is missing'
    : isError
      ? getApiErrorMessage(error, 'Failed to load branch details')
      : null;
  const loading = isLoading;

  const usagePercent = useMemo(() => {
    if (!branch?.residentLimit) return 0;
    return Math.round((branch.currentResidents / branch.residentLimit) * 100);
  }, [branch?.currentResidents, branch?.residentLimit]);

  if (loading) {
    return <ResidentDetailsSkeleton />;
  }

  if (!branch) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm text-red-600">{errorMessage || 'Branch not found'}</p>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4 mb-2">
        <Link
          to="/facility-admin/branches"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors shrink-0">
          
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{branch.name}</h1>
            <Badge
              variant={
              branch.status === 'Active' ?
              'success' :
              branch.status === 'Pending' ?
              'warning' :
              'danger'
              }>
              
              {branch.status}
            </Badge>
            <Badge variant="default">{branch.type}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {branch.address}
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          isLoading={isFetching}
          className="w-full sm:w-auto shrink-0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Branch Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Phone Number
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {branch.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Network className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Branch Type
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {branch.type}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Branch Admin
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {branch.branchAdminName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-500" />
                  Residents
                </h2>
                <Badge variant="default">{branch.currentResidents}</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Manage residents for this branch.
              </p>
              <Link to="/facility-admin/residents">
                <Button variant="outline" className="w-full">
                  View Residents
                </Button>
              </Link>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-500" />
                  Staff
                </h2>
                <Badge variant="default">—</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Manage staff for this branch.
              </p>
              <Link to="/facility-admin/staff">
                <Button variant="outline" className="w-full">
                  View Staff
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Right Column - Stats & Logs */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Capacity Status
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Resident Limit</span>
                  <span className="font-medium text-slate-900">
                    {branch.currentResidents} / {branch.residentLimit}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{
                      width: `${usagePercent}%`
                    }}>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">
                  {usagePercent}% utilized
                </p>
              </div>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-400" />
                Recent Activity
              </h2>
            </div>
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-6 text-center text-slate-500 text-sm">
                  Activity feed not wired yet.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

};