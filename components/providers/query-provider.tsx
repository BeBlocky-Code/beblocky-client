"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider wraps the application with TanStack Query's QueryClientProvider.
 *
 * This provider should be placed high in the component tree (typically in the root layout)
 * to ensure all components have access to the query client.
 *
 * Features:
 * - Uses a singleton QueryClient on the client side
 * - Creates fresh QueryClient on server to avoid cross-request state pollution
 * - Includes React Query Devtools in development mode
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create the query client once per app instance
  // Using useState ensures the client is not recreated on every render
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
