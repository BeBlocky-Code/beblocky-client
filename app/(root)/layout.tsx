import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WorkspaceGate } from "@/components/layout/workspace-gate";
import { getServerWorkspaceSession } from "@/lib/server/workspace-session";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialSession = await getServerWorkspaceSession();

  return (
    <WorkspaceGate initialSession={initialSession}>
      <DashboardLayout>{children}</DashboardLayout>
    </WorkspaceGate>
  );
}
