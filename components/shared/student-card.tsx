"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Target, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatGradeLabel } from "@/lib/utils";
import type { IStudentWithUserData } from "@/types/enriched-student";

interface StudentCardProps {
  student: IStudentWithUserData;
  index: number;
  showDetailedStats?: boolean;
}

export function StudentCard({
  student,
  index,
  showDetailedStats = true,
}: StudentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              {student.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <Badge variant="secondary">
              {formatGradeLabel(student.grade)}
            </Badge>
          </div>
          <CardTitle className="text-lg">
            {student.name || "Unknown Student"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {student.email || "No email"}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coins</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>{student.coins || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Streak</span>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-orange-500" />
                <span>{student.codingStreak || 0} days</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Courses</span>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>{student.enrolledCourses?.length || 0}</span>
              </div>
            </div>
            {showDetailedStats && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Spent</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>{Math.floor((student.totalTimeSpent || 0) / 60)}h</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
