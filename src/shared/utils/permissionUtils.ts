// import type { SidebarItem } from "@/app/config/sidebar.config";
// import type { TPermission } from "@/app/config/permissions";

import type { TPermission } from "@/app/config/permissions";
import type { TUserPath } from "../types";

// /**
//  * Get the first allowed route from sidebar items based on user permissions and role
//  *
//  * @param sidebarItems - Array of sidebar menu items
//  * @param permissions - Array of user permissions
//  * @param roleName - User's role name
//  * @returns The URL of the first allowed route, or "/dashboard" as fallback
//  */
// export function getFirstAllowedRoute(
//   sidebarItems: SidebarItem[],
//   permissions: TPermission[] | null | undefined,
//   roleName?: string | null
// ): string {
//   // If user has SuperAdmin role, return first route
//   if (roleName === "superadmin" || roleName === "Super Admin") {
//     const firstItem = sidebarItems[0];
//     if (firstItem && firstItem.url && firstItem.url !== "#") {
//       return firstItem.url;
//     }
//   }

//   // Check permissions for each item
//   for (const item of sidebarItems) {
//     // Skip items without URL or group headers
//     if (!item.url || item.url === "#") {
//       // Check nested items
//       if (item.items && item.items.length > 0) {
//         const nestedRoute = getFirstAllowedRoute(item.items, permissions, roleName);
//         if (nestedRoute !== "/dashboard") {
//           return nestedRoute;
//         }
//       }
//       continue;
//     }

//     // Check if user has permission for this item
//     if (item.allowedPermissions && item.allowedPermissions.length > 0) {
//       const hasPermission = item.allowedPermissions.some((perm) =>
//         permissions?.includes(perm as TPermission)
//       );

//       if (hasPermission) {
//         return item.url;
//       }
//     }
//   }

//   // Fallback to dashboard
//   return "/dashboard";
// }

// /**
//  * Structure permissions from a flat array into a structured object
//  *
//  * @param permissions - Flat array of permission strings
//  * @returns Structured permissions object
//  */
// export function structurePermissions(permissions: string[]): Record<string, string[]> {
//   const structured: Record<string, string[]> = {};

//   for (const permission of permissions) {
//     // Split permission by '.' to get module and action
//     // e.g., "products.view" -> module: "products", action: "view"
//     const parts = permission.split('.');
//     const module = parts[0] || 'other';
//     const action = parts.slice(1).join('.') || permission;

//     if (!structured[module]) {
//       structured[module] = [];
//     }
//     structured[module].push(action);
//   }

//   return structured;
// }

// /**
//  * Flatten permissions from a structured object into a flat array
//  *
//  * @param structuredPermissions - Structured permissions object
//  * @returns Flat array of permission strings
//  */
// export function flattenPermissions(structuredPermissions: Record<string, string[]> | null | undefined): string[] {
//   if (!structuredPermissions) {
//     return [];
//   }

//   const flat: string[] = [];

//   for (const [module, actions] of Object.entries(structuredPermissions)) {
//     // Ensure actions is an array before iterating
//     if (Array.isArray(actions)) {
//       for (const action of actions) {
//         flat.push(`${module}.${action}`);
//       }
//     }
//   }

//   return flat;
// }




/**
 * Transforms structured permissions [{module: 'products', actions: ['view', 'create']}]
 * into a flat array of strings ['products.view', 'products.create']
 */
export const flattenPermissions = (permissions: TPermission[] | string[]): string[] => {
    if (!permissions || permissions.length === 0) return [];
    if (typeof permissions[0] === "string") return permissions as string[];

    const flattened: string[] = [];
    (permissions as TPermission[]).forEach((perm) => {
        if (perm.module === "*" || perm.module === "all") {
            flattened.push("*");
        } else {
            perm.actions.forEach((action) => {
                flattened.push(`${perm.module}.${action}`);
            });
        }
    });
    return flattened;
};

/**
 * Transforms flat permission strings ['products.view', 'products.create', '*']
 * into structured objects [{module: 'products', actions: ['view', 'create']}, {module: '*', actions: ['manage']}]
 */
