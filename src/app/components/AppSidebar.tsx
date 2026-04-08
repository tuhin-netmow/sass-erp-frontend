/**
 * App Sidebar Component
 * Main sidebar navigation for the company app
 */

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";
import { NavMain } from "@/shared/components/NavMain";
import { sidebarItemLink } from "@/app/config/sidebar.config";
import { useGetSettingsInfoQuery } from "@/store/features/admin/settingsApiService";
import { Loader2 } from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ className, ...props }: AppSidebarProps) {
  const { data: companyProfileSettings } = useGetSettingsInfoQuery();
  const logo = companyProfileSettings?.data?.logoUrl;
  const companyName = companyProfileSettings?.data?.companyName;

  const activeTeam = {
    name: companyName || "Inleads IT",
    logo: () => (
      <div className="flex items-center justify-center">
        {logo ? (
          <img
            src={logo}
            alt={companyName || "Logo"}
            className="w-12 h-12 object-contain rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>
    ),
  };

  return (
    <Sidebar collapsible="icon" className={className} {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="text-sidebar-primary-foreground flex aspect-square justify-center rounded-lg bg-primary">
            <activeTeam.logo />
          </div>
          <div className="grid flex-1 text-start text-sm leading-tight">
            <span className="truncate font-semibold">{activeTeam.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItemLink ?? []} />
      </SidebarContent>
    </Sidebar>
  );
}
