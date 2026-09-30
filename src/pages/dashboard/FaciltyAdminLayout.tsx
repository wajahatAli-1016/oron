// src/pages/facility-admin/FacilityAdminDashboard.tsx
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ProtectedRoute from "../../routes/ProtectedRoute";


export const FacilityAdminLayout = () => {
  return (
    <ProtectedRoute allowedRoles={["facility_admin"]}>
      <DashboardLayout     />
    </ProtectedRoute>
  );
};