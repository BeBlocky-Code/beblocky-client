"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CourseCard } from "./course-card";
import type { ICourse } from "@/types/course";
import { CourseSubscriptionType } from "@/types/course";

interface PlanConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

interface PlanSectionProps {
  plan: string;
  courses: ICourse[];
  config: PlanConfig;
  isExpanded: boolean;
  courseDurations: Record<string, number>;
  courseStudents: Record<string, number>;
  enrollmentMap: Record<string, boolean>;
  userType: "student" | "parent";
  canAccessCourse: (
    plan: any,
    courseSubType: CourseSubscriptionType
  ) => boolean;
  userPlan: any;
  onToggleExpansion: (plan: string) => void;
  onCourseClick: (course: ICourse) => void;
  onEnroll: (courseId: string) => void;
  onAddToPlan: (courseId: string) => void;
}

export function PlanSection({
  plan,
  courses,
  config,
  isExpanded,
  courseDurations,
  courseStudents,
  enrollmentMap,
  userType,
  canAccessCourse,
  userPlan,
  onToggleExpansion,
  onCourseClick,
  onEnroll,
  onAddToPlan,
}: PlanSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg bg-primary/10 p-2 ${config.color}`}
              >
                {config.icon}
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  {config.name}
                </CardTitle>
                <p className="hidden sm:block text-sm text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={config.badgeVariant} className="text-sm">
                {courses.length} courses
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpansion(plan)}
                className="p-2"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      duration={courseDurations[course._id]}
                      studentCount={courseStudents[course._id]}
                      isEnrolled={enrollmentMap[course._id]}
                      userType={userType}
                      canAccess={canAccessCourse(userPlan, course.subType)}
                      badgeVariant={config.badgeVariant}
                      onViewDetails={onCourseClick}
                      onEnroll={onEnroll}
                      onAddToPlan={onAddToPlan}
                    />
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
