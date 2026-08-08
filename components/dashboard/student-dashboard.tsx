"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Coins,
  Target,
  Clock,
  Calendar,
  ChevronRight,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/shared/stats-card";
import { GoalsPlaceholder } from "@/components/shared/goals-placeholder";
import { LanguageLogo } from "@/components/shared/language-logos";
import { CourseCard } from "@/components/shared/course-card";
import type { IStudentDashboardProps } from "@/types/dashboard-simple";
import type { ICourse } from "@/types/course";
import type { IStudentProgress } from "@/types/dashboard-simple";
import { useSubscription } from "@/hooks/use-subscription";
import { filterCoursesBySubscription } from "@/lib/utils/subscription-hierarchy";
import { CourseStatus } from "@/types/course";
import { useStudentByUserId, useStudentProgress } from "@/lib/hooks";
import { HourOfCodeShowcase } from "@/components/progress/hour-of-code-showcase";
import { useSession } from "@/lib/auth-client";
import { getIdeLearnUrl } from "@/lib/utils";
import { useMemo } from "react";

export function StudentDashboard({
  courses,
  stats,
  selectedTab = "overview",
}: IStudentDashboardProps) {
  const { subscription } = useSubscription();
  const { data: session } = useSession();

  // Shares the cache with the dashboard page, so neither the student record nor
  // its progress is requested twice on first paint.
  const { data: student } = useStudentByUserId(session?.user?.id);
  const { data: progressRecords } = useStudentProgress(student?._id);

  // Filter courses based on user's subscription plan and active status
  // This gives us ALL courses the user can access with their current subscription
  const accessibleCourses = useMemo(() => {
    return filterCoursesBySubscription(
      courses.filter((course) => course.status === CourseStatus.ACTIVE),
      subscription?.planName || null
    );
  }, [courses, subscription?.planName]);

  const averageProgress = useMemo(() => {
    if (!progressRecords || progressRecords.length === 0) return 0;
    const total = progressRecords.reduce(
      (sum, progress) => sum + ((progress as any).completionPercentage || 0),
      0
    );
    return Math.round(total / progressRecords.length);
  }, [progressRecords]);

  /** Progress records joined to their course, newest first. */
  const recentActivity = useMemo(() => {
    if (!progressRecords) return [];

    return progressRecords
      .map((progress) => {
        // courseId arrives populated as an object on this endpoint.
        const courseRef =
          typeof progress.courseId === "object" && progress.courseId !== null
            ? (progress.courseId as any)
            : null;
        if (!courseRef?._id) return null;

        const course: Partial<ICourse> = courses.find(
          (c) => c._id === courseRef._id
        ) ?? {
          _id: courseRef._id,
          courseTitle: courseRef.courseTitle || "Unknown Course",
          courseLanguage: courseRef.courseLanguage || "Unknown",
          subType: courseRef.subType || "Unknown",
          courseDescription: courseRef.courseDescription || "",
          rating: courseRef.rating || 0,
          status: courseRef.status || "Active",
          createdAt: courseRef.createdAt || new Date(),
          updatedAt: courseRef.updatedAt || new Date(),
        };

        return { course: course as ICourse, progress };
      })
      .filter(
        (item): item is { course: ICourse; progress: IStudentProgress } =>
          item !== null
      )
      .sort(
        (a, b) =>
          new Date(b.progress.updatedAt).getTime() -
          new Date(a.progress.updatedAt).getTime()
      );
  }, [courses, progressRecords]);

  const enrolledCourses = useMemo(() => {
    if (!progressRecords) return [];
    return accessibleCourses.filter((course) =>
      progressRecords.some((progress) => {
        const courseId =
          typeof progress.courseId === "object" && progress.courseId !== null
            ? (progress.courseId as any)._id
            : progress.courseId;
        return courseId === course._id;
      })
    );
  }, [accessibleCourses, progressRecords]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatsCard
            title="Enrolled Courses"
            value={stats.totalCourses}
            description="Active learning paths"
            icon={BookOpen}
            delay={0.1}
          />

          <StatsCard
            title="Coding Streak"
            value={`${stats.codingStreak} days`}
            description="Keep it up!"
            icon={Target}
            delay={0.2}
          />

          <StatsCard
            title="Total Coins"
            value={stats.totalCoins}
            description="Earned through learning"
            icon={Coins}
            delay={0.3}
          />

          <StatsCard
            title="Time Spent"
            value={`${Math.floor(stats.timeSpent / 60)}h ${
              stats.timeSpent % 60
            }m`}
            description="Total learning time"
            icon={Clock}
            delay={0.4}
          />
        </motion.div>

        {/* Content based on selected tab */}
        {selectedTab === "overview" && (
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Overview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Overall Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {averageProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${averageProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hour of Code */}
            <HourOfCodeShowcase />

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity
                      .slice(0, 3)
                      .filter(
                        (item) =>
                          item &&
                          item.course &&
                          item.progress &&
                          item.course._id &&
                          item.course.courseTitle
                      )
                      .map((item, index) => {
                        const handleClick = () => {
                          if (session?.user?.id && item.course?._id) {
                            window.location.href = getIdeLearnUrl(item.course._id);
                          }
                        };

                        return (
                          <motion.div
                            key={item.progress._id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                            onClick={handleClick}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <LanguageLogo
                                  language={
                                    item.course?.courseLanguage || "Unknown"
                                  }
                                  className="text-primary"
                                  size={20}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-sm sm:text-base truncate">
                                  {item.course?.courseTitle || "Unknown Course"}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {item.course?.courseLanguage || "Unknown"} •{" "}
                                  {(item.progress as any)
                                    ?.completionPercentage || 0}
                                  % Complete
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0">
                              <Badge
                                variant="secondary"
                                className="text-xs whitespace-nowrap"
                              >
                                {item.course?.subType || "Unknown"}
                              </Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          </motion.div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Goals Section */}
            <GoalsPlaceholder />
          </motion.div>
        )}

        {selectedTab === "courses" && (
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* My Courses Header */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Courses
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  All courses available with your{" "}
                  {subscription?.planName || "Free"} subscription
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Available Courses</span>
                  <Badge variant="secondary">{accessibleCourses.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span>Enrolled Courses</span>
                  <Badge variant="default">{enrolledCourses.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {accessibleCourses.map((course, index) => {
                const enrolled = enrolledCourses.some((c) => c._id === course._id);
                return (
                  <CourseCard
                    key={course._id}
                    course={course}
                    index={index}
                    showProgress={true}
                    isEnrolled={enrolled}
                    studentsCount={
                      Array.isArray(course.students) ? course.students.length : 0
                    }
                    totalHours={
                      Array.isArray(course.lessons) && course.lessons.length > 0
                        ? Math.max(1, course.lessons.length)
                        : 2
                    }
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedTab === "children" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Student Dashboard
                </h3>
                <p className="text-muted-foreground">
                  This tab is not available for students.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
