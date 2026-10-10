"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import type { SessionData } from "@/lib/auth-client";
import { isWorkspaceSessionReady, shouldLeaveClient } from "@/lib/workspace";
import { courseApi } from "@/lib/api/course";
import { queryKeys } from "@/lib/query-keys";
import { WorkspaceSessionProvider } from "@/lib/workspace-session-context";
import { WrongWorkspace } from "./wrong-workspace";

export function WorkspaceGate({
  initialSession,
  children,
}: {
  initialSession: SessionData | null;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceSessionProvider session={initialSession}>
      <WorkspaceGateInner>{children}</WorkspaceGateInner>
    </WorkspaceSessionProvider>
  );
}

function WorkspaceGateInner({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Public catalog — start while session is still resolving so /courses
  // is cached when the gated pages mount.
  useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => courseApi.fetchAllCourses(),
    staleTime: 5 * 60 * 1000,
  });

  const rolesKnown =
    session?.user != null || isWorkspaceSessionReady(hasMounted, isPending);
  const roles = session?.user?.roles ?? [];

  if (rolesKnown && shouldLeaveClient(roles)) {
    return <WrongWorkspace roles={roles} />;
  }

  // The shell and page skeletons render while a missing server session is
  // still resolving in the browser, so data fetches are not stuck behind it.
  return <>{children}</>;
}
