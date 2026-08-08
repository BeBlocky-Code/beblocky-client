"use client";

import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a new QueryClient instance with optimized defaults for BeBlocky.
 *
 * Default configurations:
 * - staleTime: 2 minutes (data considered fresh for this duration)
 * - gcTime: 30 minutes (unused data kept in cache for back-navigation)
 * - refetchOnWindowFocus: true (refresh data when user returns to tab)
 * - retry: 2 times with exponential backoff
 *
 * These defaults can be overridden per-query as needed.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 2 minutes
        // During this time, cached data is returned immediately without refetching
        staleTime: 2 * 60 * 1000,

        // Keep unused data in cache for 30 minutes
        // Allows instant data on back-navigation
        gcTime: 30 * 60 * 1000,

        // Refetch when window regains focus only if data is stale
        refetchOnWindowFocus: false,

        // Don't refetch on mount if data is still fresh
        refetchOnMount: false,

        // Retry failed requests 2 times with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Don't refetch on reconnect by default (reduces unnecessary requests)
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Singleton QueryClient for client-side usage
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets or creates the QueryClient singleton.
 * On the server, always creates a new client to avoid cross-request state pollution.
 * On the browser, reuses the same client for the entire session.
 */
export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is important for React Strict Mode and Fast Refresh
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
