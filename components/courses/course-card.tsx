"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Clock, Users, Play, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { getIdeLearnUrl } from "@/lib/utils";
import { LanguageLogo } from "@/components/shared/language-logos";
import type { ICourse } from "@/types/course";

interface CourseCardProps {
  course: ICourse;
  duration?: number;
  studentCount?: number;
  isEnrolled?: boolean;
  userType: "student" | "parent";
  canAccess: boolean;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  onViewDetails: (course: ICourse) => void;
  onEnroll?: (courseId: string) => void;
  onAddToPlan?: (courseId: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CourseCard({
  course,
  duration = 2,
  studentCount = 0,
  isEnrolled = false,
  userType,
  canAccess,
  badgeVariant,
  onViewDetails,
  onEnroll,
  onAddToPlan,
}: CourseCardProps) {
  const { data: session } = useSession();

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEnrolled && userType === "student" && session?.user?.id) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = getIdeLearnUrl(course._id);
    } else {
      onViewDetails(course);
    }
  };

  const handleLearnButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnrolled && userType === "student" && session?.user?.id) {
      window.location.href = getIdeLearnUrl(course._id);
    } else {
      onViewDetails(course);
    }
  };

  const handleDetailsButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(course);
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card
        className="h-full shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white/80 dark:bg-black/20 backdrop-blur-sm"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <LanguageLogo
                language={course.courseLanguage}
                className="text-white"
                size={20}
              />
            </div>
            <Badge variant={badgeVariant} className="text-xs">
              {course.subType}
            </Badge>
          </div>
          <CardTitle className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
            {course.courseTitle}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {course.courseDescription}
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{course.courseLanguage}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                <span className="font-medium">
                  {course.rating?.toFixed(1) || "4.5"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{duration}h</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{studentCount} students</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {isEnrolled && userType === "student" ? (
                // Show both Learn and Details buttons for enrolled students
                <>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleLearnButtonClick}
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Learn
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={handleDetailsButtonClick}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 cursor-pointer" />
                    Details
                  </Button>
                </>
              ) : (
                // Show single button for non-enrolled users
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleLearnButtonClick}
                >
                  View Details
                </Button>
              )}
              {userType === "parent"
                ? // Parent logic: Show Add to Plan only if course is not covered by subscription
                  !canAccess &&
                  onAddToPlan && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPlan(course._id);
                      }}
                    >
                      Add to Plan
                    </Button>
                  )
                : // Student logic:
                  (() => {
                    const showEnrolled = isEnrolled && canAccess;
                    if (showEnrolled) {
                      return (
                        <Badge
                          variant="secondary"
                          className="w-full px-3 py-1 text-center"
                        >
                          Enrolled
                        </Badge>
                      );
                    }

                    return canAccess && onEnroll ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnroll(course._id);
                        }}
                      >
                        Enroll
                      </Button>
                    ) : null;
                  })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
