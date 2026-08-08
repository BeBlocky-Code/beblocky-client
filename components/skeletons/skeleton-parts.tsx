/**
 * Building blocks for page skeletons.
 *
 * These mirror the real layout primitives used across the app (page header
 * banner, stats grid, course card, list row) so a skeleton reads as the same
 * page rather than a generic grey box.
 *
 * Deliberately free of "use client" and framer-motion: every skeleton is
 * server-renderable, so `loading.tsx` files ship no extra client JS.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Matches the container/spacing used by `(root)` pages. */
export function PageShellSkeleton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto px-4 sm:px-6 py-4 sm:py-6", className)}>
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}

/**
 * The `bg-muted/40` banner every dashboard page opens with: icon + title,
 * subtitle, then a row of inline stats and/or actions.
 */
export function PageHeaderSkeleton({
  stats = 2,
  actions = 1,
  centered = false,
}: {
  stats?: number;
  actions?: number;
  centered?: boolean;
}) {
  return (
    <div className="bg-muted/40 border-b border-border rounded-lg p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className={cn(centered && "text-center")}>
          <div
            className={cn(
              "flex items-center gap-2 sm:gap-3",
              centered && "justify-center"
            )}
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-48 sm:h-9 sm:w-64" />
          </div>
          <Skeleton
            className={cn("mt-3 h-4 w-64 max-w-full", centered && "mx-auto")}
          />
        </div>

        {(stats > 0 || actions > 0) && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {stats > 0 && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {Array.from({ length: stats }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            )}
            {actions > 0 && (
              <div className="flex gap-2">
                {Array.from({ length: actions }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-28 rounded-md" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Mirrors `components/shared/stats-card.tsx`. */
export function StatsCardSkeleton({ showProgress = false }: { showProgress?: boolean }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      {showProgress && <Skeleton className="mt-2 h-2 w-full rounded-full" />}
      <Skeleton className="mt-2 h-3 w-32" />
    </Card>
  );
}

export function StatsGridSkeleton({
  count = 4,
  columns = 4,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** A titled card with `rows` lines of body text. */
export function SectionCardSkeleton({
  rows = 3,
  titleWidth = "w-40",
  className,
}: {
  rows?: number;
  titleWidth?: string;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className={cn("h-5", titleWidth)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${92 - i * 14}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}

/** Progress bar card: label + percentage + track. */
export function ProgressCardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/** One row of the "Recent activity" / children list pattern. */
export function ListRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 max-w-full" />
          <Skeleton className="h-3 w-28 max-w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}

export function ListCardSkeleton({
  rows = 3,
  titleWidth = "w-40",
}: {
  rows?: number;
  titleWidth?: string;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className={cn("h-5", titleWidth)} />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Mirrors `components/shared/course-card.tsx`: media strip, title, meta, CTA. */
export function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export function CourseGridSkeleton({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
        columns === 3 && "lg:grid-cols-3"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Search field + pill tab bar that sits above the course/children grids. */
export function FiltersRowSkeleton({ tabs = 3 }: { tabs?: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-10 w-full rounded-md sm:max-w-sm" />
      <div className="flex gap-2">
        {Array.from({ length: tabs }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Centred single-card layout shared by the status pages (payment result,
 * account deletion, maintenance).
 */
export function CenteredCardSkeleton({
  rows = 3,
  actions = 1,
}: {
  rows?: number;
  actions?: number;
}) {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center space-y-3 text-center">
          <Skeleton className="mx-auto h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-4 w-64 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
          {actions > 0 && (
            <div className="space-y-2 pt-2">
              {Array.from({ length: actions }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
