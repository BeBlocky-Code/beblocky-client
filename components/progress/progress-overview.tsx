"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Coins,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { formatGradeLabel } from "@/lib/utils";
import type { ICourse } from "@/types/course";
import type { IStudentWithUserData } from "@/types/enriched-student";

interface ProgressOverviewProps {
  data: Array<{
    child: IStudentWithUserData;
    courses: Array<{
      course: ICourse;
      progress: {
        percentage: number;
        completedLessons: number;
        totalLessons: number;
      };
    }>;
  }>;
  onViewDetails: (childId: string) => void;
}

export function ProgressOverview({
  data: children,
  onViewDetails,
}: ProgressOverviewProps) {
  const getOverallProgress = (courses: any[]) => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce(
      (sum, { progress }) => sum + progress.percentage,
      0
    );
    return Math.round(totalProgress / courses.length);
  };

  const getTotalTimeSpent = (child: IStudentWithUserData) => {
    const hours = Math.floor(child.totalTimeSpent / 60);
    const minutes = child.totalTimeSpent % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Learning Progress</h2>
        <p className="text-muted-foreground">
          Track your children's learning journey and achievements
        </p>
      </div>

      {children.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No progress data available
          </h3>
          <p className="text-muted-foreground">
            Your children need to start some courses to see progress here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {children.map(({ child, courses }) => {
            const overallProgress = getOverallProgress(courses);

            return (
              <Card
                key={child._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`/placeholder.svg?height=48&width=48`}
                        />
                        <AvatarFallback>
                          {child.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {child.name || "Unknown Child"}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {formatGradeLabel(child.grade)} • {courses.length}{" "}
                          courses enrolled
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => onViewDetails(child._id || "")}
                      className="gap-2"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Overall Progress
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {overallProgress}%
                      </span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{courses.length}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{child.coins}</p>
                        <p className="text-xs text-muted-foreground">Coins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {child.codingStreak}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Day Streak
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {getTotalTimeSpent(child)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Time Spent
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Course Progress */}
                  {courses.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Course Progress</h4>
                      <div className="space-y-3">
                        {courses.slice(0, 3).map(({ course, progress }) => (
                          <div
                            key={course._id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm">
                                  {course.courseTitle}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {progress.completedLessons}/
                                  {progress.totalLessons} lessons
                                </span>
                              </div>
                              <Progress
                                value={progress.percentage}
                                className="h-1.5"
                              />
                            </div>
                            <Badge variant="outline" className="ml-3 text-xs">
                              {progress.percentage}%
                            </Badge>
                          </div>
                        ))}
                        {courses.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            +{courses.length - 3} more courses
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Activity */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Last active:{" "}
                      {format(child.lastCodingActivity, "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
