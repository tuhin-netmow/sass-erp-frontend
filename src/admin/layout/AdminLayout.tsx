import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { AdminSidebar } from "@/admin/components";
import { AdminProfileDropdown } from "@/admin/components";
import { ThemeSwitch } from "@/shared/components/theme";
import { Link, Outlet } from "react-router";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { setAdmin } from "@/store/features/admin/adminSlice";
import { useEffect } from "react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.admin.admin) as AdminUser | null;

  // Load admin from localStorage on mount
  useEffect(() => {
    const adminUserStr = localStorage.getItem("admin_user");
    if (adminUserStr && !admin) {
      const adminUser = JSON.parse(adminUserStr);
      dispatch(setAdmin(adminUser));
    }
  }, [dispatch, admin]);

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AdminSidebar className="print:hidden" />
      <SidebarInset className="overflow-y-auto overflow-x-hidden flex flex-col h-full bg-background">
        <header className="flex h-14 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-gray-100 sticky top-0 z-30 print-hidden">
          <div className="flex items-center gap-2 px-4 w-full bg-background/20 backdrop-blur-lg">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full text-red-600 dark:text-red-300 font-semibold">
                {admin?.role === "superadmin" ? "Super Admin" : "Admin"}
              </span>
              <ThemeSwitch />
              <AdminProfileDropdown />
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-10 w-full flex-1">
          <Outlet />
        </main>
        <footer>
          <div className="p-4 text-center text-sm text-muted-foreground print-hidden">
            © 2026 KIRA ERP Solution | Made with ❤️ by{" "}
            <Link
              to="https://www.netmow.com"
              className="text-muted-foreground hover:underline"
              target="_blank"
            >
              NETMOW
            </Link>
            {" "} | All rights reserved.
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
