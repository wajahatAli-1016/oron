// src/routes/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }


  // not login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // wrong role
  if (!allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "facility_admin"
        ? "/facility-admin"
        : `/${user.role}`;

    return <Navigate to={redirectPath} replace />;
  }

  return children
};

export default ProtectedRoute;