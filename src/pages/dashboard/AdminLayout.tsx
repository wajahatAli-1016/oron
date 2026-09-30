import DashboardLayout from "../../components/Layout/DashboardLayout";
import ProtectedRoute from "../../routes/ProtectedRoute";

export const AdminLayout = () => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout/>
    </ProtectedRoute>
  );
};