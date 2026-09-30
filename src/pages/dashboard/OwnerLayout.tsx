// src/pages/owner/OwnerDashboard.tsx
import DashboardLayout from "../../components/Layout/DashboardLayout";
import ProtectedRoute from "../../routes/ProtectedRoute";

export const OwnerLayout = () => {
  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <DashboardLayout/>
    </ProtectedRoute>
  );
};