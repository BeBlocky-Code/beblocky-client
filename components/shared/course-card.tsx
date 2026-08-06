"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Star, Clock, Users, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { getIdeLearnUrl } from "@/lib/utils";
import type { ICourse } from "@/types/course";
import type { ILesson } from "@/types/lesson";
import { lessonApi } from "@/lib/api/lesson";
import { progressApi } from "@/lib/api/progress";
import { studentApi } from "@/lib/api/student";
import { courseApi } from "@/lib/api/course";
import { toast } from "sonner";
import { EnrollmentDialog } from "@/components/dialogs/enrollment-dialog";

interface CourseCardProps {
  course: ICourse;
  index: number;
  showProgress?: boolean;
}

export function CourseCard({
  course,
  index,
  showProgress = true,
}: CourseCardProps) {
  const { data: session } = useSession();
  const [totalHours, setTotalHours] = useState(2);
  const [studentsCount, setStudentsCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Fetch lesson data for duration calculation
  useEffect(() => {
    const fetchLessonData = async () => {
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
  }, [course._id]);

  // Fetch student data and check enrollment
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user?.id) return;

      try {
        // Get student record
        const student = await studentApi.getStudentByUserId(session.user.id);
        setStudentId(student._id);

        // Check if student has progress for this course (silent + treat any progress as enrolled)
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
  }, [session?.user?.id, course._id]);

  // Calculate students count from course data
  useEffect(() => {
    const count = Array.isArray((course as any).students)
      ? ((course as any).students as string[]).length
      : 0;
    setStudentsCount(count);
  }, [course]);

  const handleCardClick = () => {
    if (isEnrolled && session?.user?.id) {
      window.location.href = getIdeLearnUrl(course._id);
    } else if (!isEnrolled) {
      setShowEnrollmentDialog(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className="h-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
          onClick={handleCardClick}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <Badge
                variant={course.status === "Active" ? "default" : "secondary"}
              >
                {course.status}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-1">
              {course.courseTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.courseDescription}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 justify-center rounded-md lag-muted/40 py-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{totalHours}h</span>
                </div>
                <div className="flex items-center gap-2 justify-center rounded-md bg-muted/40 py-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{studentsCount}</span>
                </div>
                <div className="flex items-center gap-2 justify-center rounded-md bg-muted/40 py-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <Badge variant="outline">{course.courseLanguage}</Badge>
              </div>
              {showProgress && course.progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isEnrolled ? "default" : "secondary"}>
                  {isEnrolled ? "Enrolled" : "Not Enrolled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        course={course}
        isOpen={showEnrollmentDialog}
        onClose={() => setShowEnrollmentDialog(false)}
        onEnrollmentSuccess={() => {
          setIsEnrolled(true);
        }}
      />
    </>
  );
}
