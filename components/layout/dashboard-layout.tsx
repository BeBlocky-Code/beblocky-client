import type React from "react";

import { AppSidebar, type SidebarNavItem } from "./app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: "home",
    roles: ["student", "parent", "teacher", "admin"],
  },
  {
    title: "Courses",
    href: "/courses",
    icon: "courses",
    roles: ["student", "parent", "teacher", "admin"],
  },
  {
    title: "Progress",
    href: "/progress",
    icon: "progress",
    label: "New",
    roles: ["parent", "teacher", "admin"],
  },
  {
    title: "Goal",
    href: "/goals",
    icon: "progress",
    label: "New",
    roles: ["student"],
  },
  {
    title: "Upgrade",
    href: "/upgrade",
    icon: "upgrade",
    label: "Pro",
    roles: ["student", "parent"],
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar items={sidebarItems} />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
