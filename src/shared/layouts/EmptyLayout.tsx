/**
 * Empty Layout
 *
 * Minimal layout with no header, sidebar, or footer
 * Used for: standalone pages, iframes, print previews
 */

import { Outlet } from "react-router";

export function EmptyLayout() {
  return <Outlet />;
}
