import DashboardLayout from "../../components/Layout/DashboardLayout";
import ProtectedRoute from "../../routes/ProtectedRoute";

export const StaffLayout = () => {
  return (
    <ProtectedRoute allowedRoles={["staff"]}>
      <DashboardLayout

      />
    </ProtectedRoute>
  );
};