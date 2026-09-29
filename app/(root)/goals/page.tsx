"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { goalApi, type GoalRecord } from "@/lib/api/goals";
import { queryKeys } from "@/lib/query-keys";
import { useCourses } from "@/lib/hooks";

function GoalCard({ goal }: { goal: GoalRecord }) {
  const label =
    goal.kind === "lessons-in-window"
      ? `Finish ${goal.lessonCount} lessons`
      : "Complete a Course";
  const detail =
    goal.kind === "lessons-in-window"
      ? `${goal.lessonsDone ?? 0} / ${goal.lessonCount} in this window`
      : goal.courseId;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {goal.accomplishedAt ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Target className="h-5 w-5 text-primary" />
          )}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {detail}
      </CardContent>
    </Card>
  );
}

export default function GoalsPage() {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();
  const coursesQuery = useCourses();
  const [kind, setKind] = useState<"lessons-in-window" | "named-course">(
    "lessons-in-window"
  );
  const [lessonCount, setLessonCount] = useState(3);
  const [courseId, setCourseId] = useState("");

  const goalsQuery = useQuery({
    queryKey: queryKeys.goals.all,
    queryFn: () => goalApi.list(),
    enabled: !!session?.user?.id,
  });

  const setGoal = useMutation({
    mutationFn: goalApi.set,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });

  if (isPending || goalsQuery.isLoading) {
    return (
      <div className="container mx-auto p-6 text-muted-foreground">
        Loading Goals…
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto p-6 text-muted-foreground">
        Sign in to set a Goal.
      </div>
    );
  }

  const open = goalsQuery.data?.open ?? [];
  const accomplished = goalsQuery.data?.accomplished ?? [];
  const courses = coursesQuery.data ?? [];

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Target className="h-8 w-8 text-primary" />
          Learning Goals
        </h1>
        <p className="mt-2 text-muted-foreground">
          Finish lessons in a window, or complete one Course. Coins land when
          you accomplish it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set a Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={kind === "lessons-in-window" ? "default" : "outline"}
              onClick={() => setKind("lessons-in-window")}
            >
              Lessons in a window
            </Button>
            <Button
              type="button"
              variant={kind === "named-course" ? "default" : "outline"}
              onClick={() => setKind("named-course")}
            >
              Named Course
            </Button>
          </div>
          {kind === "lessons-in-window" ? (
            <label className="block text-sm">
              Number of lessons
              <Input
                className="mt-1"
                type="number"
                min={1}
                value={lessonCount}
                onChange={(e) => setLessonCount(Number(e.target.value) || 1)}
              />
            </label>
          ) : (
            <label className="block text-sm">
              Course
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">Choose a Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseTitle}
                  </option>
                ))}
              </select>
            </label>
          )}
          {setGoal.isError && (
            <p className="text-sm text-destructive">
              A Parent cannot set a Goal for a child. Sign in as the learner.
            </p>
          )}
          <Button
            disabled={setGoal.isPending || (kind === "named-course" && !courseId)}
            onClick={() =>
              setGoal.mutate(
                kind === "lessons-in-window"
                  ? { kind, lessonCount, windowDays: 7 }
                  : { kind, courseId }
              )
            }
          >
            Save Goal
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Open</h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open Goals yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {open.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Accomplished</h2>
        {accomplished.length === 0 ? (
          <p className="text-sm text-muted-foreground">None accomplished yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {accomplished.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
