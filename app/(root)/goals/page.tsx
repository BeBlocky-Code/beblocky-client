"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Coins,
  Flag,
  Minus,
  Plus,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GOAL_ACCOMPLISH_COINS,
  goalApi,
  type GoalRecord,
} from "@/lib/api/goals";
import { queryKeys } from "@/lib/query-keys";
import { useCourses } from "@/lib/hooks";
import { GoalsPageSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

function daysLeft(windowEnd?: string): number | null {
  if (!windowEnd) return null;
  const ms = new Date(windowEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function goalProgress(goal: GoalRecord): number {
  if (goal.accomplishedAt) return 100;
  if (goal.kind === "lessons-in-window") {
    const total = goal.lessonCount || 1;
    return Math.min(100, Math.round(((goal.lessonsDone ?? 0) / total) * 100));
  }
  return 0;
}

function GoalCard({
  goal,
  courseTitle,
}: {
  goal: GoalRecord;
  courseTitle?: string;
}) {
  const done = Boolean(goal.accomplishedAt);
  const percent = goalProgress(goal);
  const remaining = daysLeft(goal.windowEnd);
  const title =
    goal.kind === "lessons-in-window"
      ? `Finish ${goal.lessonCount} lessons`
      : courseTitle ?? "Complete a course";
  const detail =
    goal.kind === "lessons-in-window"
      ? `${goal.lessonsDone ?? 0} of ${goal.lessonCount} this week`
      : done
        ? "Course finished"
        : "Finish every lesson in this course";

  return (
    <Card className="shadow-lg transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex min-w-0 items-center gap-2 text-lg text-pretty">
            {done ? (
              <CheckCircle2
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-primary"
              />
            ) : (
              <Target
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-primary"
              />
            )}
            <span className="min-w-0">{title}</span>
          </CardTitle>
          <Badge variant={done ? "secondary" : "default"} className="shrink-0">
            <Coins aria-hidden="true" className="h-3 w-3" />
            {done ? "Collected" : `${GOAL_ACCOMPLISH_COINS}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground text-pretty">{detail}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{done ? "Accomplished" : "Progress"}</span>
            <span className="tabular-nums">{percent}%</span>
          </div>
          <Progress
            value={percent}
            aria-label={`${title} ${percent} percent complete`}
          />
        </div>
        {goal.kind === "lessons-in-window" && remaining !== null && !done && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
            {remaining === 0
              ? "Last day of this window"
              : `${remaining} day${remaining === 1 ? "" : "s"} left`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyGoals({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Flag aria-hidden="true" className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function GoalsPage() {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();
  const coursesQuery = useCourses();
  const [kind, setKind] = useState<"lessons-in-window" | "named-course">(
    "lessons-in-window",
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

  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const course of coursesQuery.data ?? []) {
      map.set(course._id, course.courseTitle);
    }
    return map;
  }, [coursesQuery.data]);

  if (isPending || (!!session?.user?.id && goalsQuery.isLoading)) {
    return <GoalsPageSkeleton />;
  }

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <Card className="mx-auto max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target aria-hidden="true" className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold">Sign in to set a goal</h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Goals live on your learner account so coins land in the right
              place.
            </p>
            <Button asChild className="mt-6">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const open = goalsQuery.data?.open ?? [];
  const accomplished = goalsQuery.data?.accomplished ?? [];
  const courses = coursesQuery.data ?? [];
  const canSave =
    !setGoal.isPending && (kind === "lessons-in-window" || Boolean(courseId));

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          className="rounded-lg border border-border bg-muted/40 p-4 sm:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground text-balance sm:gap-3 sm:text-3xl md:text-4xl">
                <Target
                  aria-hidden="true"
                  className="h-6 w-6 text-primary sm:h-8 sm:w-8"
                />
                Goals
              </h1>
              <p className="mt-2 text-sm text-muted-foreground text-pretty sm:text-base">
                Pick a challenge. Finish it, and {GOAL_ACCOMPLISH_COINS} coins
                land in your stash.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <Target aria-hidden="true" className="h-4 w-4" />
                <span>
                  Open:{" "}
                  <span className="tabular-nums text-foreground">
                    {open.length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                <span>
                  Accomplished:{" "}
                  <span className="tabular-nums text-foreground">
                    {accomplished.length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag aria-hidden="true" className="h-5 w-5 text-primary" />
                Set a goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                role="group"
                aria-label="Goal type"
              >
                <button
                  type="button"
                  aria-pressed={kind === "lessons-in-window"}
                  onClick={() => setKind("lessons-in-window")}
                  className={cn(
                    "rounded-lg border p-4 text-start transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-[0.96]",
                    kind === "lessons-in-window"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-accent/50",
                  )}
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <p className="font-semibold">This week</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Finish a set number of lessons in the next 7 days.
                  </p>
                </button>
                <button
                  type="button"
                  aria-pressed={kind === "named-course"}
                  onClick={() => setKind("named-course")}
                  className={cn(
                    "rounded-lg border p-4 text-start transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-[0.96]",
                    kind === "named-course"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-accent/50",
                  )}
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <p className="font-semibold">A course</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete one course from start to finish.
                  </p>
                </button>
              </div>

              {kind === "lessons-in-window" ? (
                <div className="space-y-2" role="group" aria-labelledby="lesson-count-label">
                  <Label id="lesson-count-label">Lessons this week</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      aria-label="Fewer lessons"
                      disabled={lessonCount <= 1}
                      onClick={() =>
                        setLessonCount((count) => Math.max(1, count - 1))
                      }
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span className="min-w-10 text-center text-2xl font-bold tabular-nums">
                      {lessonCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      aria-label="More lessons"
                      disabled={lessonCount >= 20}
                      onClick={() =>
                        setLessonCount((count) => Math.min(20, count + 1))
                      }
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="goal-course">Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger id="goal-course" className="w-full text-base sm:text-sm">
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.courseTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {setGoal.isError && (
                <p role="alert" className="text-sm text-destructive">
                  Unable to set this goal. Sign in as the learner, not a parent.
                </p>
              )}

              <Button
                className="gap-2"
                disabled={!canSave}
                onClick={() =>
                  setGoal.mutate(
                    kind === "lessons-in-window"
                      ? { kind, lessonCount, windowDays: 7 }
                      : { kind, courseId },
                  )
                }
              >
                <Target aria-hidden="true" className="h-4 w-4" />
                {setGoal.isPending ? "Setting goal…" : "Set goal"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Open</h2>
          {open.length === 0 ? (
            <EmptyGoals
              title="No open goals"
              description="Set one above to start earning coins."
            />
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {open.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  courseTitle={
                    goal.courseId
                      ? courseTitleById.get(goal.courseId)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Accomplished</h2>
          {accomplished.length === 0 ? (
            <EmptyGoals
              title="None accomplished yet"
              description="Finish an open goal to collect coins."
            />
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {accomplished.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  courseTitle={
                    goal.courseId
                      ? courseTitleById.get(goal.courseId)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
