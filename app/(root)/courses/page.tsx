"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Layers,
  Smartphone,
  Globe,
  Building,
  Crown,
} from "lucide-react";
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
import { CourseSubscriptionType, CourseStatus } from "@/types/course";
import {
  useCourses,
  useMySubscription,
  useStudentByUserId,
  useStudentProgress,
} from "@/lib/hooks";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { canAccessCourse } from "@/lib/utils/subscription-hierarchy";
import { getIdeLearnUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

function courseIdFromProgress(progress: { courseId: unknown }): string | null {
  const raw = progress.courseId;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "_id" in raw) {
    return String((raw as { _id: string })._id);
  }
  return null;
}

/** Rough hours from lesson id count — avoids N+1 lesson duration fetches. */
function estimateDurationHours(course: ICourse): number {
  const count = Array.isArray(course.lessons) ? course.lessons.length : 0;
  return count > 0 ? Math.max(1, count) : 2;
}

export default function CoursesPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
    refetch,
  } = useCourses();
  const { subscription } = useMySubscription();
  const router = useRouter();
  const queryClient = useQueryClient();

  const userId = session?.user?.id;
  const userRole = session?.user?.roles?.[0] ?? "student";
  const isStudent = userRole === "student";

  const studentQuery = useStudentByUserId(userId, isStudent);
  const studentId = studentQuery.data?._id;
  const progressQuery = useStudentProgress(studentId, isStudent);

  const loading =
    sessionLoading ||
    coursesLoading ||
    (isStudent && (studentQuery.isLoading || progressQuery.isLoading));
  const error = coursesError
    ? coursesError instanceof Error
      ? coursesError.message
      : "Failed to fetch courses"
    : null;

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

  const userType: "student" | "parent" =
    userRole === "parent" ? "parent" : "student";

  const activeCourses = useMemo(
    () => courses.filter((course) => course.status === CourseStatus.ACTIVE),
    [courses]
  );

  const courseDurations = useMemo(() => {
    const map: Record<string, number> = {};
    for (const course of activeCourses) {
      map[course._id] = estimateDurationHours(course);
    }
    return map;
  }, [activeCourses]);

  const courseStudents = useMemo(() => {
    const map: Record<string, number> = {};
    for (const course of activeCourses) {
      map[course._id] = Array.isArray(course.students)
        ? course.students.length
        : 0;
    }
    return map;
  }, [activeCourses]);

  const enrollmentMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    const enrolledIds = new Set<string>();

    for (const id of studentQuery.data?.enrolledCourses ?? []) {
      enrolledIds.add(String(id));
    }
    for (const progress of progressQuery.data ?? []) {
      const id = courseIdFromProgress(progress);
      if (id) enrolledIds.add(id);
    }
    for (const course of activeCourses) {
      map[course._id] = enrolledIds.has(course._id);
    }
    return map;
  }, [activeCourses, progressQuery.data, studentQuery.data?.enrolledCourses]);

  const coursesByPlan = useMemo(() => {
    return activeCourses.reduce((acc: Record<string, ICourse[]>, course) => {
      const plan = course.subType || CourseSubscriptionType.FREE;
      if (!acc[plan]) acc[plan] = [];
      acc[plan].push(course);
      return acc;
    }, {});
  }, [activeCourses]);

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
      if (filteredCourses.length > 0) filtered[plan] = filteredCourses;
    });
    return filtered;
  }, [coursesByPlan, searchTerm, selectedLanguage, selectedPlan]);

  const planConfig = {
    [CourseSubscriptionType.FREE]: {
      name: "Free Plan",
      description: "Perfect for getting started with basic coding concepts",
      icon: <BookOpen className="h-5 w-5" />,
      color: "text-primary",
      badgeVariant: "secondary" as const,
    },
    [CourseSubscriptionType.STARTER]: {
      name: "Starter Plan",
      description:
        "Full mobile experience with engaging puzzles and characters",
      icon: <Smartphone className="h-5 w-5" />,
      color: "text-primary",
      badgeVariant: "default" as const,
    },
    [CourseSubscriptionType.BUILDER]: {
      name: "Builder Plan",
      description: "Transition to real coding with web technologies",
      icon: <Globe className="h-5 w-5" />,
      color: "text-primary",
      badgeVariant: "default" as const,
    },
    [CourseSubscriptionType.PRO]: {
      name: "Pro Bundle",
      description: "Complete learning experience with advanced features",
      icon: <Crown className="h-5 w-5" />,
      color: "text-primary",
      badgeVariant: "default" as const,
    },
    unknown: {
      name: "Other",
      description: "Additional courses",
      icon: <Layers className="h-5 w-5" />,
      color: "text-muted-foreground",
      badgeVariant: "secondary" as const,
    },
    [CourseSubscriptionType.ORGANIZATION]: {
      name: "Organization",
      description: "Enterprise solutions for schools and organizations",
      icon: <Building className="h-5 w-5" />,
      color: "text-primary",
      badgeVariant: "default" as const,
    },
  };

  const togglePlanExpansion = (plan: string) => {
    setExpandedPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  useEffect(() => {
    const availablePlans = Object.keys(coursesByPlan);
    if (availablePlans.length > 0) {
      setExpandedPlans(availablePlans);
    }
  }, [coursesByPlan]);

  const handleCourseClick = (course: ICourse) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const openIdeForCourse = (courseId: string) => {
    if (!session?.user?.id) return;
    window.open(getIdeLearnUrl(courseId), "_blank");
  };

  const handleEnroll = (courseId: string) => {
    const course = activeCourses.find((c) => c._id === courseId);
    if (!course) return;

    if (enrollmentMap[courseId]) {
      openIdeForCourse(courseId);
      return;
    }

    setEnrollmentCourse(course);
    setIsEnrollmentDialogOpen(true);
  };

  const handleAddToPlan = (_courseId?: string) => {
    router.push("/upgrade");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <CourseLoadingState
        loading={loading}
        sessionLoading={sessionLoading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />

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
            totalCount={activeCourses.length}
            loading={loading}
            error={error}
          />

          <BundlesShowcase />

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

          {Object.keys(filteredCoursesByPlan).length === 0 &&
            courses.length > 0 && <CourseEmptyState type="no-results" />}

          {!loading && !error && activeCourses.length === 0 && (
            <CourseEmptyState
              type="no-courses"
              onUpgrade={() => router.push("/upgrade")}
            />
          )}
        </div>
      )}

      <CourseDetailsDialog
        course={selectedCourse}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userType={userType}
        onEnroll={handleEnroll}
        onAddToPlan={handleAddToPlan}
      />

      <EnrollmentDialog
        course={enrollmentCourse}
        isOpen={isEnrollmentDialogOpen}
        onClose={() => {
          setIsEnrollmentDialogOpen(false);
          setEnrollmentCourse(null);
        }}
        onEnrollmentSuccess={() => {
          if (studentId) {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.progress.byStudent(studentId),
            });
          }
          if (userId) {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.students.byUserId(userId),
            });
          }
        }}
      />
    </div>
  );
}
