"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { progressApi } from "@/lib/api/progress";
import { parentApi } from "@/lib/api/parent";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TrendingUp, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgressPage() {
  const { data: session } = useSession();
  const [childrenProgress, setChildrenProgress] = useState<
    Array<{
      child: any;
      courses: Array<{
        course: any;
        progress: {
          percentage: number;
          completedLessons: number;
          totalLessons: number;
        };
      }>;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const loadProgressData = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      // First get the parent data to get the actual parent ID
      const parentData = await parentApi.getParentByUserId(userId);
      const data = await progressApi.getParentProgressSummary(parentData._id);
      setChildrenProgress(data);
    } catch (error: unknown) {
      console.error("Progress API Error:", error);

      // Handle 404 gracefully - no progress data available yet
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        setError(
          "No progress data available yet. Progress will appear here once your children start learning."
        );
        setChildrenProgress([]);
      } else {
        setError("Failed to load progress data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load progress data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (session?.user?.id) {
      loadProgressData();
    }
  }, [session?.user?.id, loadProgressData]);

  const handleViewDetails = (childId: string) => {
    router.push(`/progress/${childId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border rounded-lg p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                Learning Progress
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your children&apos;s learning journey and achievements
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{childrenProgress.length} children</span>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-5 w-5" />
                  No Progress Data Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600 dark:text-orange-400">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Overview - Only show if no error and has data */}
        {!error && childrenProgress.length > 0 && (
          <ProgressOverview
            data={childrenProgress}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </div>
  );
}
