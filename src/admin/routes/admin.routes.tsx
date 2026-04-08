/**
 * Admin Panel Routes
 * Protected routes for admin and super admin panel
 */

import { Outlet, Navigate, type RouteObject } from "react-router";
import { AdminProtectedRoute } from "@/shared/components/AdminProtectedRoute";

// Import admin pages
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminUsersPage from "@/admin/pages/AdminUsersPage";
import AdminCompaniesPage from "@/admin/pages/AdminCompaniesPage";
import AdminPlansPage from "@/admin/pages/AdminPlansPage";
import AdminAddPlanPage from "@/admin/pages/AdminAddPlanPage";
import AdminEditPlanPage from "@/admin/pages/AdminEditPlanPage";
import AdminModulesPage from "@/admin/pages/AdminModulesPage";
import AdminProfilePage from "@/admin/pages/AdminProfilePage";
import AdminSettingsPage from "@/admin/pages/AdminSettingsPage";

/**
 * Admin Panel Routes Configuration
 */
export const adminRoutes: RouteObject[] = [
  {
    element: (
      <AdminProtectedRoute>
        <Outlet />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "companies",
        element: <AdminCompaniesPage />,
      },
      {
        path: "plans",
        element: <AdminPlansPage />,
      },
      {
        path: "plans/add",
        element: <AdminAddPlanPage />,
      },
      {
        path: "plans/edit/:planId",
        element: <AdminEditPlanPage />,
      },
      {
        path: "modules",
        element: <AdminModulesPage />,
      },
      {
        path: "profile",
        element: <AdminProfilePage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
    ],
  },
];
