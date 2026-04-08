import { usePermissions } from "@/shared/hooks/usePermissions";
import React from "react";

interface PermissionGateProps {
    children: React.ReactNode;
    /**
     * Single permission dot notation (e.g., 'sales.orders.view')
     */
    permission?: string;
    /**
     * Array of permissions to check (check if user has ANY of these)
     */
    anyOf?: string[];
    /**
     * Array of permissions to check (check if user has ALL of these)
     */
    allOf?: string[];
    /**
     * If user does NOT have permission, show this fallback
     */
    fallback?: React.ReactNode;
    /**
     * Case-insensitive list of allowed roles.
     */
    allowedRoles?: string[];
}

/**
 * Higher-order component to wrap UI elements and check permissions.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    permission,
    anyOf,
    allOf,
    fallback = null,
    allowedRoles,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, roleName } = usePermissions();

    // 1. Role-based check if allowedRoles is provided
    const isRoleAllowed = allowedRoles
        ? allowedRoles.some((r) => r.toLowerCase() === roleName.toLowerCase())
        : true;

    // 2. Permission-based checks
    let isPermAllowed = true;
    if (permission) isPermAllowed = hasPermission(permission);
    else if (anyOf) isPermAllowed = hasAnyPermission(anyOf);
    else if (allOf) isPermAllowed = hasAllPermissions(allOf);

    // Final result
    const canAccess = isRoleAllowed && isPermAllowed;

    if (!canAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default PermissionGate;
