// pages/Facilities.jsx
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Building2, FileText, Network, Users, Eye, ArrowUpRight, Activity, Mail, Edit2 } from "lucide-react";
import { Button, Badge } from "../components/UI";
import { Facility } from "../types";

import { useAuth } from "../context/AuthContext";


// Define columns with render functions
export const Faciltescolumns = [
  {
    label: "Facility Info",
    render: (facility: Facility) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{facility.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{facility.type}</p>
        </div>
      </div>
    )
  },
  {
    label: "Admin Contact",
    render: (facility: Facility) => (
      <>
        <p className="font-medium text-slate-900">{facility.facilityAdminName}</p>
        <p className="text-xs text-slate-500">{facility.phone}</p>
      </>
    )
  },
  {
    label: "Contract Period",
    render: (facility: Facility) => (
      <div className="flex items-center gap-2 text-slate-600">
        <FileText className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-medium">
          {new Date(facility.contractStart).toLocaleDateString()} - {new Date(facility.contractEnd).toLocaleDateString()}
        </span>
      </div>
    )
  },
  {
    label: "Branches",
    render: (facility: Facility) => (
      <div className="flex items-center gap-1.5 text-slate-700">
        <Network className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{facility.totalBranches}</span>
      </div>
    )
  },
  {
    label: "Residents",
    render: (facility: Facility) => (
      <div className="flex items-center gap-1.5 text-slate-700">
        <Users className="h-4 w-4 text-slate-400" />
        <span className="font-medium">{facility.totalResidents}</span>
      </div>
    )
  },
  {
    label: "Status",
    render: (facility: Facility) => (
      <Badge
        variant={
          facility.status === 'Active' ? 'success' :
            facility.status === 'Pending' ? 'warning' :
              facility.status === 'Suspended' ? 'default' : 'danger'
        }
      >
        {facility.status}
      </Badge>
    )
  }
];

// Define actions with render (optional - can also use simple path)
export const FacilitesActions = [
  {
    render: (facility: Facility) => (
      <Link to={`/owner/facilities/${facility.id}`}>
        <Button variant="ghost" size="sm" icon={Eye}>
          View
        </Button>
      </Link>
    )
  },
];

export const dashboardFacilitesActions = [
  {
    render: (facility: Facility) => (
      <Link to={`/owner/facilities/${facility.id}`}>
       <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
            title="View resident"
            aria-label="View resident"
          >
            <Eye className="h-4 w-4" />
          </span>
      </Link>
    )
  },
];


// Columns configuration
export const RecentFaciltescolumns = [
  {
    key: "name",
    label: "Facility Name",
    render: (facility) => (
      <div>
        <p className="font-medium text-slate-900">{facility.name}</p>
        <p className="text-xs text-slate-500">{facility.type}</p>
      </div>
    )
  },
  {
    key: "status",
    label: "Status",
    render: (facility) => (
      <Badge
        variant={
          facility.status === 'Active' ? 'success' :
            facility.status === 'Pending' ? 'warning' :
              facility.status === 'Suspended' ? 'default' : 'danger'
        }
      >
        {facility.status}
      </Badge>
    )
  },
  { key: "totalBranches", label: "Branches" },
  { key: "totalResidents", label: "Residents" }
];

// 1. Get Full Name
const getFullName = (resident) => {
  return `${resident.firstName} ${resident.lastName}`;
};

