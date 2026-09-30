import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Network, Save, User } from 'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import type { CreateBranchRequest } from '../../services/branchService';
import {
  useCreateBranchMutation,
  useGetBranchByIdQuery,
  useGetFacilityByIdQuery,
  useGetUserByIdQuery,
  useUpdateBranchMutation,
} from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage, getApiSuccessMessage } from '../../utils/apiMessage';
import { FacilityOnboardingSkeleton, FacilityOnboardingStepSkeleton } from '../skeletons/FacilityEditSkeleton';

const emptyBranchForm = (fid: string): CreateBranchRequest => ({
  facilityId: fid,
  name: '',
  address: '',
  phone: '',
  type: 'Senior Living',
  status: 'Active',
  residentLimit: 100,
  branchAdminFirstName: '',
  branchAdminLastName: '',
  branchAdminEmail: '',
});

const parseAdminName = (name: string | null | undefined) => {
  if (!name?.trim()) {
    return { firstName: '', lastName: '' };
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const AddBranch = () => {
  const { id: facilityId, branchId } = useParams();
  const isEditMode = Boolean(branchId);
  const navigate = useNavigate();
  const toast = useToast();
  const [branchForm, setBranchForm] = useState<CreateBranchRequest | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: facility,
    isLoading: loadingFacility,
    isError: facilityError,
    error: facilityErr,
    refetch: refetchFacility,
    isFetching: fetchingFacility,
  } = useGetFacilityByIdQuery(facilityId!, { skip: !facilityId });

  const {
    data: branch,
    isLoading: loadingBranch,
    isError: branchError,
    error: branchErr,
    refetch: refetchBranch,
  } = useGetBranchByIdQuery(branchId!, { skip: !isEditMode || !branchId });

  const { data: branchAdmin } = useGetUserByIdQuery(branch?.branchAdminId ?? '', {
    skip: !isEditMode || !branch?.branchAdminId,
  });

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const isSubmitting = isCreating || isUpdating;
  const isFetching = fetchingFacility;

  useEffect(() => {
    if (!facilityId || !facility || isEditMode) return;
    setBranchForm(emptyBranchForm(facilityId));
  }, [facilityId, facility, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !facilityId || !branch) return;
    if (branch.facilityId !== facilityId) return;

    const parsedName = parseAdminName(branch.branchAdminName);

    setBranchForm({
      facilityId,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      type: branch.type,
      status: branch.status,
      residentLimit: branch.residentLimit,
      branchAdminFirstName: branchAdmin?.firstName ?? parsedName.firstName,
      branchAdminLastName: branchAdmin?.lastName ?? parsedName.lastName,
      branchAdminEmail: branchAdmin?.email ?? '',
    });
  }, [isEditMode, facilityId, branch, branchAdmin]);

  useEffect(() => {
    if (!facility) return;
    sessionStorage.setItem(`breadcrumb:facilities:${facility.id}`, facility.name);
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [facility]);

  useEffect(() => {
    if (!branch) return;
    sessionStorage.setItem(`breadcrumb:branches:${branch.id}`, branch.name);
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [branch]);

  const backToFacility = facilityId ? `/owner/facilities/${facilityId}` : '/owner/facilities';

  const pageTitle = isEditMode ? 'Edit Branch' : 'Add New Branch';
  const pageDescription = useMemo(() => {
    const facilityName = facility?.name ?? 'this facility';
    if (isEditMode) {
      return (
        <>
          Update branch and admin details for{' '}
          <span className="font-medium text-slate-700">{facilityName}</span>.
        </>
      );
    }
    return (
      <>
        Create a branch and branch admin for{' '}
        <span className="font-medium text-slate-700">{facilityName}</span>. The admin will
        receive an email to set their password.
      </>
    );
  }, [facility?.name, isEditMode]);

  const setField = (field: keyof CreateBranchRequest, value: string | number) => {
    setBranchForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!facilityId || !branchForm) return;

    setSubmitError(null);

    try {
      if (isEditMode && branchId) {
        const updated = await updateBranch({
          id: branchId,
          facilityId,
          body: {
            name: branchForm.name,
            address: branchForm.address,
            phone: branchForm.phone,
            type: branchForm.type,
            status: branchForm.status,
            residentLimit: Number(branchForm.residentLimit),
            branchAdminFirstName: branchForm.branchAdminFirstName,
            branchAdminLastName: branchForm.branchAdminLastName,
            branchAdminEmail: branchForm.branchAdminEmail,
          },
        }).unwrap();
        toast.success(getApiSuccessMessage(updated, 'Branch updated successfully.'));
      } else {
        const created = await createBranch({
          ...branchForm,
          facilityId,
          residentLimit: Number(branchForm.residentLimit),
        }).unwrap();
        toast.success(getApiSuccessMessage(created, 'Branch created successfully.'));
      }
      navigate(backToFacility);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        isEditMode ? 'Failed to update branch' : 'Failed to create branch',
      );
      setSubmitError(message);
      toast.error(message);
    }
  };

  if (!facilityId) {
    return (
      <div className="max-w-4xl mx-auto p-4 rounded-lg bg-red-50 text-red-700 text-sm">
        Invalid link.{' '}
        <Link to="/owner/facilities" className="font-medium text-brand-600 hover:text-brand-700 underline">
          Back to facilities
        </Link>
      </div>
    );
  }

  const loading = loadingFacility || (isEditMode && loadingBranch);
  if (loading) {
    return (
      <FacilityOnboardingSkeleton/>
    );
  }

  const loadError = facilityError
    ? getApiErrorMessage(facilityErr, 'Failed to load facility')
    : branchError
      ? getApiErrorMessage(branchErr, 'Failed to load branch')
      : null;

  const branchFacilityMismatch =
    isEditMode && branch && branch.facilityId !== facilityId;

  if (facility && !branchForm && !loadError && !branchFacilityMismatch) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-slate-500 text-sm">
        Preparing form…
      </div>
    );
  }

  if (loadError || branchFacilityMismatch || !branchForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {branchFacilityMismatch
            ? 'This branch does not belong to the selected facility.'
            : loadError || 'Unable to open this page.'}
        </div>
        <Link to={backToFacility} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Back to facility
        </Link>
        {facilityError || branchError ? (
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              void refetchFacility();
              if (isEditMode) void refetchBranch();
            }}
          >
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  const minResidentLimit = isEditMode ? branch?.currentResidents ?? 1 : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Link
            to={backToFacility}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{pageDescription}</p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={() => navigate(backToFacility)}>
            Cancel
          </Button>
          <Button icon={Save} isLoading={isSubmitting || isFetching} onClick={() => void handleSubmit()}>
            {isEditMode ? 'Save Changes' : 'Create Branch'}
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{submitError}</div>
      )}

      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Network className="h-4 w-4 text-slate-400" />
            Branch information
          </h3>
          <div className="space-y-4">
            <Input
              label="Branch Name *"
              placeholder="e.g. Sunrise Downtown"
              value={branchForm.name}
              onChange={(e) => setField('name', e.target.value)}
            />
            <Input
              label="Address *"
              placeholder="123 Main St"
              value={branchForm.address}
              onChange={(e) => setField('address', e.target.value)}
            />
            <Input
              label="Phone Number *"
              placeholder="(555) 000-0000"
              value={branchForm.phone}
              onChange={(e) => setField('phone', e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Type *</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={branchForm.type}
                  onChange={(e) => setField('type', e.target.value)}
                >
                  <option>Senior Living</option>
                  <option>Assisted Living</option>
                  <option>Memory Care</option>
                  <option>Residential</option>
                </select>
              </div>
              <Input
                label="Resident Limit *"
                type="number"
                placeholder="100"
                min={minResidentLimit}
                value={branchForm.residentLimit}
                onChange={(e) => setField('residentLimit', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Status *</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                value={branchForm.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
            {isEditMode && branch ? (
              <p className="text-xs text-slate-500">
                Current residents: {branch.currentResidents} (limit cannot be set below this)
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-slate-400" />
            Branch admin account
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                placeholder="John"
                value={branchForm.branchAdminFirstName}
                onChange={(e) => setField('branchAdminFirstName', e.target.value)}
              />
              <Input
                label="Last Name *"
                placeholder="Doe"
                value={branchForm.branchAdminLastName}
                onChange={(e) => setField('branchAdminLastName', e.target.value)}
              />
            </div>
            <Input
              label="Email *"
              type="email"
              placeholder="admin@branch.com"
              value={branchForm.branchAdminEmail}
              onChange={(e) => setField('branchAdminEmail', e.target.value)}
            />
            {isEditMode ? (
              <p className="text-xs text-slate-500">
                Changing the admin email updates their login. Password is not changed here.
              </p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};
