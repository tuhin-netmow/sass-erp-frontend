import { Navigate } from "react-router";
import { useAppSelector } from "@/store/store";

/**
 * 🌐 Multi-tenant Root Redirect
 *
 * Redirects users based on hostname and authentication status:
 *
 * Main Domain (lvh.me, localhost):
 *   → /modules (public landing page)
 *
 * Company Subdomain (acme.lvh.me, inleads-it-solution.lvh.me):
 *   - Authenticated → /dashboard (company ERP dashboard)
 *   - Not authenticated → /login
 */
export default function RootRedirect() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const hostname = window.location.hostname;

  // 🌐 Check if we're on a company subdomain
  const isCompanySubdomain =
    hostname.includes('.lvh.me') &&
    hostname !== 'lvh.me' &&
    !hostname.startsWith('www.');

  // Company subdomain: redirect based on auth status
  if (isCompanySubdomain) {
    const isAuthenticated = user && token;
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
  }

  // Main domain: redirect to modules page
  return <Navigate to="/modules" replace />;
}
