/**
 * Admin Protected Route Component
 *
 * Wrapper for admin panel routes that require:
 * - Admin authentication
 * - Valid admin role (admin or superadmin)
 *
 * Redirects to admin login if not authenticated
 */

import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "@/store/store";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const admin = useAppSelector((state) => state.admin.admin);

  // Check if admin is authenticated
  if (!admin) {
    // Redirect to admin login with return url
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check if user has admin role
  if (admin.role !== "admin" && admin.role !== "superadmin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
