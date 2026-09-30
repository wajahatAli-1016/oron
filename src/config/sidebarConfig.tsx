import {
  Building2,
  Users,
  Activity,
  ClipboardList,
  Settings,
  Bell,
  BarChart3,
  FileText,
  HeartPulse,
  Network
} from "lucide-react";

export const sidebarConfig = {
  owner: [
    { name: "Dashboard", path: "/owner", icon: BarChart3 },
    { name: "Facilities", path: "/owner/facilities", icon: Building2 },
    { name: "Rules Engine", path: "/owner/rules", icon: Settings },
    { name: "Reports", path: "/owner/reports", icon: FileText },
    { name: "Audit Logs", path: "/owner/audit-logs", icon: FileText },
    { name: "Notifications", path: "/owner/notifications", icon: Bell }
  ],

  facility_admin: [
    { name: "Dashboard", path: "/facility-admin", icon: BarChart3 },
    { name: "Branches", path: "/facility-admin/branches", icon: Network },
    { name: "Residents", path: "/facility-admin/residents", icon: Users },
    { name: "Staff", path: "/facility-admin/staff", icon: Users },
    { name: "Reports", path: "/facility-admin/reports", icon: FileText },
    { name: "Notifications", path: "/facility-admin/notifications", icon: Bell }
  ],

  admin: [
    { name: "Dashboard", path: "/admin", icon: BarChart3 },
    { name: "Residents", path: "/admin/residents", icon: Users },
    { name: "Vitals", path: "/admin/vitals", icon: Activity },
    { name: "Tasks", path: "/admin/tasks", icon: ClipboardList },
    { name: "Staff", path: "/admin/staff", icon: Users },
    { name: "Reports", path: "/admin/reports", icon: FileText },
    { name: "Notifications", path: "/admin/notifications", icon: Bell }
  ],

  staff: [
    { name: "Dashboard", path: "/staff", icon: BarChart3 },
    { name: "My Tasks", path: "/staff/tasks", icon: ClipboardList },
    { name: "Residents", path: "/staff/residents", icon: Users },
    { name: "Enter Vitals", path: "/staff/vitals", icon: HeartPulse },
    { name: "Notifications", path: "/staff/notifications", icon: Bell }
  ]
};

export const roleDisplay = {
  owner: "Platform Owner",
  facility_admin: "Facility Admin",
  admin: "Branch Admin",
  staff: "Staff"
};