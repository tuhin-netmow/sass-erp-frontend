/**
 * Routes Generator Utility
 *
 * Converts sidebar configuration into React Router route objects.
 * Handles nested routes, layout wrappers, and permission guards.
 *
 * Features:
 * - Auto-generates routes from sidebar config
 * - Wraps routes with permission guards
 * - Handles nested layouts
 * - Supports index redirects
 */

import { Navigate, type RouteObject } from "react-router";
import type { SidebarItem } from "@/app/config/sidebar.config";
import { PermissionsGuard } from "@/shared";


// Dummy fallback page for routes without elements
const DummyPage = ({ title }: { title: string }) => (
  <div className="p-8 text-xl font-bold">{title} Page</div>
);

/**
 * Generate routes from sidebar configuration
 *
 * @param items - Sidebar menu items
 * @param parentPath - Parent route path for nested routes
 * @returns Array of React Router route objects
 */
export const generateRoutes = (
  items: SidebarItem[],
  parentPath = ""
): RouteObject[] => {
  const routes: RouteObject[] = [];

  items.forEach((item) => {
    // Skip items without URL (group headers)
    if (!item.url || item.url === "#") {
      if (item.items && item.items.length > 0) {
        routes.push(...generateRoutes(item.items, parentPath));
      }
      return;
    }

    // Convert absolute path to relative path if parentPath exists
    let relativePath = item.url;
    if (parentPath && relativePath.startsWith("/")) {
      relativePath = relativePath.replace(/^\/?/, "");
      if (relativePath.startsWith(parentPath + "/")) {
        relativePath = relativePath.replace(parentPath + "/", "");
      }
    }

    /**
     * Wrap element with permission guard if permissions are specified
     */
    const wrapWithPermission = (element: React.ReactNode) => {
      if (item.allowedPermissions && item.allowedPermissions.length > 0) {
        return (
          <PermissionsGuard allowedPermissions={item.allowedPermissions}>
            {element}
          </PermissionsGuard>
        );
      }
      return element;
    };

    /**
     * Handle items with nested children and custom layout
     */
    if (item.items && item.items.length > 0 && item.layout) {
      const children: RouteObject[] = item.items.map((child) => {
        const isIndex = child.url === item.url;
        const childPath = isIndex
          ? undefined
          : (child.url.split("/").pop() || "");
        return {
          index: isIndex,
          path: childPath,
          element: wrapWithPermission(
            child.element || <DummyPage title={child.title} />
          ),
        };
      });

      // If none of the children are index routes, add a redirect to the first child
      if (!children.some((c) => c.index)) {
        children.unshift({
          index: true,
          element: (
            <Navigate
              to={item.items[0].url.split("/").pop() || ""}
              replace
            />
          ),
        });
      }

      routes.push({
        path: relativePath,
        element: wrapWithPermission(item.layout),
        children,
      });
      return;
    }

    /**
     * Add single route
     */
    routes.push({
      path: relativePath,
      element: wrapWithPermission(
        item.element || <DummyPage title={item.title} />
      ),
    });

    /**
     * Process nested children recursively
     */
    if (item.items && item.items.length > 0) {
      routes.push(...generateRoutes(item.items, relativePath));
    }
  });

  return routes;
};
