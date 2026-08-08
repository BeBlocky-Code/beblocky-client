"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Star, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { getIdeLearnUrl } from "@/lib/utils";
import type { ICourse } from "@/types/course";
import { EnrollmentDialog } from "@/components/dialogs/enrollment-dialog";

interface CourseCardProps {
  course: ICourse;
  index: number;
  showProgress?: boolean;
  /** When provided, skips network — parent owns enrollment state. */
  isEnrolled?: boolean;
  totalHours?: number;
  studentsCount?: number;
  onEnrollmentChange?: (enrolled: boolean) => void;
}

export function CourseCard({
  course,
  index,
  showProgress = true,
  isEnrolled: isEnrolledProp,
  totalHours: totalHoursProp,
  studentsCount: studentsCountProp,
  onEnrollmentChange,
}: CourseCardProps) {
  const { data: session } = useSession();
  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);

  const isEnrolled = isEnrolledProp ?? localEnrolled;
  const totalHours =
    totalHoursProp ??
    (Array.isArray(course.lessons) && course.lessons.length > 0
      ? Math.max(1, course.lessons.length)
      : 2);
  const studentsCount =
    studentsCountProp ??
    (Array.isArray(course.students) ? course.students.length : 0);

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
                <div className="flex items-center gap-2 justify-center rounded-md bg-muted/40 py-2">
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
              {showProgress && course.progress != null && (
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

      <EnrollmentDialog
        course={course}
        isOpen={showEnrollmentDialog}
        onClose={() => setShowEnrollmentDialog(false)}
        onEnrollmentSuccess={() => {
          setLocalEnrolled(true);
          onEnrollmentChange?.(true);
        }}
      />
    </>
  );
}
