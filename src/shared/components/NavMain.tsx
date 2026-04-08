/**
 * NavMain Component
 * Main navigation component for sidebars
 */

"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { usePermissions } from "@/shared/hooks/usePermissions";

// Types
export interface NavSubItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  allowedPermissions?: string[];
}

export interface NavItem {
  title: string;
  url?: string;
  icon?: React.ElementType;
  items?: NavSubItem[];
  isActive?: boolean;
  layout?: React.ReactNode;
  allowedPermissions?: string[];
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const { hasAnyPermission } = usePermissions();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isHide =
            item.allowedPermissions &&
            item.allowedPermissions.length > 0 &&
            !hasAnyPermission(item.allowedPermissions);
          if (!item.title) return null;
          if (isHide) return null;

          const hasSubItems = Array.isArray(item.items) && item.items.length > 0;

          // Special logic: skip children if layout and url exist
          if (item.layout && item.url) {
            return (
              <SidebarMenuItem key={item.title} className="cursor-pointer">
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link to={item.url} onClick={handleLinkClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // CASE 1: With sub-items -> collapsible
          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger className="cursor-pointer" asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((subItem) => {
                        const isSubHide =
                          subItem.allowedPermissions &&
                          subItem.allowedPermissions.length > 0 &&
                          !hasAnyPermission(subItem.allowedPermissions);
                        if (!subItem.title) return null;
                        if (isSubHide) return null;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url} onClick={handleLinkClick}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // CASE 2: No sub-items -> simple menu link
          return (
            <SidebarMenuItem key={item.title} className="cursor-pointer">
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url!} onClick={handleLinkClick}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
