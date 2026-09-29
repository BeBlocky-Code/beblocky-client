"use client";

import { useState, useEffect, useCallback } from "react";
import { clearSessionCache, getSession, type SessionData } from "./auth-client";

export function useSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(true);

  const refetch = useCallback(async () => {
    setIsPending(true);
    clearSessionCache();
    const { data: session } = await getSession();
    setData(session ?? null);
    setIsPending(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getSession().then(({ data: session }) => {
      if (cancelled) return;
      setData(session ?? null);
      setIsPending(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data: data ?? undefined,
    isPending,
    refetch,
  };
}
