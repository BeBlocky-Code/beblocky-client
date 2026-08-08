"use client";

import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { ParentDashboard } from "@/components/dashboard/parent-dashboard";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import {
  Home,
  User,
  Users,
  BookOpen,
  TrendingUp,
  BookOpenCheck,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCourses,
  useParentByUserId,
  useParentChildren,
  useStudentByUserId,
  useStudentProgress,
} from "@/lib/hooks";
import { queryKeys } from "@/lib/query-keys";
import { AddChildDialog } from "@/components/children/add-child-dialog";
import {
  DashboardContentSkeleton,
  DashboardSkeleton,
} from "@/components/skeletons";

import { useToast } from "@/hooks/use-toast";
import type { IStudentStats, IParentStats } from "@/types/dashboard-simple";

export default function DashboardPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<
    "overview" | "courses" | "children"
  >("overview");
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);

  const userId = session?.user?.id;
  const userName = session?.user?.name || "User";
  const userRole = session?.user?.roles?.[0] ?? "student";
  const isParent = userRole === "parent";

  // Courses are needed by both roles, so this starts immediately instead of
  // waiting behind the parent/student lookup like the old effect did.
  const coursesQuery = useCourses();

  // Parent branch: children can only be fetched once we know the parent id.
  const parentQuery = useParentByUserId(userId, isParent);
  const parentId = parentQuery.data?._id;
  const childrenQuery = useParentChildren(parentId, isParent);

  // Student branch: progress hangs off the student record, everything else is
  // parallel. Both queries are shared with StudentDashboard through the cache.
  const studentQuery = useStudentByUserId(userId, !isParent);
  const studentId = studentQuery.data?._id;
  const progressQuery = useStudentProgress(studentId, !isParent);

  const courses = coursesQuery.data ?? [];
  const children = childrenQuery.data ?? [];

  // `isLoading` (not `isPending`) so disabled queries on the inactive branch
  // never hold the page back.
  const isDataLoading = isParent
    ? coursesQuery.isLoading || parentQuery.isLoading || childrenQuery.isLoading
    : coursesQuery.isLoading ||
      studentQuery.isLoading ||
      progressQuery.isLoading;

  const coursesError = coursesQuery.error;
  useEffect(() => {
    if (!coursesError) return;
    toast({
      title: "Error",
      description: "Failed to load dashboard data. Please try again.",
      variant: "destructive",
    });
  }, [coursesError, toast]);

  const studentStats = useMemo<IStudentStats>(() => {
    const student = studentQuery.data;
    return {
      // Enrolled count comes from progress records, not the full catalogue.
      totalCourses: progressQuery.data?.length ?? 0,
      activeCourses: courses.filter((course) => course.status === "Active")
        .length,
      totalCoins: student?.totalCoinsEarned || 0,
      codingStreak: student?.codingStreak || 0,
      timeSpent: student?.totalTimeSpent || 0,
      averageProgress: 50, // TODO: compute from real progress when available
    };
  }, [courses, progressQuery.data, studentQuery.data]);

  const parentStats = useMemo<IParentStats>(
    () => ({
      totalChildren: children.length,
      activeChildren: children.filter(
        (child) => child.enrolledCourses && child.enrolledCourses.length > 0
      ).length,
      totalTimeSpent: children.reduce(
        (sum, child) => sum + (child.totalTimeSpent || 0),
        0
      ),
      averageProgress: children.length > 0 ? 65 : 0, // TODO: derive from progress records
      totalCoinsEarned: children.reduce(
        (sum, child) => sum + (child.totalCoinsEarned || 0),
        0
      ),
    }),
    [children]
  );

  const headerContent = useMemo(() => {
    if (isParent) {
      return {
        title: userName,
        description: "Welcome back! Monitor your children's progress",
        icon: <Users className="h-8 w-8 text-primary" />,
        stats: [
          {
            label: "Children",
            value: parentStats.totalChildren,
            icon: <Users className="h-4 w-4" />,
          },
          {
            label: "Total Progress",
            value: `${parentStats.averageProgress}%`,
            icon: <TrendingUp className="h-4 w-4" />,
          },
        ],
      };
    }

    if (userRole === "student") {
      return {
        title: userName,
        description: "Welcome back! Continue your coding journey",
        icon: <User className="h-8 w-8 text-primary" />,
        stats: [
          {
            label: "Courses",
            value: studentStats.totalCourses,
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            label: "Coins",
            value: studentStats.totalCoins,
            icon: <TrendingUp className="h-4 w-4" />,
          },
        ],
      };
    }

    return {
      title: "Dashboard",
      description: `Welcome back, ${userName}!`,
      icon: <Home className="h-8 w-8 text-primary" />,
      stats: [] as {
        label: string;
        value: string | number;
        icon: ReactNode;
      }[],
    };
  }, [isParent, parentStats, studentStats, userName, userRole]);

  const dashboardContent = () => {
    if (isDataLoading) return <DashboardContentSkeleton />;

    if (isParent) {
      return (
        <ParentDashboard
          parent={{
            _id: parentId || userId || "",
            name: userName,
            email: session?.user?.email || "",
            children: parentQuery.data?.children ?? [],
            relationship: parentQuery.data?.relationship,
            phoneNumber: parentQuery.data?.phoneNumber || "",
            address: parentQuery.data?.address || {
              subCity: "",
              city: "",
              country: "",
            },
            createdAt: parentQuery.data?.createdAt,
            updatedAt: parentQuery.data?.updatedAt,
          }}
          children={children}
          stats={parentStats}
          selectedTab={selectedTab === "children" ? "children" : "overview"}
        />
      );
    }

    return (
      <StudentDashboard
        courses={courses}
        stats={studentStats}
        selectedTab={selectedTab}
      />
    );
  };

  // Only the session gates the whole page: the header is rendered from session
  // data, so it appears before any dashboard request resolves.
  if (isSessionPending) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          className="bg-muted/40 border-b border-border rounded-lg p-4 sm:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                {headerContent.icon}
                {headerContent.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                {headerContent.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {headerContent.stats.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {headerContent.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                    >
                      {stat.icon}
                      <span>
                        {stat.label}: {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {userRole === "student" && (
                <Button
                  className="gap-2"
                  onClick={() =>
                    setSelectedTab(
                      selectedTab === "overview" ? "courses" : "overview"
                    )
                  }
                >
                  <BookOpenCheck className="h-4 w-4" />
                  {selectedTab === "overview" ? "My Courses" : "Overview"}
                </Button>
              )}

              {isParent && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="flex gap-2">
                    <Button
                      variant={
                        selectedTab === "overview" ? "default" : "outline"
                      }
                      onClick={() => setSelectedTab("overview")}
                      className="transition-all duration-200 flex-1 sm:flex-none"
                    >
                      Overview
                    </Button>
                    <Button
                      variant={
                        selectedTab === "children" ? "default" : "outline"
                      }
                      onClick={() => setSelectedTab("children")}
                      className="transition-all duration-200 flex-1 sm:flex-none"
                    >
                      Children
                    </Button>
                  </div>
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => setAddChildDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Child
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {dashboardContent()}
        </motion.div>

        {/* Add Child Dialog */}
        <AddChildDialog
          open={addChildDialogOpen}
          onOpenChange={setAddChildDialogOpen}
          parentId={parentId}
          onSuccess={() => {
            // Refetch the children list in place instead of reloading the page.
            if (parentId) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.parents.children(parentId),
              });
              void queryClient.invalidateQueries({
                queryKey: queryKeys.parents.detail(parentId),
              });
            }
          }}
        />
      </div>
    </div>
  );
}