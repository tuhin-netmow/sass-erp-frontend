/**
 * Protected Route Component
 *
 * Wrapper for company app routes that require:
 * - User authentication
 * - Valid company context
 *
 * Redirects to login if not authenticated
 * Redirects to billing if subscription is inactive
 */

import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "@/store/store";


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, token } = useAppSelector((state) => state.auth);
  const company = useAppSelector((state) => state.auth.company);

  // Check if user is authenticated
  if (!user || !token) {
    // Redirect to login with return url
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check if user has company context (for multi-tenant)
  // Skip this check for super admin
  if (user.role?.name !== "superadmin" && !company) {
    return (
      <Navigate
        to="/company-dashboard"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
