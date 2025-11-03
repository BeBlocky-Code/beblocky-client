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
import { progressApi } from "@/lib/api/progress";
import { studentApi } from "@/lib/api/student";
import { courseApi } from "@/lib/api/course";
import { useSession } from "@/lib/auth-client";
import { encryptEmail } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

export function StudentDashboard({
  courses,
  stats,
  selectedTab = "overview",
}: IStudentDashboardProps) {
  const { subscription } = useSubscription();
  const { data: session } = useSession();
  const [enrolledCourses, setEnrolledCourses] = useState<ICourse[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [allProgress, setAllProgress] = useState<IStudentProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      course: ICourse;
      progress: IStudentProgress;
    }>
  >([]);
  const [averageProgress, setAverageProgress] = useState<number>(0);

  // Filter courses based on user's subscription plan and active status
  // This gives us ALL courses the user can access with their current subscription
  const accessibleCourses = useMemo(() => {
    return filterCoursesBySubscription(
      courses.filter((course) => course.status === CourseStatus.ACTIVE),
      subscription?.planName || null
    );
  }, [courses, subscription?.planName]);

  // Fetch all progress data for the student
  useEffect(() => {
    const fetchAllProgressData = async () => {
      if (!session?.user?.id) return;

      try {
        // Get student record
        const student = await studentApi.getStudentByUserId(session.user.id);
        setStudentId(student._id);
        console.log("--------student", student);

        // Get student's progress for all courses
        const progressData = await progressApi.getStudentProgress(student._id);
        setAllProgress(progressData);
        console.log("--------progressData", progressData);

        // Calculate average progress from completionPercentage attribute
        if (progressData.length > 0) {
          const totalPercentage = progressData.reduce(
            (sum, progress) =>
              sum + ((progress as any).completionPercentage || 0),
            0
          );
          const average = Math.round(totalPercentage / progressData.length);
          setAverageProgress(average);
        } else {
          setAverageProgress(0);
        }

        // Map progress data with course information
        // Use courseId object from progress if available, otherwise find in courses array
        const activityWithCourses = progressData.map((progress) => {
          // Extract courseId - it's an object with _id and courseTitle
          const courseIdObj =
            typeof progress.courseId === "object" && progress.courseId !== null
              ? (progress.courseId as any)
              : null;

          if (!courseIdObj || !courseIdObj._id) {
            console.warn("No valid courseId found in progress:", progress);
            return null;
          }

          // Try to find course in the courses prop array first
          const courseFromProp = courses.find((c) => c._id === courseIdObj._id);

          // If found in prop, use it; otherwise construct from courseId object
          // We might not have all properties, but we'll use what we have
          const course: Partial<ICourse> = courseFromProp
            ? courseFromProp
            : {
                _id: courseIdObj._id,
                courseTitle: courseIdObj.courseTitle || "Unknown Course",
                courseLanguage: courseIdObj.courseLanguage || "Unknown",
                subType: courseIdObj.subType || "Unknown",
                courseDescription: courseIdObj.courseDescription || "",
                rating: courseIdObj.rating || 0,
                status: courseIdObj.status || "Active",
                createdAt: courseIdObj.createdAt || new Date(),
                updatedAt: courseIdObj.updatedAt || new Date(),
              };

          return {
            course: course as ICourse,
            progress,
          };
        });

        // Filter out null values and ensure both course and progress are valid, then sort by updatedAt (latest first)
        const validActivity = activityWithCourses
          .filter(
            (item): item is { course: ICourse; progress: IStudentProgress } =>
              item !== null &&
              item !== undefined &&
              item.course !== null &&
              item.course !== undefined &&
              item.progress !== null &&
              item.progress !== undefined
          )
          .sort((a, b) => {
            const dateA = new Date(a.progress.updatedAt).getTime();
            const dateB = new Date(b.progress.updatedAt).getTime();
            return dateB - dateA; // Latest first
          });

        setRecentActivity(validActivity);

        // Filter courses that have progress (enrolled) for backwards compatibility
        const enrolled = accessibleCourses.filter((course) =>
          progressData.some((progress) => {
            const courseId =
              typeof progress.courseId === "object" &&
              progress.courseId !== null
                ? (progress.courseId as any)._id
                : progress.courseId;
            return courseId === course._id;
          })
        );

        setEnrolledCourses(enrolled);
      } catch (error) {
        console.warn("Failed to fetch progress data:", error);
        setAllProgress([]);
        setRecentActivity([]);
        setAverageProgress(0);
        setEnrolledCourses([]);
      }
    };

    fetchAllProgressData();
  }, [session?.user?.id, accessibleCourses]);

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
            gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800"
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-blue-700 dark:text-blue-300"
            delay={0.1}
          />

          <StatsCard
            title="Coding Streak"
            value={`${stats.codingStreak} days`}
            description="Keep it up!"
            icon={Target}
            gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800"
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-green-700 dark:text-green-300"
            delay={0.2}
          />

          <StatsCard
            title="Total Coins"
            value={stats.totalCoins}
            description="Earned through learning"
            icon={Coins}
            gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800"
            iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            textColor="text-purple-700 dark:text-purple-300"
            delay={0.3}
          />

          <StatsCard
            title="Time Spent"
            value={`${Math.floor(stats.timeSpent / 60)}h ${
              stats.timeSpent % 60
            }m`}
            description="Total learning time"
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800"
            iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
            textColor="text-orange-700 dark:text-orange-300"
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
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${averageProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          if (session?.user?.email && item.course?._id) {
                            const encryptedEmail = encryptEmail(
                              session.user.email
                            );
                            const courseUrl = `https://ide.beblocky.com/courses/${item.course._id}/learn/user/${encryptedEmail}`;
                            window.location.href = courseUrl;
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
                              <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <LanguageLogo
                                  language={
                                    item.course?.courseLanguage || "Unknown"
                                  }
                                  className="text-white"
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
              {accessibleCourses.map((course, index) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  index={index}
                  showProgress={true}
                />
              ))}
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
