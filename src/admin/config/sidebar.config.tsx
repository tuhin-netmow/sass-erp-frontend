/**
 * Admin Panel Sidebar Configuration
 *
 * This file defines the sidebar menu structure for the admin panel.
 * Each item represents a menu item for admin/super admin functions.
 *
 * Properties:
 * - title: Display name
 * - url: Route path
 * - icon: Lucide icon component
 * - element: React component to render
 * - allowedRoles: Array of roles that can access (admin, superadmin)
 */

import { LayoutDashboard, Users, Building2, CreditCard, User, Settings, Package } from "lucide-react";

export interface AdminSidebarItem {
  title: string;
  url: string;
  icon?: any;
  element?: React.ReactNode;
  allowedRoles?: ("admin" | "superadmin")[];
}

export const adminSidebarConfig: AdminSidebarItem[] = [
  // ============================================
  // DASHBOARD
  // ============================================
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    element: <div>Admin Dashboard</div>, // Replace with actual component
    allowedRoles: ["admin", "superadmin"],
  },

  // ============================================
  // USERS MANAGEMENT
  // ============================================
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    element: <div>Users Management</div>,
    allowedRoles: ["superadmin"],
  },

  // ============================================
  // COMPANIES MANAGEMENT
  // ============================================
  {
    title: "Companies",
    url: "/admin/companies",
    icon: Building2,
    element: <div>Companies Management</div>,
    allowedRoles: ["superadmin"],
  },

  // ============================================
  // SUBSCRIPTION PLANS
  // ============================================
  {
    title: "Plans",
    url: "/admin/plans",
    icon: CreditCard,
    element: <div>Subscription Plans</div>,
    allowedRoles: ["superadmin"],
  },

  // ============================================
  // MODULES MANAGEMENT
  // ============================================
  {
    title: "Modules",
    url: "/admin/modules",
    icon: Package,
    element: <div>Modules Management</div>,
    allowedRoles: ["superadmin"],
  },

  // ============================================
  // PROFILE
  // ============================================
  {
    title: "Profile",
    url: "/admin/profile",
    icon: User,
    element: <div>Admin Profile</div>,
    allowedRoles: ["admin", "superadmin"],
  },

  // ============================================
  // SETTINGS
  // ============================================
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    element: <div>Admin Settings</div>,
    allowedRoles: ["admin", "superadmin"],
  },
];

// Export as alias
export const adminSidebarItems = adminSidebarConfig;
