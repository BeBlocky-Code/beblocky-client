"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Smartphone, Globe, Building, Crown } from "lucide-react";
import {
  CourseFilters,
  CourseHeader,
  PlanSection,
  CourseEmptyState,
  CourseResultsCount,
  CourseLoadingState,
} from "@/components/courses";
import { BundlesShowcase } from "@/components/courses/bundles-showcase";
import { CourseDetailsDialog } from "@/components/dialogs/course-detail";
import { EnrollmentDialog } from "@/components/dialogs/enrollment-dialog";
import type { ICourse } from "@/types/course";
import { CourseSubscriptionType } from "@/types/course";
import { useCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { LanguageLogo } from "@/components/shared/language-logos";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { CourseStatus } from "@/types/course";
import { lessonApi } from "@/lib/api/lesson";
import { canAccessCourse } from "@/lib/utils/subscription-hierarchy";
import { studentApi } from "@/lib/api/student";
import { progressApi } from "@/lib/api/progress";
import { courseApi } from "@/lib/api/course";
import { toast } from "sonner";
import { getIdeLearnUrl } from "@/lib/utils";

export default function CoursesPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { courses, loading, error, refetch } = useCourses();
  const { subscription } = useSubscription();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState<ICourse | null>(
    null
  );
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<string[]>([]);
  const [courseDurations, setCourseDurations] = useState<
    Record<string, number>
  >({});
  const [courseStudents, setCourseStudents] = useState<Record<string, number>>(
    {}
  );
  const [userRole, setUserRole] = useState<string>("student");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, boolean>>(
    {}
  );

  // Determine user type based on role
  const userType: "student" | "parent" =
    userRole === "parent" ? "parent" : "student";

  // Filter only active courses
  const activeCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course) => course.status === CourseStatus.ACTIVE);
  }, [courses]);

  // Group courses by plan (all active courses)
  const coursesByPlan = useMemo(() => {
    if (!activeCourses) return {};

    const grouped = activeCourses.reduce(
      (acc: Record<string, ICourse[]>, course) => {
        const plan = course.subType || CourseSubscriptionType.FREE;
        if (!acc[plan]) {
          acc[plan] = [];
        }
        acc[plan].push(course);
        return acc;
      },
      {}
    );

    return grouped;
  }, [activeCourses]);

  // Filter courses within each plan
  const filteredCoursesByPlan = useMemo(() => {
    const filtered: Record<string, ICourse[]> = {};

    Object.entries(coursesByPlan).forEach(([plan, planCourses]) => {
      const filteredCourses = planCourses.filter((course) => {
        const matchesSearch =
          course.courseTitle
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.courseDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesLanguage =
          selectedLanguage === "all" ||
          course.courseLanguage === selectedLanguage;
        const matchesPlan =
          selectedPlan === "all" || course.subType === selectedPlan;

        return matchesSearch && matchesLanguage && matchesPlan;
      });

      if (filteredCourses.length > 0) {
        filtered[plan] = filteredCourses;
      }
    });

    return filtered;
  }, [coursesByPlan, searchTerm, selectedLanguage, selectedPlan]);

  const planConfig = {
    [CourseSubscriptionType.FREE]: {
      name: "Free Plan",
      description: "Perfect for getting started with basic coding concepts",
      icon: <Sparkles className="h-5 w-5" />,
      gradient:
        "from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/50",
      color: "text-gray-600",
      badgeVariant: "secondary" as const,
    },
    [CourseSubscriptionType.STARTER]: {
      name: "Starter Plan",
      description:
        "Full mobile experience with engaging puzzles and characters",
      icon: <Smartphone className="h-5 w-5" />,
      gradient:
        "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
      color: "text-blue-600",
      badgeVariant: "default" as const,
    },
    [CourseSubscriptionType.BUILDER]: {
      name: "Builder Plan",
      description: "Transition to real coding with web technologies",
      icon: <Globe className="h-5 w-5" />,
      gradient:
        "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
      color: "text-green-600",
      badgeVariant: "default" as const,
    },
    [CourseSubscriptionType.PRO]: {
      name: "Pro Bundle",
      description: "Complete learning experience with advanced features",
      icon: <Crown className="h-5 w-5" />,
      gradient:
        "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
      color: "text-purple-600",
      badgeVariant: "default" as const,
    },
    // Add fallback for any unknown plan types
    unknown: {
      name: "Other",
      description: "Additional courses",
      icon: <Sparkles className="h-5 w-5" />,
      gradient:
        "from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/50",
      color: "text-gray-600",
      badgeVariant: "secondary" as const,
    },
    [CourseSubscriptionType.ORGANIZATION]: {
      name: "Organization",
      description: "Enterprise solutions for schools and organizations",
      icon: <Building className="h-5 w-5" />,
      gradient:
        "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
      color: "text-orange-600",
      badgeVariant: "default" as const,
    },
  };

  const togglePlanExpansion = (plan: string) => {
    setExpandedPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  // Initialize expanded plans with all available plans
  useEffect(() => {
    const availablePlans = Object.keys(coursesByPlan);
    if (availablePlans.length > 0) {
      setExpandedPlans(availablePlans);
    }
  }, [coursesByPlan]);

  // Use session for role; resolve student id for enrollment checks
  useEffect(() => {
    if (!session?.user?.id) return;

    const role = session.user.roles?.[0] ?? "student";
    setUserRole(role);

    if (role === "student") {
      studentApi
        .getStudentByUserId(session.user.id)
        .then((student) => setStudentId(student._id))
        .catch(() => setStudentId(null));
    } else {
      setStudentId(null);
    }
  }, [session?.user?.id, session?.user?.roles]);

  // Fetch lesson data for all courses
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!activeCourses || activeCourses.length === 0) return;

      const durations: Record<string, number> = {};
      const students: Record<string, number> = {};

      for (const course of activeCourses) {
        try {
          // Fetch lesson data for duration
          const lessons = await lessonApi.getLessonsByCourse(course._id);
          const totalMinutes = lessons.reduce(
            (sum, lesson) => sum + (Number(lesson.duration) || 0),
            0
          );
          const hours =
            totalMinutes > 0 ? Math.max(1, Math.round(totalMinutes / 60)) : 2;
          durations[course._id] = hours;

          // Calculate students count
          const count = Array.isArray((course as any).students)
            ? ((course as any).students as string[]).length
            : 0;
          students[course._id] = count;
        } catch (error) {
          console.warn("Failed to fetch data for course:", course._id, error);
          durations[course._id] = 2;
          students[course._id] = 0;
        }
      }

      setCourseDurations(durations);
      setCourseStudents(students);
    };

    fetchCourseData();
  }, [activeCourses]);

  // Resolve per-course enrollment status using silent progress check
  useEffect(() => {
    const resolveEnrollment = async () => {
      if (!studentId || !activeCourses || activeCourses.length === 0) return;
      const entries = await Promise.all(
        activeCourses.map(async (course) => {
          try {
            const progress = await progressApi.getStudentCourseProgressSilently(
              studentId,
              course._id
            );
            return [course._id, !!progress] as const;
          } catch {
            return [course._id, false] as const;
          }
        })
      );
      const map: Record<string, boolean> = {};
      for (const [id, enrolled] of entries) map[id] = enrolled;
      setEnrollmentMap(map);
    };
    resolveEnrollment();
  }, [studentId, activeCourses]);

  const handleCourseClick = (course: ICourse) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const openIdeForCourse = (courseId: string) => {
    if (!session?.user?.id) return;
    window.open(getIdeLearnUrl(courseId), "_blank");
  };

  const handleEnroll = async (courseId: string) => {
    const course = activeCourses.find((c) => c._id === courseId);
    if (!course) return;

    // If we already know it's enrolled, go straight to IDE
    if (enrollmentMap[courseId]) {
      openIdeForCourse(courseId);
      return;
    }

    // Double check silently in case the map hasn't resolved yet
    if (studentId) {
      try {
        const progress = await progressApi.getStudentCourseProgressSilently(
          studentId,
          courseId
        );
        if (progress) {
          setEnrollmentMap((prev) => ({ ...prev, [courseId]: true }));
          openIdeForCourse(courseId);
          return;
        }
      } catch {}
    }

    // Not enrolled yet – open enrollment dialog
    setEnrollmentCourse(course);
    setIsEnrollmentDialogOpen(true);
  };

  const handleAddToPlan = (courseId: string) => {
    // Redirect to upgrade page
    router.push("/upgrade");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <CourseLoadingState
        loading={loading}
        sessionLoading={sessionLoading}
        error={error}
        onRetry={refetch}
      />

      {/* Content - Only show when not loading and no error */}
      {!sessionLoading && !loading && !error && (
        <div className="space-y-4 sm:space-y-6">
          <CourseHeader />

          <CourseFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
          />

          <CourseResultsCount
            filteredCount={Object.values(filteredCoursesByPlan).flat().length}
            totalCount={activeCourses?.length || 0}
            loading={loading}
            error={error}
          />

          <BundlesShowcase />

          {/* Courses by Plan */}
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(filteredCoursesByPlan).map(
              ([plan, planCourses]) => {
                const config =
                  planConfig[plan as CourseSubscriptionType] ||
                  planConfig["unknown"];
                const isExpanded = expandedPlans.includes(plan);

                return (
                  <PlanSection
                    key={plan}
                    plan={plan}
                    courses={planCourses}
                    config={config}
                    isExpanded={isExpanded}
                    courseDurations={courseDurations}
                    courseStudents={courseStudents}
                    enrollmentMap={enrollmentMap}
                    userType={userType}
                    canAccessCourse={canAccessCourse}
                    userPlan={subscription?.planName || null}
                    onToggleExpansion={togglePlanExpansion}
                    onCourseClick={handleCourseClick}
                    onEnroll={handleEnroll}
                    onAddToPlan={handleAddToPlan}
                  />
                );
              }
            )}
          </div>

          {/* Empty States */}
          {Object.keys(filteredCoursesByPlan).length === 0 &&
            courses &&
            courses.length > 0 && <CourseEmptyState type="no-results" />}

          {!loading &&
            !error &&
            (!activeCourses || activeCourses.length === 0) && (
              <CourseEmptyState
                type="no-courses"
                onUpgrade={() => router.push("/upgrade")}
              />
            )}
        </div>
      )}

      {/* Course Details Dialog */}
      <CourseDetailsDialog
        course={selectedCourse}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userType={userType}
        onEnroll={handleEnroll}
        onAddToPlan={handleAddToPlan}
      />

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        course={enrollmentCourse}
        isOpen={isEnrollmentDialogOpen}
        onClose={() => {
          setIsEnrollmentDialogOpen(false);
          setEnrollmentCourse(null);
        }}
        onEnrollmentSuccess={() => {
          if (enrollmentCourse) {
            setEnrollmentMap((prev) => ({
              ...prev,
              [enrollmentCourse._id]: true,
            }));
          }
        }}
      />
    </div>
  );
}
