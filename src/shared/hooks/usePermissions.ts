import { useAppSelector } from "@/store/store";
import { useCallback, useMemo } from "react";

/**
 * Hook to check if the current user has specific permissions.
 * Matches backend permission logic.
 */
 export const perm = (module: string, action: string) => `${module}.${action}`

export const usePermissions = () => {
    const user = useAppSelector((state) => state.auth.user);
    const role = user?.role;

    // Handle both string role (admin_user) and object role (company user)
    const roleString = typeof role === 'string' ? role : role?.name || "";
    const permissions = useMemo(() => {
        if (typeof role === 'object' && role?.permissions) {
            return role.permissions;
        }
        return [];
    }, [role]);
    const roleName = useMemo(() => roleString.toLowerCase(), [roleString]);

    /**
     * Check if user has a specific permission.
     * Supports:
     * - Superadmin/Admin bypass (via role.role or role.name)
     * - Global wildcard '*'
     * - Structured permissions: [{ module: 'sales', actions: ['view', 'create'] }]
     * - Flat permissions: ["sales.view", "sales.create"]
     */
    const hasPermission = useCallback(
        (permission: string | undefined): boolean => {
            if (!user || !role || !permission) return false;

            // 1. Role name bypass (check both 'role' and 'name' fields)
            const roleKey = (role?.displayName || "").toLowerCase();
            const roleNameKey = (role?.name || "").toLowerCase();
            const isBypassed = 
                roleKey === "admin" || roleKey === "superadmin" || 
                roleNameKey === "admin" || roleNameKey === "superadmin";

            if (isBypassed) return true;

            // 2. Identify if permissions are structured (objects) or flat (strings)
            const isStructured = permissions.length !== 0 && typeof permissions[0] === "object";

            if (isStructured) {
                const structuredPerms = permissions as unknown as Array<{ module: string; actions: string[] }>;

                // a. Check for global wildcard in structured format
                const hasGlobalWildcard = structuredPerms.some((p) => p.module === "*" || p.module === "all");
                if (hasGlobalWildcard) return true;

                // b. Find permission - check if the WHOLE string is the module (granular format)
                const fullMatchModule = structuredPerms.find((p) => p.module === permission);
                if (fullMatchModule) {
                    if (fullMatchModule.actions.includes("view") || fullMatchModule.actions.includes("manage") || fullMatchModule.actions.includes("*"))
                        return true;
                }

                // c. Standard split (Dot notation modulo action)
                const dots = permission.split(".");
                const targetAction = dots.pop() || "";
                const targetModule = dots.join(".");

                const permBlock = structuredPerms.find((p) => p.module === targetModule);
                if (!permBlock) return false;

                const hasManage = Boolean(permBlock.actions?.includes("manage") || permBlock.actions?.includes("*"));
                const hasSpecificAction = Boolean(targetAction && permBlock.actions?.includes(targetAction));

                return hasManage || hasSpecificAction;
            } else {
                // Flat string format: ["sales.view"]
                const flatPerms = permissions as string[];

                // a. Exact match or global wildcard
                if (flatPerms.includes("*") || flatPerms.includes(permission) || flatPerms.includes("manage")) return true;

                // b. Module-level manage check
                const module = permission.split(".")[0];
                return flatPerms.includes(`${module}.manage`) || flatPerms.includes(`${module}.*`);
            }
        },
        [user, role, permissions]
    );

    /**
     * Check if user has ANY of the provided permissions
     */
    const hasAnyPermission = useCallback(
        (perms: string[]): boolean => {
            return perms.some((p) => hasPermission(p));
        },
        [hasPermission]
    );

    /**
     * Check if user has ALL of the provided permissions
     */
    const hasAllPermissions = useCallback(
        (perms: string[]): boolean => {
            return perms.every((p) => hasPermission(p));
        },
        [hasPermission]
    );

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        permissions,
        roleName,
        isAdmin: roleName === "admin" || roleName === "superadmin",
        isSuperAdmin: roleName === "superadmin",
    };
};


