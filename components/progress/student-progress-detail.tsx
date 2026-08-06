"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Coins,
  CheckCircle,
  Circle,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { formatGradeLabel } from "@/lib/utils";
import type { ICourse } from "@/types/course";
import type { IStudentWithUserData } from "@/types/enriched-student";

interface StudentProgressDetailProps {
  student: IStudentWithUserData;
  courses: Array<{
    course: ICourse;
    progress: {
      percentage: number;
      completedLessons: number;
      totalLessons: number;
    };
    lessons?: Array<{
      id: string;
      title: string;
      completed: boolean;
      timeSpent: number;
      lastAccessed?: Date;
    }>;
  }>;
}

export function StudentProgressDetail({
  student,
  courses,
}: StudentProgressDetailProps) {
  const getTotalTimeSpent = (timeInMinutes: number) => {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce(
      (sum, { progress }) => sum + progress.percentage,
      0
    );
    return Math.round(totalProgress / courses.length);
  };

  const totalCompletedLessons = courses.reduce(
    (sum, { progress }) => sum + progress.completedLessons,
    0
  );
  const totalLessons = courses.reduce(
    (sum, { progress }) => sum + progress.totalLessons,
    0
  );

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
              <AvatarFallback className="text-lg">
                {student.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {student.name || "Unknown Student"}
              </h1>
              <p className="text-muted-foreground">
                {formatGradeLabel(student.grade)} • {courses.length} courses
                enrolled
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="capitalize">
                  {student.subscription}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Member since {format(student.createdAt, "MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCompletedLessons}</p>
                <p className="text-sm text-muted-foreground">
                  Lessons Completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{student.coins}</p>
                <p className="text-sm text-muted-foreground">Current Coins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{student.codingStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {getTotalTimeSpent(student.totalTimeSpent)}
                </p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">
                {getOverallProgress()}%
              </span>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {totalCompletedLessons} of {totalLessons} lessons completed
              </span>
              <span>
                Last active: {format(student.lastCodingActivity, "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Progress</h2>
        {courses.map(({ course, progress, lessons = [] }) => (
          <Card key={course._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {course.courseTitle}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.courseDescription}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {course.courseLanguage}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.completedLessons}/{progress.totalLessons} lessons
                    ({progress.percentage}%)
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>

              {/* Mock lesson progress */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Lessons</h4>
                <div className="space-y-2">
                  {Array.from(
                    { length: Math.min(5, progress.totalLessons) },
                    (_, i) => {
                      const isCompleted = i < progress.completedLessons;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Lesson {i + 1}: {course.courseLanguage} Basics{" "}
                              {i + 1}
                            </p>
                            {isCompleted && (
                              <p className="text-xs text-muted-foreground">
                                Completed • 15 min
                              </p>
                            )}
                          </div>
                          {isCompleted && (
                            <Badge variant="secondary" className="text-xs">
                              +50 coins
                            </Badge>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals */}
      {student.goals && student.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
