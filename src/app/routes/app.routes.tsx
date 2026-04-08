/**
 * Company App Routes
 * Protected routes for the main ERP application
 */

import { Outlet, type RouteObject } from "react-router";
import ProtectedRoute from "@/shared/components/routeGuards/ProtectedRoute";
import DashboardRedirect from "@/shared/components/routeGuards/DashboardRedirect";
import { generateRoutes } from "@/app/utils/routesGenerator";
import { sidebarItemLink } from "@/app/config/sidebar.config";

// Import pages directly from app/pages
import BillingStatus from "@/app/pages/billing/BillingStatus";

// Generate dynamic dashboard routes from sidebar config
const dashboardRoutes = generateRoutes(sidebarItemLink, "dashboard");

/**
 * Company App Routes Configuration
 */
export const appRoutes: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRedirect />,
      },
      {
        path: "billing/status",
        element: <BillingStatus />,
      },
      ...dashboardRoutes,
    ],
  },
];
