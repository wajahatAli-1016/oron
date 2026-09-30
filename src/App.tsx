// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Login } from "./pages/Login";
import { SetPassword } from "./pages/SetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ForgotPasswordVerify } from "./pages/ForgotPasswordVerify";
import { Notifications } from "./components/Notification/Notification";
import { OwnerLayout } from "./pages/dashboard/OwnerLayout";
import { OwnerDashboard } from "./components/owner/OwnerDashboard";
import { FacilityAdminLayout } from "./pages/dashboard/FaciltyAdminLayout";
import { FacilityAdminDashboard } from "./components/facility-admin/FacilityAdminDashboard";
import { AdminLayout } from "./pages/dashboard/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { StaffLayout } from "./pages/dashboard/StaffLayout";
import { StaffDashboard } from "./components/staff/StaffDashboard";
import { BranchLists } from "./components/branches/BranchesList";
import { BranchDetails } from "./components/branches/BranchDetails";
import { AuditLog } from "./components/audit logs/AuditLogs";
import { CarePlan } from "./components/care plans/CarePlans";
import { FacilitiesList } from "./components/facility/FacilitiesList";
import { FacilityOnboarding } from "./components/facility/FacilityOnboarding";
import { FacilityDetails } from "./components/facility/FacilityDetails";
import { AddBranch } from "./components/facility/AddBranch";
import { OwnerReport } from "./components/reports/OwnerReport";
import { FacAdminReport } from "./components/reports/FacAdminReport";
import { AdminReport } from "./components/reports/AdminReport";
import { ResidentDetails } from "./components/residents/ResidentDetails";
import Residents from "./components/residents/ResidentsList";
import { AddRes } from "./components/residents/AddResident";
import { RulesEngines } from "./components/rules engine/RulesEngine";
import StaffPage from "./components/staff/StaffManagement";
import { AddStaff } from "./components/staff/AddStaff";
import { StaffDetails } from "./components/staff/StaffDetails";
import { TaskManagements } from "./components/task/TaskPage";
import { CreateTask } from "./components/task/CreateTask";
import { VitalsEntry } from "./components/vital/EntryVital";



const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/verify" element={<ForgotPasswordVerify />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Owner nested routes */}
      <Route path="/owner" element={<OwnerLayout/>}>
        <Route index element={<OwnerDashboard />} />
        <Route path="facilities" element={<FacilitiesList />} />
        <Route path="facilities/new" element={<FacilityOnboarding />} />
        <Route path="facilities/:id/edit" element={<FacilityOnboarding />} />
        <Route path="facilities/:id" element={<FacilityDetails />} />
        <Route path="facilities/:id/branches/new" element={<AddBranch />} />
        <Route path="facilities/:id/branches/:branchId/edit" element={<AddBranch />} />
        <Route path="rules" element={<RulesEngines />} />
        <Route path="reports" element={<OwnerReport />} />
        <Route path="audit-logs" element={<AuditLog />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="residents/:id" element={<ResidentDetails />} />
      </Route>

      {/* Facility Admin nested routes */}
      <Route path="/facility-admin" element={<FacilityAdminLayout/> }>
        <Route index element={<FacilityAdminDashboard />} />
        <Route path="branches" element={<BranchLists />} />
        <Route path="branches/:id" element={<BranchDetails />} />
        <Route path="residents" element={<Residents />} />
        <Route path="residents/new" element={<AddRes />} />
        <Route path="residents/:id/edit" element={<AddRes />} />
        <Route path="residents/:id" element={<ResidentDetails />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="staff/new" element={<AddStaff />} />
        <Route path="staff/:id/edit" element={<AddStaff />} />
        <Route path="staff/:id" element={<StaffDetails />} />
        <Route path="reports" element={<FacAdminReport />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Admin nested routes */}
      <Route path="/admin" element={<AdminLayout/> }>
        <Route index element={<AdminDashboard />} />
        <Route path="residents" element={<Residents  />} />
        <Route path="residents/new" element={<AddRes/>} />
        <Route path="residents/:id/edit" element={<AddRes/>} />
        <Route path="residents/:id" element={<ResidentDetails />} />
        <Route path="vitals" element={<VitalsEntry />} />
        <Route path="care-plans" element={<CarePlan />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="staff/new" element={<AddStaff />} />
        <Route path="staff/:id/edit" element={<AddStaff />} />
        <Route path="staff/:id" element={<StaffDetails />} />
        <Route path="tasks" element={<TaskManagements />} />
        <Route path="tasks/new" element={<CreateTask />} />
        <Route path="reports" element={<AdminReport />} />
        <Route path="logs" element={<AuditLog />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Staff nested routes */}
      <Route path="/staff" element={<StaffLayout/>}>
        <Route index element={<StaffDashboard/>} />
        <Route path="tasks" element={<TaskManagements />} />
        <Route path="residents" element={<Residents />} />
        <Route path="residents/:id" element={<ResidentDetails />} />
        <Route path="vitals" element={<VitalsEntry />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

    </Routes>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}