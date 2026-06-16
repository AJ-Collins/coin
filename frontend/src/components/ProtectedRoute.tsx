import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[] | string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c14] text-white">
        Loading...
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && user?.role) {
    const upperAllowedRoles = allowedRoles.map((role) => role.toUpperCase());
    const upperUserRole = user.role.toUpperCase();

    if (!upperAllowedRoles.includes(upperUserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}