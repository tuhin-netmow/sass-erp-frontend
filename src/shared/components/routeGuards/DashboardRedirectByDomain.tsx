import { Navigate } from "react-router";
import { useAppSelector } from "@/store/store";

/**
 * 🌐 Multi-tenant Dashboard Redirect
 *
 * Redirects /dashboard based on hostname:
 *
 * Main Domain (lvh.me, localhost):
 *   → /admin (super admin panel for managing packages/companies)
 *
 * Company Subdomain (acme.lvh.me, inleads-it-solution.lvh.me):
 *   → /dashboard (company ERP dashboard - stays on same path)
 */
export default function DashboardRedirectByDomain() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const hostname = window.location.hostname;

  // 🌐 Check if we're on a company subdomain
  const isCompanySubdomain =
    hostname.includes('.lvh.me') &&
    hostname !== 'lvh.me' &&
    !hostname.startsWith('www.');

  // Main domain: redirect to super admin panel
  if (!isCompanySubdomain) {
    return <Navigate to="/admin" replace />;
  }

  // Company subdomain: must be authenticated to access dashboard
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Already on company subdomain and authenticated - let DashboardRedirect handle it
  return <Navigate to="/dashboard" replace />;
}
