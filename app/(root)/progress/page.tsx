"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { progressApi } from "@/lib/api/progress";
import { useParentByUserId } from "@/lib/hooks";
import { queryKeys } from "@/lib/query-keys";
import { motion } from "framer-motion";
import { TrendingUp, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressPageSkeleton } from "@/components/skeletons";

export default function ProgressPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const parentQuery = useParentByUserId(userId);
  const parentId = parentQuery.data?._id;

  const summaryQuery = useQuery({
    queryKey: [...queryKeys.progress.all, "parentSummary", parentId || ""],
    queryFn: () => progressApi.getParentProgressSummary(parentId!),
    enabled: !!parentId,
    staleTime: 2 * 60 * 1000,
  });

  const childrenProgress = summaryQuery.data ?? [];
  const loading =
    sessionPending || parentQuery.isLoading || summaryQuery.isLoading;

  const error = useMemo(() => {
    const err = summaryQuery.error ?? parentQuery.error;
    if (!err) return null;
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("404") || message.includes("Not Found")) {
      return "No progress data available yet. Progress will appear here once your children start learning.";
    }
    return "Failed to load progress data. Please try again later.";
  }, [parentQuery.error, summaryQuery.error]);

  const handleViewDetails = (childId: string) => {
    router.push(`/progress/${childId}`);
  };

  if (loading) {
    return <ProgressPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <motion.div
          className="bg-muted/40 border-b border-border rounded-lg p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                Learning Progress
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your children&apos;s coding journey
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{childrenProgress.length} children</span>
            </div>
          </div>
        </motion.div>

        {error ? (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="h-5 w-5" />
                Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {error}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ProgressOverview
            data={childrenProgress}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </div>
  );
}
