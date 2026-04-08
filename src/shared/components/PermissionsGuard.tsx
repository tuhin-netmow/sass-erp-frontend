// /**
//  * Permissions Guard Component
//  *
//  * Wrapper that checks if user has required permissions
//  * Shows unauthorized page if permissions are missing
//  */

// import { useAppSelector } from "@/store/store";
// import { Navigate } from "react-router";

// interface PermissionsGuardProps {
//   children: React.ReactNode;
//   allowedPermissions: string[];
// }

// export function PermissionsGuard({
//   children,
//   allowedPermissions,
// }: PermissionsGuardProps) {
//   const { user } = useAppSelector((state) => state.auth);

//   // Super admin has access to everything
//   if (user?.role?.name === "superadmin") {
//     return <>{children}</>;
//   }

//   // Check if user has any of the required permissions
//   const userPermissions = user?.role?.permissions || [];
//   const hasPermission = allowedPermissions.some((permission) =>
//     userPermissions.includes(permission)
//   );

//   if (!hasPermission) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// }




// import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionsGurdProps {
  children: React.ReactNode;
  allowedPermissions?: string[];
  requiredPermission?: string;
  allowedRoles?: string[];
}

/**
 * Route protection component.
 * Redirects to /unauthorized if user lacks permission or role.
 */
export const PermissionsGurd = ({
  children,
  allowedPermissions,
  requiredPermission,
  allowedRoles,
}: PermissionsGurdProps) => {
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
    console.warn(`[PermissionsGurd] Access denied to path. Required: ${requiredPermission || allowedPermissions?.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
