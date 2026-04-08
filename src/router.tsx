/**
 * Main Routes Configuration
 *
 * Central route registry that imports and combines all route sections:
 * - Landing Pages (Public)
 * - Auth Pages (Public)
 * - Company App (Protected)
 * - Admin Panel (Protected)
 */

import { createBrowserRouter } from "react-router";

// Import layouts
// import { LandingLayout } from "@/landing/layout";
import LandingLayout from "./landing/layout/LandingLayout";
import { AppLayout } from "@/app/layout";
import { AdminLayout } from "@/admin/layout";

// Import route sections
import { landingRoutes } from "@/landing/routes";
import { authRoutes } from "@/auth/routes";
import { appRoutes } from "@/app/routes";
import { adminRoutes } from "@/admin/routes";

// Import common pages from shared
import { NotFound } from "@/shared/pages";
import { UnauthorizedPage } from "@/shared/pages";

// Import layouts
import { AuthLayout } from "@/shared/layouts";

/**
 * Root Router Configuration
 */
export const rootRouter = createBrowserRouter([
  // ============================================
  // LANDING PAGE ROUTES (Public)
  // ============================================
  {
    path: "/",
    element: <LandingLayout />,
    children: landingRoutes,
  },

  // ============================================
  // AUTH ROUTES (Public)
  // ============================================
  {
    path: "/",
    element: <AuthLayout />,
    children: authRoutes,
  },

  // ============================================
  // COMPANY APP ROUTES (Protected)
  // ============================================
  {
    path: "/dashboard",
    element: <AppLayout />,
    children: appRoutes,
  },

  // ============================================
  // ADMIN PANEL ROUTES (Protected)
  // ============================================
  {
    path: "/admin",
    element: <AdminLayout />,
    children: adminRoutes,
  },

  // ============================================
  // SPECIAL ROUTES
  // ============================================
  { path: "/unauthorized", element: <UnauthorizedPage /> },

  // ============================================
  // 404 - NOT FOUND
  // ============================================
  { path: "*", element: <NotFound /> },
]);

export default rootRouter;
