import { usePermissions } from "@/shared/hooks/usePermissions";
import { Navigate } from "react-router";

interface PermissionsGuardProps {
  children: React.ReactNode;
  allowedPermissions?: string[];
  requiredPermission?: string;
  allowedRoles?: string[];
}

/**
 * Route protection component.
 * Redirects to /unauthorized if user lacks permission or role.
 */
export const PermissionsGuard = ({
  children,
  allowedPermissions,
  requiredPermission,
  allowedRoles,
}: PermissionsGuardProps) => {
  const { hasPermission, hasAnyPermission, roleName } = usePermissions();

  // 1. Role Check (if provided)
  let isAllowed = true;
  if (allowedRoles && allowedRoles.length > 0) {
    isAllowed = allowedRoles.some((r) => r.toLowerCase() === roleName.toLowerCase());
  }

  // 2. Permission Check (if provided)
  if (isAllowed) {
    if (requiredPermission) {
      isAllowed = hasPermission(requiredPermission);
    } else if (allowedPermissions && allowedPermissions.length > 0) {
      isAllowed = hasAnyPermission(allowedPermissions);
    }
  }

  // 3. Final Check
  if (!isAllowed) {
    console.warn(`[PermissionsGuard] Access denied to path. Required: ${requiredPermission || allowedPermissions?.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Export with old name for backward compatibility
export const PermissionsGurd = PermissionsGuard;
