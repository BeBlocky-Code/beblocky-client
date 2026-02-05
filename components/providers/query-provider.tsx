"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { useState, type ReactNode, lazy, Suspense } from "react";

// Lazy load devtools only in development
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? lazy(() =>
        import("@tanstack/react-query-devtools").then((mod) => ({
          default: mod.ReactQueryDevtools,
        }))
      )
    : () => null;

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
 * - Includes React Query Devtools in development mode (lazy loaded)
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create the query client once per app instance
  // Using useState ensures the client is not recreated on every render
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <Suspense fallback={null}>
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
