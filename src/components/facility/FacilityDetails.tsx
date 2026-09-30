import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Phone,
  User,
  Mail,
  FileText,
  Eye,
  Download,
  ShieldAlert,
  ArrowLeft,
  Activity,
  Network,
  Plus,
  Loader2,
  Edit2,
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, FilterDropdown } from '../../components/UI';
import { mockAuditLogs } from '../../mockData';
import { Branch } from '../../types';
import { useGetFacilityByIdQuery, useGetBranchesQuery } from '../../store/api/oronApi';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { ResidentDetailsSkeleton } from '../skeletons/DetailsSkeleton';
import { RefreshButton } from '../refresh/Refresh';

const FACILITY_TYPE_OPTIONS = [
  { value: 'Senior Living', label: 'Senior Living' },
  { value: 'Assisted Living', label: 'Assisted Living' },
  { value: 'Memory Care', label: 'Memory Care' },
  { value: 'Multi-Specialty', label: 'Multi-Specialty' },
];

export const FacilityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [isRefreshingContractDownloadUrl, setIsRefreshingContractDownloadUrl] = useState(false);
  const [isRefreshingContractViewUrl, setIsRefreshingContractViewUrl] = useState(false);
  const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false);
  const [contractViewUrl, setContractViewUrl] = useState<string | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFacilityType, setEditFacilityType] = useState('Senior Living');

  const {
    data: facility,
    isLoading: loading,
    isFetching: facilityFetching,
    isError,
    error: queryError,
    refetch: refetchFacility,
  } = useGetFacilityByIdQuery(id!, { skip: !id });

  const {
    data: allBranches = [],
    isFetching: branchesFetching,
    refetch: refetchBranches,
  } = useGetBranchesQuery();

  useEffect(() => {
    if (facility?.type) {
      setEditFacilityType(facility.type);
    }
  }, [facility?.type]);

  const facilityBranches = useMemo(
    () => (id ? allBranches.filter((branch) => branch.facilityId === id) : []),
    [allBranches, id],
  );

  useEffect(() => {
    if (isError && queryError) {
      toast.error(getApiErrorMessage(queryError, 'Failed to load facility details'));
    }
  }, [isError, queryError, toast]);

  useEffect(() => {
    if (!facility) return;
    sessionStorage.setItem(`breadcrumb:facilities:${facility.id}`, facility.name);
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [facility]);

  const error = isError ? getApiErrorMessage(queryError, 'Failed to load facility details') : null;

  const handleRefresh = async () => {
    await Promise.all([refetchFacility(), refetchBranches()]);
  };

  const facilityLogs = useMemo(() => {
    if (!facility) {
      return [];
    }

    return mockAuditLogs
      .filter((log) => log.facilityId === facility.id)
      .slice(0, 5);
  }, [facility]);

  const handleRevokeAccess = () => {
    setIsRevokeModalOpen(false);
    navigate('/owner/facilities');
  };

  const handleDownloadContract = async () => {
    if (!id) return;
    try {
      setIsRefreshingContractDownloadUrl(true);
      const { data: fresh } = await refetchFacility();
      if (fresh?.contractDocumentUrl) {
        const response = await axios.get(fresh.contractDocumentUrl, {
          responseType: 'blob',
        });

        const contentDisposition = response.headers?.['content-disposition'] as string | undefined;
        const fileNameFromHeader = contentDisposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i)?.[1];
        const fileName = decodeURIComponent(fileNameFromHeader || 'contract-document');

        const blobUrl = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      } else {
        toast.error('No contract document available.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to refresh contract download link'));
    } finally {
      setIsRefreshingContractDownloadUrl(false);
    }
  };

  const handleViewContract = async () => {
    if (!id) return;
    try {
      setIsRefreshingContractViewUrl(true);
      const { data: fresh } = await refetchFacility();
      if (fresh?.contractDocumentUrl) {
        setContractViewUrl(fresh.contractDocumentUrl);
        setIsViewContractModalOpen(true);
      } else {
        toast.error('No contract document available.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to refresh contract view link'));
    } finally {
      setIsRefreshingContractViewUrl(false);
    }
  };

  const closeViewContractModal = () => {
    setIsViewContractModalOpen(false);
    setContractViewUrl(null);
  };

  const contractPreviewType = useMemo<'pdf' | 'image' | 'other' | 'none'>(() => {
    if (!contractViewUrl) return 'none';
    try {
      const url = new URL(contractViewUrl);
      const path = url.pathname.toLowerCase();
      if (path.endsWith('.pdf')) return 'pdf';
      if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.webp') || path.endsWith('.gif')) {
        return 'image';
      }
      return 'other';
    } catch {
      const lower = contractViewUrl.toLowerCase();
      if (lower.includes('.pdf')) return 'pdf';
      if (lower.includes('.png') || lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.webp') || lower.includes('.gif')) {
        return 'image';
      }
      return 'other';
    }
  }, [contractViewUrl]);

  const contractPdfPreviewUrl = useMemo(() => {
    if (!contractViewUrl) return null;
    // Ask the built-in PDF viewer to fit the page in the viewport.
    const hasHash = contractViewUrl.includes('#');
    return `${contractViewUrl}${hasHash ? '&' : '#'}view=Fit`;
  }, [contractViewUrl]);

  if (loading) {
    return <ResidentDetailsSkeleton />
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  }

  if (!facility) {
    return <div className="p-8 text-center text-slate-500">Facility not found.</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/owner/facilities"
            className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {facility.name}
              </h1>
              <Badge
                variant={
                  facility.status === 'Active' ?
                    'success' :
                    facility.status === 'Pending' ?
                      'warning' :
                      facility.status === 'Suspended' ?
                        'default' :
                        'danger'
                }>
                {facility.status}
              </Badge>
              <Badge variant="default" className="hidden sm:inline-flex">
                {facility.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => {
              navigate(`/owner/facilities/${facility.id}/edit`)
            }}
            className="w-full sm:w-auto text-sm">
            Edit Details
          </Button>
          <Button
            variant="danger"
            icon={ShieldAlert}
            onClick={() => setIsRevokeModalOpen(true)}
            className="w-full sm:w-auto text-sm">
            Revoke Access
          </Button>
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={facilityFetching || branchesFetching}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details & Branches */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
              Facility Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Phone Number
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5 break-words">
                      {facility.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm text-slate-900 mt-0.5 break-words">
                      {facility.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Facility Admin
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5 break-words">
                      {facility.facilityAdminName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Facility Type
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {facility.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Branches List */}
          <Card noPadding>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Network className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" />
                Facility Branches
              </h2>
              {user?.role === 'owner' && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  onClick={() => navigate(`/owner/facilities/${facility.id}/branches/new`)}
                  className="w-full sm:w-auto">
                  Add Branch
                </Button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 sm:px-5 py-3 font-medium">Branch Name</th>
                    <th className="px-3 sm:px-5 py-3 font-medium">Status</th>
                    <th className="px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">Utilization</th>
                    <th className="px-3 sm:px-5 py-3 font-medium">Admin</th>
                    {user?.role === 'owner' && (
                      <th className="px-3 sm:px-5 py-3 font-medium text-right">Edit</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilityBranches.map((branch) => {
                    const usagePercent = Math.round(
                      branch.currentResidents / branch.residentLimit * 100
                    );
                    return (
                      <tr key={branch.id} className="hover:bg-slate-50/50">
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <p className="font-medium text-slate-900 text-sm">
                            {branch.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-none">
                            {branch.address}
                          </p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
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
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
                              <div
                                className={`h-2 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                                style={{
                                  width: `${usagePercent}%`
                                }}>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                              {branch.currentResidents}/{branch.residentLimit}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-600 text-sm">
                          {branch.branchAdminName || 'Unassigned'}
                        </td>
                        {user?.role === 'owner' && (
                          <td className="px-3 sm:px-5 py-3 sm:py-4 text-right">
                            <Link
                              to={`/owner/facilities/${facility.id}/branches/${branch.id}/edit`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-brand-600"
                              title="Edit branch"
                              aria-label={`Edit ${branch.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {facilityBranches.length === 0 &&
                    <tr>
                      <td
                        colSpan={user?.role === 'owner' ? 5 : 4}
                        className="px-3 sm:px-5 py-6 sm:py-8 text-center text-slate-500"
                      >
                        No branches added yet.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Contract Documents
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 sm:px-5 py-3 font-medium">Document Name</th>
                    <th className="px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">Upload Date</th>
                    <th className="px-3 sm:px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facility.contractDocumentUrl ? (
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-brand-500 shrink-0" />
                          <span className="font-medium text-slate-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                            Contract Document
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-500 text-xs sm:text-sm hidden sm:table-cell">
                        {facility.contractStart
                          ? new Date(facility.contractStart).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors ${
                              isRefreshingContractViewUrl ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primarySoft cursor-pointer'
                            }`}
                            title="View"
                            aria-label="View"
                            aria-busy={isRefreshingContractViewUrl}
                            onClick={isRefreshingContractViewUrl ? undefined : handleViewContract}
                          >
                            {isRefreshingContractViewUrl ? (
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 animate-spin" aria-label="Loading" />
                            ) : (
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" aria-label="View" />
                            )}
                          </span>
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors ${
                              isRefreshingContractDownloadUrl ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primarySoft cursor-pointer'
                            }`}
                            title="Download"
                            aria-label="Download"
                            aria-busy={isRefreshingContractDownloadUrl}
                            onClick={isRefreshingContractDownloadUrl ? undefined : handleDownloadContract}
                          >
                            {isRefreshingContractDownloadUrl ? (
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 animate-spin" aria-label="Loading" />
                            ) : (
                              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" aria-label="Download" />
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 sm:px-5 py-6 text-center text-slate-500 text-xs sm:text-sm">
                        No contract document uploaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </Card>
        </div>

        {/* Right Column - Stats & Logs */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
              Contract Status
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1 gap-1">
                  <span className="text-slate-500">Contract Period</span>
                  <span className="font-medium text-slate-900 text-xs sm:text-sm">
                    {new Date(facility.contractStart).toLocaleDateString()} -{' '}
                    {new Date(facility.contractEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: '30%' }}>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Total Residents</span>
                  <span className="font-medium text-slate-900">
                    {facility.totalResidents}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                Recent Activity
              </h2>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {facilityLogs.map((log) =>
                  <div key={log.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-medium text-slate-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 break-words">
                      {log.details}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {log.user}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {facilityLogs.length === 0 &&
                  <div className="p-4 sm:p-6 text-center text-slate-500 text-sm">
                    No recent activity
                  </div>
                }
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl text-center">
              <Link
                to="/admin/logs"
                className="text-xs font-medium text-brand-600 hover:text-brand-700">
                View All Logs
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals - Made responsive */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Facility Details">
        <div className="space-y-4">
          <Input label="Facility Name" defaultValue={facility.name} />
          <Input label="Phone Number" type='number' defaultValue={facility.phone} />
          <Input label="Email" type='email' defaultValue={facility.email} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Facility Type
            </label>
            <FilterDropdown
              value={editFacilityType}
              onChange={setEditFacilityType}
              options={FACILITY_TYPE_OPTIONS}
              ariaLabel="Facility type"
              minWidth="100%"
              showCountsInMenu={false}
              placement="bottom-start"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Facility Access">
        <div className="space-y-4">
          <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Warning: Destructive Action</p>
              <p className="mt-1">
                Revoking access will immediately lock out all admin and staff
                users for this facility and all its branches. Automated rules
                and alerts will be suspended.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to revoke access for{' '}
            <strong>{facility.name}</strong>? This action will be logged.
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsRevokeModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeAccess} className="w-full sm:w-auto">
              Yes, Revoke Access
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewContractModalOpen}
        onClose={closeViewContractModal}
        title="Contract Document"
        maxWidth="max-w-5xl"
        bodyClassName="p-0 overflow-hidden"
        closeOnBackdrop
        closeOnEsc>
        <div className="flex flex-col h-[80vh]">
        

          {contractPdfPreviewUrl && contractPreviewType === 'pdf' && (
            <iframe
              title="Contract document preview"
              src={contractPdfPreviewUrl}
              className="w-full flex-1"
            />
          )}

          {contractViewUrl && contractPreviewType === 'image' && (
            <div className="w-full flex-1 overflow-auto bg-slate-50">
              <img
                src={contractViewUrl}
                alt="Contract document"
                className="block max-w-full h-auto mx-auto"
              />
            </div>
          )}

          {contractViewUrl && contractPreviewType === 'other' && (
            <div className="p-4 text-sm text-slate-700">
              Preview not supported for this file type.{' '}
              <a
                href={contractViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 font-medium underline">
                Open in new tab
              </a>
              .
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};