export const structurePermissions = (permissions: string[]): TPermission[] => {
    if (!permissions || permissions.length === 0) return [];

    const grouped: Record<string, Set<string>> = {};
    const standardActions = ["view", "list", "create", "update", "delete", "export", "approve", "cancel", "manage", "edit"];

    permissions.forEach((p) => {
        if (typeof p !== 'string') return;
        
        // --- DATA HEALING ---
        // Clean up corrupted database artifacts from previous bugs
        // e.g. "products.list.view" -> "products.list"
        if (p.endsWith(".view")) {
             const withoutView = p.slice(0, -5);
             const subParts = withoutView.split(".");
             if (subParts.length > 1 && standardActions.includes(subParts[subParts.length - 1])) {
                 p = withoutView; // Cleaned string!
             }
        }

        if (p === "*") {
            grouped["*"] = (grouped["*"] || new Set()).add("manage");
        } else if (p.includes(".")) {
            // Split by the LAST dot to separate module from action
            const parts = p.split(".");
            const lastPart = parts.pop() || "";
            const remaining = parts.join(".");

            if (standardActions.includes(lastPart)) {
                // If it's a standard action, use it as the action
                grouped[remaining] = (grouped[remaining] || new Set()).add(lastPart);
            } else {
                grouped[remaining] = (grouped[remaining] || new Set()).add(lastPart);
            }
        } else {
            // No dot notation - treat as action view
            grouped[p] = (grouped[p] || new Set()).add("view");
        }
    });

    return Object.entries(grouped).map(([module, actionsSet]) => ({
        module,
        actions: Array.from(actionsSet),
    }));
};

/**
 * Recursively find the first route that the user is allowed to access.
 */
export const getFirstAllowedRoute = (
    items: TUserPath[],
    permissions: string[],
    roleName: string = ""
): string => {
    const rolesLower = roleName.toLowerCase();
    const isAdmin = rolesLower === "superadmin" || rolesLower === "admin" || rolesLower.includes("administrator");
    const hasGlobalWildcard = permissions.includes("*") || permissions.some(p => typeof p === 'object' && (p as { module: string }).module === '*');

    for (const item of items) {
        const isAllowed =
            isAdmin ||
            hasGlobalWildcard ||
            !item.allowedPermissions ||
            item.allowedPermissions.length === 0 ||
            item.allowedPermissions.some((p) => permissions.includes(p));

        if (isAllowed) {
            // If it's a direct link (not a parent with children only)
            if (item.url && item.url !== "#") {
                return item.url;
            }
            // If it has children, search them
            if (item.items && item.items.length > 0) {
                const nestedAllowed = getFirstAllowedRoute(item.items, permissions, roleName);
                // If we found a valid nested route, return it
                if (nestedAllowed !== "/dashboard") return nestedAllowed;
            }
        }
    }

    return "/dashboard"; // Ultimate fallback
};

/**
 * Check if a permissions array contains a specific permission.
 * Supports both flat permissions (strings) and structured permissions (objects).
 *
 * @param permissions - User permissions (flat strings or structured objects)
 * @param permission - Permission string to check (e.g., "departments.create")
 * @returns true if user has the permission
 */
export const hasPermission = (
    permissions: string[] | TPermission[],
    permission: string
): boolean => {
    if (!permissions || permissions.length === 0) return false;

    // Check if permissions are structured (objects) or flat (strings)
    const isStructured = permissions.length > 0 && typeof permissions[0] === "object";

    if (isStructured) {
        const structuredPerms = permissions as TPermission[];

        // Check for global wildcard in structured format
        const hasGlobalWildcard = structuredPerms.some((p) => p.module === "*" || p.module === "all");
        if (hasGlobalWildcard) return true;

        // Split permission into module and action
        const parts = permission.split(".");
        const targetAction = parts.pop() || "";
        const targetModule = parts.join(".");

        // Find the permission block for this module
        const permBlock = structuredPerms.find((p) => p.module === targetModule);
        if (!permBlock) return false;

        // Check if user has manage permission or the specific action
        const hasManage = permBlock.actions?.includes("manage") || permBlock.actions?.includes("*");
        const hasSpecificAction = permBlock.actions?.includes(targetAction);

        return Boolean(hasManage || hasSpecificAction);
    } else {
        // Flat string format: ["departments.view", "departments.create"]
        const flatPerms = permissions as string[];

        // Check for global wildcard in flat format
        if (flatPerms.includes("*") || flatPerms.includes("manage")) return true;

        // Exact match
        if (flatPerms.includes(permission)) return true;

        // Check for module-level manage permission
        const module = permission.split(".")[0];
        return flatPerms.includes(`${module}.manage`) || flatPerms.includes(`${module}.*`);
    }
};
