import {
  LayoutDashboard,
  Ticket,
  Users,
  UserRound,
  UserGroup,
  FolderTree,
  Tickets,
  FilePlus
} from "lucide-react";

import type { UserRole } from "@/types/user";
import type { NavigationItem } from "@/components/custom/ApplicationSidebar";

export const navigation: Record<UserRole, NavigationItem[]> = {
  admin: [
    {
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: UserGroup,
    },
    {
      title: "Categories",
      url: "/category",
      icon: FolderTree,
    },

  ],

  dispatcher: [
    {
      title: "Overview",
      url: "/dispatcher",
      icon: LayoutDashboard,
    },
    {
      title: "New Tickets",
      url: "/newTicket",
      icon: Ticket,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: Users,
    },
  ],

  staff: [
    {
      title: "Overview",
      url: "/staff",
      icon: LayoutDashboard,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Tickets,
    },
    {
      title: "New Ticket",
      url: "/newTicket",
      icon: Ticket,
    },

  ],

  agent: [
    {
      title: "Overview",
      url: "/agent",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: UserRound,
    },
  ],

  customer: [
    {
      title: "Dashboard",
      url: "/customer",
      icon: LayoutDashboard,
    },
    {
      title: "New Complaint",
      url: "/newComplaint",
      icon: FilePlus,
    },
  ],
};



