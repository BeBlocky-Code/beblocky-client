"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ICourse } from "@/types/course";
import { useSession } from "@/lib/auth-client";
import { studentApi } from "@/lib/api/student";
import { progressApi } from "@/lib/api/progress";
import { courseApi } from "@/lib/api/course";
import { toast } from "sonner";
import { getIdeLearnUrl } from "@/lib/utils";

interface EnrollmentDialogProps {
  course: ICourse | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentSuccess?: () => void;
}

export function EnrollmentDialog({
  course,
  isOpen,
  onClose,
  onEnrollmentSuccess,
}: EnrollmentDialogProps) {
  const { data: session } = useSession();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    if (!course || !session?.user?.id) {
      toast.error("Please sign in to enroll in courses");
      return;
    }

    setIsEnrolling(true);
    try {
      // Get student record
      const student = await studentApi.getStudentByUserId(session.user.id);

      // Gracefully check for existing progress; if not found, proceed without throwing
      const existing = await progressApi
        .getStudentCourseProgressSilently(student._id, course._id)
        .catch(() => null);
      if (existing) {
        window.location.href = getIdeLearnUrl(course._id);
        onClose();
        return;
      }

      // Create minimal progress entry (only required fields)
      await progressApi.createMinimalProgress(student._id, course._id);

      // Update course to add student to students array
      const currentStudents = Array.isArray((course as any).students)
        ? (course as any).students
        : [];

      if (!currentStudents.includes(student._id)) {
        await courseApi.updateCourse(course._id, {
          ...course,
          students: [...currentStudents, student._id],
        } as any);
      }

      toast.success(`Successfully enrolled in ${course.courseTitle}!`);
      onEnrollmentSuccess?.();
      onClose();

      // Navigate to IDE
      window.location.href = getIdeLearnUrl(course._id);
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      toast.error("Failed to enroll in course. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Ready to Enroll?
          </DialogTitle>
        </DialogHeader>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{course.courseTitle}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {course.courseDescription}
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">2h</div>
                <div className="text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{course.rating || "4.5"}</div>
                <div className="text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{course.courseLanguage}</div>
                <div className="text-muted-foreground">Language</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isEnrolling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="flex-1 gap-2"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Enroll Now
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