// 2. Calculate Age from Date of Birth
const getAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// 3. Get Health State Color
const getHealthStateColor = (healthState: string) => {
  switch (healthState) {
    case 'Stable':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Slight Deviation':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Concerning Trend':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'Early Deterioration':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    case 'Active Deterioration':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'Recovery':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Good':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Critical':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Recovering':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// 4. Format Date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

const formatLastLogin = (dateString?: string) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '---';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatCalendarDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatLastVitalsDate = (dateString?: string) => {
  if (!dateString?.trim()) return '---';

  const trimmed = dateString.trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) return '---';
  return formatCalendarDate(date);
};

export const Reidencecolumns = [
  {
    label: "Resident",
    render: (resident) => {
      const fullName = getFullName(resident);
      const initials = `${resident?.firstName?.[0] || ""}${resident?.lastName?.[0] || ""}`.toUpperCase() || "—";
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold shrink-0 overflow-hidden">
            {resident.photoUrl ? (
              <img
                src={resident.photoUrl}
                alt={fullName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Signed URL may expire; fall back to initials (list view keeps it simple).
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.textContent = initials;
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{fullName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {getAge(resident.dob)} yrs • {resident.gender}
            </p>
          </div>
        </div>
      );
    }
  },
  {
    label: "Room",
    render: (resident) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
        {resident.room}
      </span>
    )
  },
  {
    label: "Health State",
    render: (resident) => (
      <Badge
        variant={
          resident.healthState === 'Stable'
            ? 'success'
            : resident.healthState === 'Slight Deviation'
              ? 'info'
              : resident.healthState === 'Concerning Trend'
                ? 'danger'
                : resident.healthState === 'Early Deterioration'
                  ? 'danger'
                  : resident.healthState === 'Active Deterioration'
                    ? 'danger'
                    : resident.healthState === 'Recovery'
                      ? 'success'
                      : 'default'
        }
      >
        {resident.healthState}
      </Badge>
    )
  },
  {
    label: "Status",
    render: (resident) => (
      <Badge
        variant={
          resident.status === 'Discharged'
            ? 'success'
            : resident.status === 'Hospitalized'
              ? 'info'
              : resident.status === 'InPatient'
                ? 'danger'
                : 'default'
        }
      >
        {resident.status}
      </Badge>
    )
  },
  {
    label: "Last Vitals",
    render: (resident) => (
      <div className="flex items-center gap-2">
        <Activity className={`h-4 w-4 ${resident.lastVitalsDate ? 'text-brand-500' : 'text-slate-300'}`} />
        <span className="text-xs text-slate-600">
          {formatLastVitalsDate(resident.lastVitalsDate)}
        </span>
      </div>
    )
  }
];

export const Residenceactions = [
  {
    render: (resident) => (
      <div className="flex items-center gap-2">
        <Link to={`/admin/residents/${resident.id}`}>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
            title="View resident"
            aria-label="View resident"
          >
            <Eye className="h-4 w-4" />
          </span>
        </Link>

        <Link to={`/admin/residents/${resident.id}/edit`}>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-fg shadow-sm transition-colors hover:bg-primarySoft"
            title="Edit resident"
            aria-label="Edit resident"
          >
            <Edit2 className="h-4 w-4" />
          </span>
        </Link>
      </div>
    )
  }
];

export const StaffResidenceactions = [
  {
    render: (resident) => (
      <Link to={`/staff/residents/${resident.id}`}>
        <Button variant="ghost" size="sm" icon={Eye}>
          View
        </Button>
      </Link>
    )
  }
];
export const Aditlogscolumns = [
  {
    label: "Timestamp",
    render: (log) => (
      <div>
        <p className="font-medium text-slate-900">
          {new Date(log.timestamp).toLocaleDateString()}
        </p>
        <p className="text-xs text-slate-500">
          {new Date(log.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>
    )
  },
  {
    label: "User",
    render: (log) => (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
          {log.user.split(' ').map((n) => n[0]).join('')}
        </div>
        <span className="font-medium text-slate-900">{log.user}</span>
      </div>
    )
  },
  {
    label: "Action",
    render: (log) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
        {log.action}
      </span>
    )
  },
  {
    label: "Details",
    render: (log) => (
      <div
        className="text-slate-600 max-w-md truncate"
        title={log.details}
      >
        {log.details}
      </div>
    )
  }
];


// Helper to check if review is overdue
const isReviewOverdue = (reviewDate) => {
  return new Date(reviewDate) < new Date();
};

// Care Plans Table Columns Configuration
export const CarePlanColumns = [
  {
    label: "Resident",
    render: (plan) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs shrink-0">
          {plan.firstName?.[0] || ''}{plan.lastName?.[0] || ''}
        </div>
        <span className="font-medium text-slate-900">
          {plan.residentName || `${plan.firstName} ${plan.lastName}`}
        </span>
      </div>
    )
  },
  {
    label: "Room",
    render: (plan) => (
      <span className="text-slate-600">
        {plan.room || 'N/A'}
      </span>
    )
  },
  {
    label: "Last Updated",
    render: (plan) => (
      <span className="text-slate-600">
        {formatDate(plan.generatedDate)}
      </span>
    )
  },
  {
    label: "Next Review",
    render: (plan) => (
      <span className={`font-medium ${isReviewOverdue(plan.reviewDate) ? 'text-red-600' : 'text-slate-600'}`}>
        {formatDate(plan.reviewDate)}
      </span>
    )
  }
];



export const CarePlanActions = [
  {
    render: (plan) => (
      <Link to={`/admin/residents/${plan.residentId}`}>
        <Button variant="ghost" size="sm" icon={Eye}>
          View
        </Button>
      </Link>
    )
  }
];

export const StaffColumns = [
  {
    label: "Staff Member",
    render: (staff) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium shrink-0">
          {staff.firstName?.[0] || ''}{staff.lastName?.[0] || ''}
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {getFullName(staff)}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" /> {staff.email}
          </p>
        </div>
      </div>
    )
  },
  {
    label: "Role",
    render: (staff) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
        {staff.role}
      </span>
    )
  },
  {
    label: "Status",
    render: (staff) => (
      <Badge variant={staff.status === 'Active' ? 'success' : 'default'}>
        {staff.status}
      </Badge>
    )
  },
  {
    label: "Permissions",
    render: (staff) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {staff.permissions?.slice(0, 2).map((perm, idx) => (
          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            {perm}
          </span>
        ))}
        {staff.permissions?.length > 2 && (
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            +{staff.permissions.length - 2} more
          </span>
        )}
      </div>
    )
  },
  {
    label: "Last Login",
    render: (staff) => (
      <div className="flex items-center gap-2">
        <Activity className={`h-4 w-4 ${staff.status === 'Active' ? 'text-brand-500' : 'text-slate-300'}`} />
        <span className="text-xs text-slate-600">
          {formatLastLogin(staff.lastActive)}
        </span>
      </div>
    )
  }
];

