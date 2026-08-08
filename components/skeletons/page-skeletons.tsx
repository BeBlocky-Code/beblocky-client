/**
 * One skeleton per route, composed from `skeleton-parts`.
 *
 * Each is shaped like the page it stands in for, so the layout does not jump
 * when real data lands. They are used twice: by the route's `loading.tsx`
 * (navigation) and by the page's own loading branch (client data fetch).
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CenteredCardSkeleton,
  CourseGridSkeleton,
  FiltersRowSkeleton,
  ListCardSkeleton,
  PageHeaderSkeleton,
  PageShellSkeleton,
  ProgressCardSkeleton,
  SectionCardSkeleton,
  StatsCardSkeleton,
  StatsGridSkeleton,
} from "./skeleton-parts";

/** `/` — header banner, four stat cards, progress + activity + goals. */
export function DashboardSkeleton() {
  return (
    <PageShellSkeleton>
      <PageHeaderSkeleton stats={2} actions={1} />
      <div className="space-y-6 sm:space-y-8">
        <StatsGridSkeleton count={4} />
        <ProgressCardSkeleton />
        <SectionCardSkeleton rows={2} titleWidth="w-32" />
        <ListCardSkeleton rows={3} titleWidth="w-36" />
      </div>
    </PageShellSkeleton>
  );
}

/** Content-only variant: used once the header can already render real data. */
export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <StatsGridSkeleton count={4} />
      <ProgressCardSkeleton />
      <SectionCardSkeleton rows={2} titleWidth="w-32" />
      <ListCardSkeleton rows={3} titleWidth="w-36" />
    </div>
  );
}

/** `/courses` — header, subscription banner, filters, course grid. */
export function CoursesPageSkeleton() {
  return (
    <PageShellSkeleton>
      <PageHeaderSkeleton stats={2} actions={1} />
      <StatsGridSkeleton count={3} columns={3} />
      <FiltersRowSkeleton tabs={3} />
      <CourseGridSkeleton count={6} />
    </PageShellSkeleton>
  );
}

/** `/courses/[id]` — back link, overview card, enrol card. */
export function CourseDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />

        <Card className="shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-7 w-64 max-w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** `/children` — header, stat row, one card per child. */
export function ChildrenPageSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <PageHeaderSkeleton stats={2} actions={1} />
        <StatsGridSkeleton count={3} columns={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-full shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/** `/progress` — header, per-child progress cards. */
export function ProgressPageSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <PageHeaderSkeleton stats={2} actions={0} />
        <StatsGridSkeleton count={4} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/** `/progress/[id]` — header, summary card, three metrics, course breakdown. */
export function ProgressDetailSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <Skeleton className="h-4 w-28" />
        <PageHeaderSkeleton stats={2} actions={0} />

        <ProgressCardSkeleton />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <ListCardSkeleton rows={4} titleWidth="w-44" />
      </div>
    </div>
  );
}

/** `/goals` — hero banner then goal cards. */
export function GoalsPageSkeleton() {
  return (
    <PageShellSkeleton>
      <PageHeaderSkeleton stats={0} actions={0} centered />
      <StatsGridSkeleton count={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SectionCardSkeleton key={i} rows={3} titleWidth="w-36" />
        ))}
      </div>
    </PageShellSkeleton>
  );
}

/** `/upgrade` — centred header, currency selector, plan columns, FAQ. */
export function UpgradePageSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8 rounded-lg border border-border bg-muted/40 p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-9 w-56" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
              <Skeleton className="mt-4 h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-5 w-64 max-w-[70%]" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** `/upgrade-starter` — mobile plan page: single column, one plan, CTA. */
export function UpgradeStarterSkeleton() {
  return (
    <div className="container mx-auto max-w-md px-4 py-6">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-64 max-w-full" />
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}

/** `/bundles/[bundleId]` — back link, bundle title, course grid. */
export function BundleDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="space-y-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-40 max-w-full" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/** `/sign-in` and `/sign-up`. */
export function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <Skeleton className="mx-auto h-10 w-10 rounded-lg" />
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto h-4 w-56 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-px flex-1" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="mx-auto h-4 w-48" />
        </CardContent>
      </Card>
    </div>
  );
}

/** Status pages: payment result, account deletion, maintenance. */
export function StatusPageSkeleton({
  rows = 3,
  actions = 2,
}: {
  rows?: number;
  actions?: number;
}) {
  return <CenteredCardSkeleton rows={rows} actions={actions} />;
}
