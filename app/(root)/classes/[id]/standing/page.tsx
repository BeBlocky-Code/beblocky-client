"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { progressApi } from "@/lib/api/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen } from "lucide-react";

/**
 * Class Standing for a parent (or other allowed) Class creator.
 * Calls the same GET /classes/:id/standing read as the dashboard.
 */
export default function ClassStandingPage() {
  const params = useParams();
  const classId = String(params?.id ?? "");
  const { data: session, isPending: sessionPending } = useSession();

  const standingQuery = useQuery({
    queryKey: ["classStanding", classId],
    queryFn: () => progressApi.getClassStanding(classId),
    enabled: !!classId && !!session?.user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const rows = standingQuery.data ?? [];
  const loading = sessionPending || standingQuery.isLoading;

  const learnerCount = rows.length;
  const courseCount = useMemo(() => {
    const ids = new Set<string>();
    for (const row of rows) {
      for (const s of row.standings) ids.add(s.courseId);
    }
    return ids.size;
  }, [rows]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-muted-foreground">
        Loading Class Standing…
      </div>
    );
  }

  if (standingQuery.error) {
    return (
      <div className="container mx-auto p-6 text-destructive">
        You cannot read Standing for this Class, or it was not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Users className="h-8 w-8 text-primary" />
          Class Standing
        </h1>
        <p className="mt-2 text-muted-foreground">
          {learnerCount} learners · {courseCount} courses (saved code hidden)
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No enrolled learners with Standing yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const avg =
              row.standings.length === 0
                ? 0
                : Math.round(
                    row.standings.reduce((s, st) => s + st.percentage, 0) /
                      row.standings.length
                  );
            return (
              <Card key={row.learnerId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Learner {row.learnerId.slice(0, 8)}…
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Progress value={avg} className="flex-1" />
                    <span className="text-sm font-medium">{avg}%</span>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {row.standings.map((s) => (
                      <li key={s.courseId}>
                        Course {s.courseId.slice(0, 8)}… — {s.percentage}% (
                        {s.completedLessonCount}/{s.totalLessons} lessons)
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
