import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Activity, ClipboardList, Calendar } from 'lucide-react';
import { Badge, Button, Card } from '../UI';
import { getFullName } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  useGetBranchByIdQuery,
  useGetStaffByIdQuery,
  useGetTasksQuery,
} from '../../store/api/oronApi';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { ResidentDetailsSkeleton } from '../skeletons/DetailsSkeleton';
import { RefreshButton } from '../refresh/Refresh';

export const StaffDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const {
    data: staff,
    isLoading: staffLoading,
    isFetching: staffFetching,
    isError: staffError,
    error: staffErr,
    refetch: refetchStaff,
  } = useGetStaffByIdQuery(id!, { skip: !id });

  const {
    data: branch,
    isFetching: branchFetching,
    refetch: refetchBranch,
  } = useGetBranchByIdQuery(staff?.branchId ?? '', {
    skip: !staff?.branchId,
  });

  const {
    data: allTasks = [],
    isFetching: tasksFetching,
    refetch: refetchTasks,
  } = useGetTasksQuery();

  const handleRefresh = async () => {
    const refetches: Promise<unknown>[] = [refetchStaff()];
    if (staff?.branchId) {
      refetches.push(refetchBranch());
    }
    refetches.push(refetchTasks());
    await Promise.all(refetches);
  };

  const backTo =
    user?.role === 'facility_admin'
      ? '/facility-admin/staff'
      : user?.role === 'admin'
        ? '/admin/staff'
        : '/';

  useEffect(() => {
    if (!staff) return;
    sessionStorage.setItem(`breadcrumb:staff:${staff.id}`, getFullName(staff));
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [staff]);

  const assignedTasks = useMemo(
    () =>
      staff
        ? allTasks
            .filter((t) => (t.assignedTo || '') === staff.id)
            .sort(
              (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
            )
        : [],
    [allTasks, staff],
  );

  const branchName = branch?.name ?? '';
  const loading = staffLoading;
  const error = !id
    ? 'Staff ID is missing'
    : staffError
      ? getApiErrorMessage(staffErr, 'Failed to load staff details')
      : null;

  const initials = useMemo(() => {
    if (!staff) return '';
    const a = staff.firstName?.[0] ?? '';
    const b = staff.lastName?.[0] ?? '';
    return `${a}${b}`.toUpperCase();
  }, [staff]);

  if (loading) {
    return <ResidentDetailsSkeleton />;
  }

  if (!staff) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-sm text-red-600">{error || 'Staff not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <Link
          to={backTo}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl border-2 border-white shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{getFullName(staff)}</h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-800 border-slate-200">
                {staff.role}
              </span>
              <Badge variant={staff.status === 'Active' ? 'success' : 'default'}>
                {staff.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {staff.email}
              {branchName ? <span>• {branchName}</span> : null}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={staffFetching || branchFetching || tasksFetching}
            className="w-full sm:w-auto"
          />
          <Link to={`${backTo}/${staff.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-slate-400" /> Assigned Tasks
              </h2>
              <span className="text-xs text-slate-500">{assignedTasks.length} total</span>
            </div>

            {assignedTasks.length ? (
              <div className="space-y-3">
                {assignedTasks.slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{t.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {t.description || 'No description'}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[11px] border border-slate-200">
                            {t.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            Due: {new Date(t.dueDate).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={
                          t.status === 'Done'
                            ? 'success'
                            : t.status === 'In Progress'
                              ? 'info'
                              : 'default'
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                {assignedTasks.length > 8 ? (
                  <p className="text-xs text-slate-500 pt-1">
                    Showing latest 8 tasks. ({assignedTasks.length - 8} more hidden)
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No tasks assigned to this staff member.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" /> Permissions
            </h2>
            {staff.permissions?.length ? (
              <div className="flex flex-wrap gap-2">
                {staff.permissions.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 text-xs border border-slate-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No permissions assigned.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-brand-50 border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-600" /> Activity
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-700">Last login</span>
                <span className="font-medium text-brand-900">
                  {staff.lastActive
                    ? new Date(staff.lastActive).toLocaleString()
                    : '---'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

