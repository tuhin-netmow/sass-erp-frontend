/**
 * 🔒 RBAC Permission Configuration
 * 
 * This file defines the standard permissions used across the frontend.
 * It is organized to match the backend's structured RBAC system:
 * Module: The feature or resource domain (e.g., 'products', 'sales.orders')
 * Action: The standard operation (view, create, edit, delete, export, approve, manage)
 */

// ==========================================
// NEW: Strict Backend Aligned Array Format
// Designed for the RolePermissionsMatrix UI
// ==========================================

export const ACTIONS = {
  VIEW: 'view',
  LIST: 'list',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  APPROVE: 'approve',
  CANCEL: 'cancel',
  MANAGE: 'manage',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export const MODULES = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  STAFFS: 'staffs',
  SALES: 'sales',
  ACCOUNTING: 'accounting',
  USERS: 'users',
  ROLES: 'roles',
  SETTINGS: 'settings',
  REPORTS: 'reports',
  RAW_MATERIALS: 'raw_materials',
  PRODUCTION: 'production',
  ROUTE_OPERATIONS: 'route_operations',
  HELP: 'help',
  PAYROLL: 'payroll',
  SYSTEM: 'system'
} as const;

export type ActionType = typeof ACTIONS[keyof typeof ACTIONS];
export type ModuleType = typeof MODULES[keyof typeof MODULES];

export const APP_PERMISSIONS: Array<{
  module: string;
  label: string;
  actions: string[];
}> = [
  { module: MODULES.DASHBOARD, label: 'Dashboard', actions: [ACTIONS.VIEW] },
  { module: MODULES.PRODUCTS, label: 'Products', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE] },
  { module: MODULES.CUSTOMERS, label: 'Customers', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.SUPPLIERS, label: 'Suppliers', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.STAFFS, label: 'Staffs', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE] },
  { module: MODULES.SALES, label: 'Sales & Orders', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.APPROVE] },
  { module: MODULES.ACCOUNTING, label: 'Accounting', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.PAYROLL, label: 'Payroll', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE] },
  { module: MODULES.PRODUCTION, label: 'Production', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.RAW_MATERIALS, label: 'Raw Materials', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.REPORTS, label: 'Reports', actions: [ACTIONS.VIEW, ACTIONS.EXPORT] },
  { module: MODULES.USERS, label: 'Users', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.ROLES, label: 'Roles', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
  { module: MODULES.SETTINGS, label: 'Settings', actions: [ACTIONS.VIEW, ACTIONS.UPDATE] },
  { module: MODULES.SYSTEM, label: 'System', actions: [ACTIONS.VIEW] }
  , { module: MODULES.HELP, label: 'Help', actions: [ACTIONS.VIEW] }
  , { module: MODULES.ROUTE_OPERATIONS, label: 'Route Operations', actions: [ACTIONS.VIEW, ACTIONS.LIST, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] }
];

// ==========================================
// LEGACY: Object Mapping Format
// Retained to prevent undefined reference crashes across all UI components calling `DashboardPermission.STATS`
// ==========================================

export const SuperAdminPermission = {
  ACCESS_ALL: "*" as const,
};



// Helper: Generate available permissions array for UI components
export const generateAvailablePermissions = () => {
  const permissions: Array<{ value: string; label: string; category: string }> = [];

  APP_PERMISSIONS.forEach(({ module, label: category, actions }) => {
    actions.forEach((action) => {
      const value = `${module}.${action}`;
      // Capitalize action and category properly (e.g. "view" -> "View")
      const actionLabel = action.split(/[_.]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const categoryLabel = category.split(/[_.]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      const label = `${actionLabel} ${categoryLabel}`;
      
      permissions.push({
        value,
        label,
        category: categoryLabel,
      });
    });
  });

  permissions.push({
    value: SuperAdminPermission.ACCESS_ALL,
    label: "Super Admin (Full Access)",
    category: "System",
  });

  return permissions;
};

// --- Type Definitions ---
export type TPermission = {
  module: string;
  actions: string[];
};

export type TPermissions = string[] | TPermission[];
export type PermissionType = string;
