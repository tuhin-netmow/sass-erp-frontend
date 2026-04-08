import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";

import { AppSidebar } from "@/app/components/AppSidebar";
import { ProfileDropdown } from "@/shared/components/header/ProfileDropdown";
import { ThemeSwitch } from "@/shared/components/theme";

import { Link, Outlet } from "react-router";
import { useAuthUserQuery } from "@/store/features/auth/authApiService";
import { useAppSettings } from "@/shared/hooks/useAppSettings";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { useAppSelector } from "@/store/store";
import { selectCurrentUser, selectCurrentCompany } from "@/store/features/auth/authSlice";
import { getSubdomainInfo } from "@/shared/utils/subdomain";
import type { User } from "@/shared/types/auth/users.types";
import { Building2 } from "lucide-react";

export default function AppLayout() {
  const { data: settings } = useGetSettingsInfoQuery();
  useAppSettings(settings?.data);

  // Subscribe to auth user to keep permissions in sync when tags are invalidated
  useAuthUserQuery();

  const user = useAppSelector(selectCurrentUser) as User | null;
  const company = useAppSelector(selectCurrentCompany);

  // Get subdomain info to show company portal badge
  const subdomainInfo = getSubdomainInfo();
  const isCompanyPortal = subdomainInfo.isCompanyPortal;
  const companyName =
    company?.name ||
    (subdomainInfo.subdomain
      ? subdomainInfo.subdomain.charAt(0).toUpperCase() + subdomainInfo.subdomain.slice(1)
      : "");

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar className="print:hidden" />
      <SidebarInset className="overflow-y-auto overflow-x-hidden flex flex-col h-full bg-background">
        <header className="flex h-14 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-gray-100 sticky top-0 z-30 print-hidden">
          <div className="flex items-center gap-2 px-4 w-full bg-background/20 backdrop-blur-lg">
            <SidebarTrigger className="-ml-1 cursor-pointer" />

            {/* Company Portal Badge */}
            {isCompanyPortal && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 rounded-full border border-blue-200 dark:border-blue-800">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {companyName}
                </span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-4">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-blue-600 dark:text-blue-300 font-semibold">
                {user?.role?.displayName || "User"}
              </span>
              <ThemeSwitch />
              <ProfileDropdown />
            </div>
          </div>
        </header>
        <main className="p-6 lg:p-10 w-full flex-1">
          <Outlet />
        </main>
        <footer>
          <div className="p-4 text-center text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-3 print-hidden">
            &copy; {new Date().getFullYear()} ERP. Designed and Developed by{" "}
            <Link
              to="https://inleadsit.com.my"
              className="flex items-center gap-2"
              target="_blank"
            >
              <img
                src="https://inleadsit.com.my/wp-content/uploads/2023/07/favicon-2.png"
                alt=""
                className="w-5 h-5"
              />
              Inleads IT
            </Link>
            .
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
