"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WorkspaceGate } from "@/components/layout/workspace-gate";
import type React from "react";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <WorkspaceGate>
      <DashboardLayout>{children}</DashboardLayout>
    </WorkspaceGate>
  );
}
