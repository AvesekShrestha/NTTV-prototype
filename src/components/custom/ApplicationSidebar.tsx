import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  Settings,
  ChevronsUpDown,
} from "lucide-react";

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
  useSidebar,
} from "../ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { logout } from "@/lib/auth";

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
};

type User = {
  name: string;
  role: string;
  email?: string;
};

type ApplicationSidebarProps = {
  navigation: NavigationItem[];
  user: User;
  activePath?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
};

const ApplicationSidebar = ({
  navigation,
  user,
  activePath,
  onProfileClick,
  onSettingsClick,
}: ApplicationSidebarProps) => {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;

  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login")

  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/80 bg-white font-sans text-slate-900"
    >
      {/* Brand Header */}
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#003b7a] text-xs font-bold tracking-wider text-white shadow-sm">
            NTC
          </div>

          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Nepal Telecom
            </span>

            <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
              Internal Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                const isActive =
                  currentPath === item.url ||
                  (item.url !== "/" && currentPath.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        className={`relative flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${isActive
                          ? "bg-slate-100 font-semibold text-[#003b7a]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        {isActive && (
                          <span className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-[#003b7a] group-data-[collapsible=icon]:hidden" />
                        )}

                        <Icon
                          className={`size-4 shrink-0 transition-colors ${isActive
                            ? "text-[#003b7a]"
                            : "text-slate-400"
                            }`}
                        />

                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>

                        {item.badge && (
                          <span className="ml-auto rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700 group-data-[collapsible=icon]:hidden">
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

      {/* User Footer */}
      <SidebarFooter className="border-t border-slate-100 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              {/* Single button: no SidebarMenuButton inside the trigger */}
              <DropdownMenuTrigger
                className="
                  flex h-12 w-full items-center gap-2 rounded-md
                  px-2 text-left outline-none
                  transition-colors
                  hover:bg-slate-100
                  focus-visible:ring-2
                  focus-visible:ring-[#003b7a]/30
                  data-[state=open]:bg-slate-100
                  group-data-[collapsible=icon]:justify-center
                "
              >
                {/* Avatar */}
                <div className="flex size-8 shrink-0 items-center justify-center rounded-[100%] bg-slate-900 text-xs font-semibold text-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* User Information */}
                <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-slate-900">
                    {user.name}
                  </span>

                  <span className="truncate text-[11px] text-slate-500">
                    {user.role}
                  </span>
                </div>

                {/* Dropdown Icon */}
                <ChevronsUpDown className="ml-auto size-4 shrink-0 text-slate-400 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side={
                  isMobile
                    ? "bottom"
                    : isCollapsed
                      ? "right"
                      : "top"
                }
                align="end"
                sideOffset={8}
                className="z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-semibold leading-none text-slate-900">
                        {user.name}
                      </p>

                      <p className="text-[11px] leading-none text-slate-500">
                        {user.email || user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-slate-100" />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={onProfileClick}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <UserIcon className="size-4 text-slate-500" />
                    <span>View Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={onSettingsClick}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    <Settings className="size-4 text-slate-500" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-slate-100" />

                <DropdownMenuGroup onClick={handleLogout}>
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                  >
                    <LogOut className="size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ApplicationSidebar;
