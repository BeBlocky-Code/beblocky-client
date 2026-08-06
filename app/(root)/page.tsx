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
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { childrenApi } from "@/lib/api/children";
import { courseApi } from "@/lib/api/course";
import { studentApi } from "@/lib/api/student";
import { progressApi } from "@/lib/api/progress";
import { parentApi } from "@/lib/api/parent";
import { AddChildDialog } from "@/components/children/add-child-dialog";

import { useToast } from "@/hooks/use-toast";
import type {
  IStudentStats,
  IParentStats,
  IParentDashboardProps,
} from "@/types/dashboard-simple";
import type { IStudent } from "@/types/student";
import type { IParent } from "@/types/parent";
import type { ICourse } from "@/types/course";
import { RelationshipType } from "@/types/parent";
import type { IParent as IApiParent } from "@/lib/api/parent";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { toast } = useToast();

  // State for real data
  const [children, setChildren] = useState<IStudent[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [studentStats, setStudentStats] = useState<IStudentStats | null>(null);
  const [parentStats, setParentStats] = useState<IParentStats | null>(null);
  const [parentData, setParentData] = useState<IApiParent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "courses" | "children"
  >("overview");
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);

  // Load data based on user role
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);

        const userRole = session.user.roles?.[0] ?? "student";
        const isParentUser = userRole === "parent";

        if (isParentUser) {
          // Load parent data
          console.log("🎯 [DashboardPage] Loading parent dashboard data");

          try {
            // First get parent data to get parentId
            const parentDataResponse = await parentApi.getParentByUserId(
              session.user.id
            );
            setParentData(parentDataResponse);
            console.log(
              "🎯 [DashboardPage] Parent data loaded:",
              parentDataResponse
            );

            const [childrenData, coursesData] = await Promise.all([
              childrenApi.getChildrenByParent(parentDataResponse._id),
              courseApi.fetchAllCourses(),
            ]);

            console.log(
              "🎯 [DashboardPage] Children data loaded:",
              childrenData.length,
              "children"
            );
            setChildren(childrenData);
            setCourses(coursesData);

            // Calculate parent stats
            const totalChildren = childrenData.length;
            const activeChildren = childrenData.filter(
              (child) =>
                child.enrolledCourses && child.enrolledCourses.length > 0
            ).length;

            const totalTimeSpent = childrenData.reduce(
              (sum, child) => sum + (child.totalTimeSpent || 0),
              0
            );
            const totalCoinsEarned = childrenData.reduce(
              (sum, child) => sum + (child.totalCoinsEarned || 0),
              0
            );

            // Calculate average progress (simplified)
            const averageProgress = childrenData.length > 0 ? 65 : 0; // This would need real progress calculation

            console.log("🎯 [DashboardPage] Parent stats calculated:", {
              totalChildren,
              activeChildren,
              totalTimeSpent,
              totalCoinsEarned,
              averageProgress,
            });

            setParentStats({
              totalChildren,
              activeChildren,
              totalTimeSpent,
              averageProgress,
              totalCoinsEarned,
            });
          } catch (error) {
            console.error(
              "🎯 [DashboardPage] Failed to load children data:",
              error
            );
            // Set empty children array and default parent stats
            setChildren([]);
            setParentStats({
              totalChildren: 0,
              activeChildren: 0,
              totalTimeSpent: 0,
              averageProgress: 0,
              totalCoinsEarned: 0,
            });

            // Still try to load courses
            try {
              const coursesData = await courseApi.fetchAllCourses();
              setCourses(coursesData);
            } catch (courseError) {
              console.error(
                "🎯 [DashboardPage] Failed to load courses:",
                courseError
              );
              setCourses([]);
            }
          }
        } else {
          // Load student data
          console.log("🎯 [DashboardPage] Loading student dashboard data");
          const [coursesData] = await Promise.all([
            courseApi.fetchAllCourses(),
          ]);
          setCourses(coursesData);

          // Fetch student by userId to derive real stats
          try {
            const student = await studentApi.getStudentByUserId(
              session.user.id
            );
            const totalCourses = coursesData.length;
            const activeCourses = coursesData.filter(
              (course) => course.status === "Active"
            ).length;

            // Get enrolled courses count from progress
            let enrolledCoursesCount = 0;
            try {
              const progressData = await progressApi.getStudentProgress(
                student._id
              );
              enrolledCoursesCount = progressData.length;
            } catch (error) {
              console.warn("Failed to fetch progress data:", error);
            }

            setStudentStats({
              totalCourses: enrolledCoursesCount, // Show enrolled courses instead of total
              activeCourses,
              totalCoins: student.totalCoinsEarned || 0,
              codingStreak: student.codingStreak || 0,
              timeSpent: student.totalTimeSpent || 0,
              averageProgress: 50, // TODO: compute from real progress when available
            });
          } catch (e) {
            console.warn(
              "🎯 [DashboardPage] Failed to fetch student record",
              e
            );
            const totalCourses = coursesData.length;
            const activeCourses = coursesData.filter(
              (course) => course.status === "Active"
            ).length;
            setStudentStats({
              totalCourses,
              activeCourses,
              totalCoins: 0,
              codingStreak: 0,
              timeSpent: 0,
              averageProgress: 0,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [session?.user?.id, session?.user?.roles, toast]);

  // Show loading state while session or data is loading
  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const userRole = session?.user?.roles?.[0] ?? "student";

  // Get dashboard content based on role
  const getDashboardContent = () => {
    if (!session?.user) return null;

    if (userRole === "student" && studentStats && session?.user) {
      return (
        <StudentDashboard
          courses={courses}
          stats={studentStats}
          selectedTab={selectedTab}
        />
      );
    }

    if (userRole === "parent" && session?.user) {
      console.log(
        "🎯 [DashboardPage] Rendering parent dashboard with",
        children.length,
        "children"
      );

      // Create a mock parent object from session data
      const parentData: IParent = {
        userId: session.user.id,
        children: children.map((child, index) => `child-${index}`), // Mock child IDs
        relationship: RelationshipType.MOTHER, // This would come from real data
        phoneNumber: "+1234567890", // This would come from real data
        address: {
          subCity: "Downtown",
          city: "New York",
          country: "USA",
        },
        subscription: "",
        paymentHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create a mock parent object that matches the dashboard interface
      const mockParent = {
        _id: session?.user?.id || "",
        name: session?.user?.name || "Parent",
        email: session?.user?.email || "",
        children: children.map((child, index) => `child-${index}`),
        relationship: RelationshipType.MOTHER,
        phoneNumber: parentData?.phoneNumber || "",
        address: parentData?.address || {
          subCity: "",
          city: "",
          country: "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parentDashboardProps: IParentDashboardProps & {
        selectedTab: "overview" | "children";
      } = {
        parent: mockParent,
        children: children,
        stats: parentStats || {
          totalChildren: 0,
          activeChildren: 0,
          totalTimeSpent: 0,
          averageProgress: 0,
          totalCoinsEarned: 0,
        },
        selectedTab: selectedTab as "overview" | "children",
      };
      return <ParentDashboard {...parentDashboardProps} />;
    }

    // Default to student dashboard if role is not determined or no data
    console.log(
      "🎯 [DashboardPage] Defaulting to student dashboard for role:",
      userRole
    );

    const defaultStats: IStudentStats = {
      totalCourses: 0,
      activeCourses: 0,
      totalCoins: 0,
      codingStreak: 0,
      timeSpent: 0,
      averageProgress: 0,
    };

    return (
      <StudentDashboard
        courses={courses}
        stats={defaultStats}
        selectedTab={selectedTab}
      />
    );
  };

  // Get header content based on role
  const getHeaderContent = () => {
    const userName = session?.user?.name || "User";

    if (!session?.user) {
      return {
        title: "Dashboard",
        description: `Welcome back, ${userName}!`,
        icon: <Home className="h-8 w-8 text-primary" />,
        stats: [],
      };
    }

    if (userRole === "student" && studentStats) {
      return {
        title: `${userName}`,
        description: `Welcome back! Continue your coding journey`,
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

    if (userRole === "parent") {
      return {
        title: `${userName}`,
        description: `Welcome back! Monitor your children's progress`,
        icon: <Users className="h-8 w-8 text-primary" />,
        stats: parentStats
          ? [
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
            ]
          : [],
      };
    }

    // Default header
    return {
      title: "Dashboard",
      description: `Welcome back, ${userName}!`,
      icon: <Home className="h-8 w-8 text-primary" />,
      stats: [],
    };
  };

  const headerContent = getHeaderContent();

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
                  {headerContent.stats.map((stat, index) => (
                    <div
                      key={index}
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

              {userRole === "parent" && (
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
          {getDashboardContent()}
        </motion.div>

        {/* Add Child Dialog */}
        <AddChildDialog
          open={addChildDialogOpen}
          onOpenChange={setAddChildDialogOpen}
          parentId={parentData?._id}
          onSuccess={() => {
            // Refresh the dashboard data
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
