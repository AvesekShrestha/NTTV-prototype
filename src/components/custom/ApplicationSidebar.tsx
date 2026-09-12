import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
};

type User = {
  name: string;
  role: string;
};

type ApplicationSidebarProps = {
  navigation: NavigationItem[];
  user: User;
  activePath?: string;
};

const ApplicationSidebar = ({
  navigation,
  user,
  activePath,
}: ApplicationSidebarProps) => {
  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#003b7a] text-sm font-bold text-white">
            NTC
          </div>

          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Nepal Telecom
          </span>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;

                const isActive =
                  activePath === item.url ||
                  (item.url !== "/" &&
                    activePath?.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <Icon />

                        <span>{item.title}</span>

                        {item.badge && (
                          <span className="ml-auto text-xs group-data-[collapsible=icon]:hidden">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User */}
      <SidebarFooter className="border-t border-slate-100 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="mt-1 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 group-data-[collapsible=icon]:justify-center">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#003b7a] text-xs font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {user.name}
                </p>

                <p className="truncate text-[11px] text-slate-500">
                  {user.role}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ApplicationSidebar;
