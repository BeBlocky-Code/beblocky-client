"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { useSubscription } from "@/hooks/use-subscription";
import { lessonApi } from "@/lib/api/lesson";
import { progressApi } from "@/lib/api/progress";
import { studentApi } from "@/lib/api/student";
import type { ICourse } from "@/types/course";
import {
  AppDialogBody,
  dialogContentWideClass,
} from "@/components/dialogs/dialog-shell";

import { CourseHero } from "./course-detail/course-hero";
import { CourseStats } from "./course-detail/course-stats";
import { CourseDetails } from "./course-detail/course-details";
import { CourseProgress } from "./course-detail/course-progress";
import { CourseReviews } from "./course-detail/course-reviews";
import { CourseActions } from "./course-detail/course-actions";

interface CourseDetailsDialogProps {
  course: ICourse | null;
  isOpen: boolean;
  onClose: () => void;
  userType: "student" | "parent";
  onEnroll?: (courseId: string) => void;
  onAddToPlan?: (courseId: string) => void;
}

export function CourseDetailsDialog({
  course,
  isOpen,
  onClose,
  userType,
  onEnroll,
  onAddToPlan,
}: CourseDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(2);
  const [studentsCount, setStudentsCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Get user ID from session
  const { data: session } = useSession();
  const { subscription } = useSubscription();

  // Use the same pattern as in user.ts to safely access user ID
  const userId = (() => {
    if (session && typeof session === "object" && "user" in session) {
      const user = (session as { user: { id: string; email?: string } }).user;
      return user?.id;
    }
    return undefined;
  })();

  // Validate userId to ensure it's not null/undefined/empty
  const isValidUserId: boolean = Boolean(
    userId && typeof userId === "string" && userId.trim().length > 0
  );

  // Fetch lesson data for duration calculation
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!course) return;

      try {
        const lessons = await lessonApi.getLessonsByCourse(course._id);
        const totalMinutes = lessons.reduce(
          (sum, lesson) => sum + (Number(lesson.duration) || 0),
          0
        );
        const hours =
          totalMinutes > 0 ? Math.max(1, Math.round(totalMinutes / 60)) : 2;
        setTotalHours(hours);
      } catch (error) {
        console.warn(
          "Failed to fetch lesson data for course:",
          course._id,
          error
        );
        setTotalHours(2); // Default fallback
      }
    };

    fetchLessonData();
  }, [course]);

  // Calculate students count from course data
  useEffect(() => {
    if (!course) return;

    const count = Array.isArray((course as any).students)
      ? ((course as any).students as string[]).length
      : 0;
    setStudentsCount(count);
  }, [course]);

  // Check enrollment status for students
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!course || !isValidUserId || userType !== "student") {
        setIsEnrolled(false);
        return;
      }

      try {
        const student = await studentApi.getStudentByUserId(userId!);
        const progress = await progressApi.getStudentCourseProgressSilently(
          student._id,
          course._id
        );
        setIsEnrolled(!!progress);
      } catch (error) {
        console.warn("Failed to check enrollment status:", error);
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [course, userId, isValidUserId, userType]);

  if (!course) return null;

  const difficulty =
    course.courseLanguage === "HTML"
      ? "Beginner"
      : course.courseLanguage === "Python"
        ? "Intermediate"
        : "Advanced";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${dialogContentWideClass} max-h-[90vh] overflow-y-auto scrollbar-hide`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Course details</DialogTitle>
        </DialogHeader>

        <AppDialogBody className="space-y-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <CourseHero course={course} />

            <div className="space-y-4">
              <div>
                <h1 className="mb-2 text-2xl font-bold tracking-tight">
                  {course.courseTitle}
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {course.courseDescription}
                </p>
              </div>

              <CourseStats
                rating={course.rating}
                totalHours={totalHours}
                studentsCount={studentsCount}
                difficulty={difficulty}
              />

              <CourseDetails course={course} />
              <CourseProgress progress={course.progress} />
              <CourseReviews
                course={course}
                userId={userId}
                isValidUserId={isValidUserId}
              />
            </div>

            <CourseActions
              course={course}
              userType={userType}
              isLoading={isLoading}
              isEnrolled={isEnrolled}
              subscription={subscription}
              onEnroll={onEnroll}
              onAddToPlan={onAddToPlan}
              onClose={onClose}
            />
          </motion.div>
        </AppDialogBody>
      </DialogContent>
    </Dialog>
  );
}
