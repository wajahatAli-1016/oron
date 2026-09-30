import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Save, Shield, User as UserIcon } from "lucide-react";
import { Card, Button, Input } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  useCreateStaffMutation,
  useGetBranchesPaginatedQuery,
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
} from "../../store/api/oronApi";
import { Branch, StaffMember } from "../../types";
import { getApiErrorMessage } from "../../utils/apiMessage";

const permissionOptions = [
  "View Residents",
  "Edit Vitals",
  "Manage Care Plans",
  "View Reports",
  "Manage Tasks",
];

export const AddStaff = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { id: staffId } = useParams();
  const isEditMode = Boolean(staffId);

  const isFacilityAdmin = user?.role === "facility_admin";
  const isAdmin = user?.role === "admin";
  const basePath = isFacilityAdmin ? "/facility-admin" : "/admin";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    role: "Caregiver" as StaffMember["role"],
    branchId: "",
    permissions: permissionOptions.slice(0, 2),
  });

  const {
    data: staff,
    isLoading,
    isError: staffLoadFailed,
    error: staffLoadErr,
  } = useGetStaffByIdQuery(staffId!, { skip: !isEditMode || !staffId });

  const { data: branchesData } = useGetBranchesPaginatedQuery(
    { page: 1, limit: 500 },
    { skip: !isFacilityAdmin },
  );
  const branches =
    branchesData?.data.filter((b) => b.facilityId === user?.facilityId) ?? [];

  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();

  useEffect(() => {
    if (!staff) return;
    setForm((prev) => ({
      ...prev,
      firstName: staff.firstName ?? "",
      middleName: staff.middleName ?? "",
      lastName: staff.lastName ?? "",
      email: staff.email ?? "",
      role: staff.role,
      branchId: staff.branchId ?? "",
      permissions: staff.permissions?.length ? staff.permissions : prev.permissions,
    }));
  }, [staff]);

  useEffect(() => {
    if (!staffLoadFailed) return;
    const message = getApiErrorMessage(staffLoadErr, "Failed to load staff member");
    setError(message);
    toast.error(message);
  }, [staffLoadFailed, staffLoadErr, toast]);

  useEffect(() => {
    if (!isFacilityAdmin || branches.length === 0) return;
    setForm((prev) =>
      prev.branchId ? prev : { ...prev, branchId: branches[0].id },
    );
  }, [branches, isFacilityAdmin]);

  const branchSelectOptions = useMemo(() => {
    if (!isFacilityAdmin) return [];
    return branches;
  }, [branches, isFacilityAdmin]);

  const submit = async () => {
    if (!user?.facilityId) return;

    if (!form.firstName.trim() || !form.lastName.trim() || (!isEditMode && !form.email.trim())) {
      const message = "Please fill first name, last name, and email.";
      setError(message);
      toast.error(message);
      return;
    }

    const targetBranchId = isAdmin ? user.branchId || "" : form.branchId;
    if (!isEditMode && !targetBranchId) {
      const message = "Please select a branch.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditMode && staffId) {
        await updateStaff({
          id: staffId,
          body: {
            firstName: form.firstName.trim(),
            middleName: form.middleName.trim() || undefined,
            lastName: form.lastName.trim(),
            role: form.role,
            status: "Active",
            permissions: form.permissions,
          },
        }).unwrap();
        toast.success("Staff member updated successfully.");
      } else {
        await createStaff({
          branchId: targetBranchId,
          facilityId: user.facilityId,
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim() || undefined,
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: form.role,
          status: "Active",
          permissions: form.permissions,
        }).unwrap();
        toast.success("Staff member created successfully.");
      }
      navigate(`${basePath}/staff`);
    } catch (err) {
      const message = getApiErrorMessage(err, isEditMode ? "Failed to update staff member" : "Failed to create staff member");
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/staff`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Staff Member" : "Add Staff Member"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode
              ? "Update staff profile and save changes."
              : "Create a staff profile and assign permissions. They will receive an email to set their password."}
          </p>
        </div>
        <Button icon={Save} onClick={submit} isLoading={isSubmitting}>
          {isEditMode ? "Save" : "Create"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="First Name"
            placeholder="Jane"
            icon={UserIcon}
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          />
          <Input
            label="Middle Name (Optional)"
            placeholder="A."
            value={form.middleName}
            onChange={(e) => setForm((p) => ({ ...p, middleName: e.target.value }))}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="jane@facility.com"
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            disabled={isEditMode}
          />
        </div>

        {isFacilityAdmin && !isEditMode && (
          <div className="mt-4 space-y-1">
            <label className="block text-sm font-medium text-slate-700">Branch</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              value={form.branchId}
              onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value }))}
            >
              <option value="">Select Branch</option>
              {branchSelectOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4 space-y-1">
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as StaffMember["role"] }))}
          >
            <option value="Caregiver">Caregiver</option>
            <option value="Nurse">Nurse</option>
            <option value="Coordinator">Coordinator</option>
          </select>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-500" /> Permissions
          </label>
          <div className="space-y-2">
            {permissionOptions.map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  checked={form.permissions.includes(perm)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      permissions: e.target.checked
                        ? [...prev.permissions, perm]
                        : prev.permissions.filter((p) => p !== perm),
                    }))
                  }
                />
                <span className="text-sm text-slate-700">{perm}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

