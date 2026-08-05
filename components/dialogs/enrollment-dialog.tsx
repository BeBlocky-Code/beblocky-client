"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { ICourse } from "@/types/course";
import { useSession } from "@/lib/auth-client";
import { studentApi } from "@/lib/api/student";
import { progressApi } from "@/lib/api/progress";
import { courseApi } from "@/lib/api/course";
import { toast } from "sonner";
import { getIdeLearnUrl } from "@/lib/utils";
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  dialogContentClass,
  dialogPrimaryBtnClass,
  dialogSecondaryBtnClass,
} from "@/components/dialogs/dialog-shell";

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
      const student = await studentApi.getStudentByUserId(session.user.id);

      const existing = await progressApi
        .getStudentCourseProgressSilently(student._id, course._id)
        .catch(() => null);
      if (existing) {
        window.location.href = getIdeLearnUrl(course._id);
        onClose();
        return;
      }

      await progressApi.createMinimalProgress(student._id, course._id);

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
      <DialogContent className={dialogContentClass}>
        <AppDialogHeader
          icon={<BookOpen className="h-5 w-5" />}
          title="Ready to enroll?"
          description="Jump into the IDE and start building right away."
        />

        <AppDialogBody>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {course.courseTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {course.courseDescription}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Duration", value: "2h" },
                {
                  label: "Rating",
                  value: String(course.rating || "4.5"),
                  icon: true,
                },
                { label: "Language", value: course.courseLanguage },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-muted/40 px-3 py-3 text-center"
                >
                  <div className="flex items-center justify-center gap-1 text-sm font-bold">
                    {item.icon && (
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    )}
                    {item.value}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AppDialogBody>

        <AppDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className={dialogSecondaryBtnClass}
            disabled={isEnrolling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className={`${dialogPrimaryBtnClass} gap-2`}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enrolling…
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                Enroll now
              </>
            )}
          </Button>
        </AppDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