// shared/TableColumns.tsx

export const StaffColumnsForFacilityAdmin = (branches?: any[]) => [
  {
    label: "Staff Member",
    render: (staff) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium shrink-0">
          {staff.firstName?.[0] || ''}{staff.lastName?.[0] || ''}
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {getFullName(staff)}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" /> {staff.email}
          </p>
        </div>
      </div>
    )
  },
  {
    label: "Branch",  // ✅ Branch column added here
    render: (staff) => {
      const branch = branches?.find(b => b.id === staff.branchId);
      return (
        <div className="text-sm text-slate-700">
          {branch?.name || 'N/A'}
        </div>
      );
    }
  },
  {
    label: "Role",
    render: (staff) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
        {staff.role}
      </span>
    )
  },
  {
    label: "Status",
    render: (staff) => (
      <Badge variant={staff.status === 'Active' ? 'success' : 'default'}>
        {staff.status}
      </Badge>
    )
  },
  {
    label: "Last Login",
    render: (staff) => (
      <div className="flex items-center gap-2">
        <Activity className={`h-4 w-4 ${staff.status === 'Active' ? 'text-brand-500' : 'text-slate-300'}`} />
        <span className="text-xs text-slate-600">
          {formatLastLogin(staff.lastActive)}
        </span>
      </div>
    )
  }
];

// Staff Actions - Using Link directly (NO handle function needed)
export const StaffActions = [
  {
    render: (staff) => (
      <Link to={`/admin/staff/${staff.id}/edit`}>
        <Button variant="ghost" size="sm" icon={Edit2}>
          Edit
        </Button>
      </Link>
    )
  }
];

export const BranchesColumns = [
  {
    label: "Branch Info",
    render: (branch) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
          <Network className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {branch.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {branch.type}
          </p>
        </div>
      </div>
    )
  },
  {
    label: "Admin Contact",
    render: (branch) => (
      <>
        <p className="font-medium text-slate-900">
          {branch.branchAdminName}
        </p>
        <p className="text-xs text-slate-500">{branch.phone}</p>
      </>
    )
  },
  {
    label: "Residents",
    render: (branch) => {
      const usagePercent = Math.round(
        (branch.currentResidents / branch.residentLimit) * 100
      );
      const barColor = usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500';

      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-700">
              {branch.currentResidents}
            </span>
            <span className="text-slate-500">
              of {branch.residentLimit}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${barColor}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      );
    }
  },
  {
    label: "Status",
    render: (branch) => (
      <Badge
        variant={
          branch.status === 'Active' ? 'success' :
            branch.status === 'Pending' ? 'warning' : 'danger'
        }
      >
        {branch.status}
      </Badge>
    )
  }
];

// Branches Actions Configuration
export const BranchesActions = [
  {
    render: (branch) => (
      <Link to={`/facility-admin/branches/${branch.id}`}>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
          title="View Branch"
          aria-label="View resident"
        >
          <Eye className="h-4 w-4" />
        </span>
      </Link>
    )
  }
];

export const BranchesCompactColumns = [
  {
    label: "Branch Name",
    render: (branch) => (
      <div>
        <p className="font-medium text-slate-900">
          {branch.name}
        </p>
        <p className="text-xs text-slate-500">{branch.type}</p>
      </div>
    )
  },
  {
    label: "Status",
    render: (branch) => (
      <Badge
        variant={
          branch.status === 'Active' ? 'success' :
            branch.status === 'Pending' ? 'warning' : 'danger'
        }
      >
        {branch.status}
      </Badge>
    )
  },
  {
    label: "Utilization",
    render: (branch) => {
      const usagePercent = Math.round(
        (branch.currentResidents / branch.residentLimit) * 100
      );
      const barColor = usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500';

      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
            <div
              className={`h-2 rounded-full ${barColor}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {branch.currentResidents}/{branch.residentLimit}
          </span>
        </div>
      );
    }
  }
];

// Branches Actions Configuration
export const BranchesCompactActions = [
  {
    render: (branch) => (
      <Link to={`/facility-admin/branches/${branch.id}`}>
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
          title="View branch"
          aria-label="View branch"
        >
          <Eye className="h-4 w-4" />
        </span>
      </Link>
    )
  }
];


