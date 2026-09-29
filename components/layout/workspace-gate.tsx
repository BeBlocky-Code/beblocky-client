"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { isWorkspaceSessionReady, shouldLeaveClient } from "@/lib/workspace";
import { courseApi } from "@/lib/api/course";
import { queryKeys } from "@/lib/query-keys";
import { WrongWorkspace } from "./wrong-workspace";

function WorkspaceLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export function WorkspaceGate({ children }: { children: React.ReactNode }) {
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

  if (!isWorkspaceSessionReady(hasMounted, isPending)) {
    return <WorkspaceLoading />;
  }

  const roles = session?.user?.roles ?? [];
  if (shouldLeaveClient(roles)) {
    return <WrongWorkspace roles={roles} />;
  }

  return <>{children}</>;
}
