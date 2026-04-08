import { usePermissions } from "@/shared/hooks/usePermissions";
import { Navigate } from "react-router";
import { sidebarItemLink } from "@/app/config/sidebar.config";
import { getFirstAllowedRoute, flattenPermissions } from "@/shared/utils/permissionUtils";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm } from "@/shared/hooks/usePermissions";
import { getSubdomainInfo } from "@/shared/utils/subdomain";
import Dashboard from "@/app/pages/dashboard/Dashboard";
import CompanyDashboard from "@/app/pages/dashboard/CompanyDashboard";

export default function DashboardRedirect() {
    const { hasPermission, permissions, roleName, isAdmin } = usePermissions();

    // Check if on company portal - show company-specific dashboard
    const subdomainInfo = getSubdomainInfo();
    const isCompanyPortal = subdomainInfo.isCompanyPortal;

    const hasDashboardAccess = isAdmin || hasPermission(perm(MODULES.DASHBOARD, ACTIONS.VIEW));

    if (hasDashboardAccess) {
        // Show CompanyDashboard if on company subdomain, otherwise show regular Dashboard
        if (isCompanyPortal) {
            return <CompanyDashboard />;
        }
        return <Dashboard />;
    }

    // Not allowed to see dashboard, find first allowed route
    const flatPermissions = flattenPermissions(permissions);
    const firstRoute = getFirstAllowedRoute(sidebarItemLink, flatPermissions, roleName);

    // If no route found or fallback is dashboard (avoid loop), go to unauthorized
    if (firstRoute === "/dashboard") {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Navigate to={firstRoute} replace />;
}
