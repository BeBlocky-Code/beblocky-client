"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  TrendingUp,
  Coins,
  Clock,
  Target,
  Star,
  Award,
  Calendar,
  Plus,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatGradeLabel } from "@/lib/utils";
import type { IDashboardProps } from "@/types/dashboard-simple";
import type { ICourse } from "@/types/course";
import type { IStudentWithUserData } from "@/types/enriched-student";

export function ModernDashboard({
  userType,
  user,
  courses,
  children = [],
  stats,
}: IDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "courses" | "children"
  >("overview");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground mt-2">
                {userType === "student"
                  ? "Continue your learning journey"
                  : "Monitor your children's progress"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTab === "overview" ? "default" : "outline"}
                onClick={() => setSelectedTab("overview")}
                className="transition-all duration-200"
              >
                Overview
              </Button>
              <Button
                variant={selectedTab === "courses" ? "default" : "outline"}
                onClick={() => setSelectedTab("courses")}
                className="transition-all duration-200"
              >
                Courses
              </Button>
              {userType === "parent" && (
                <Button
                  variant={selectedTab === "children" ? "default" : "outline"}
                  onClick={() => setSelectedTab("children")}
                  className="transition-all duration-200"
                >
                  Children
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {userType === "student"
                    ? "Enrolled Courses"
                    : "Total Children"}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {userType === "student" ? (
                    <BookOpen className="h-4 w-4 text-white" />
                  ) : (
                    <Users className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {userType === "student" ? (stats as any)?.totalCourses || 0 : children.length}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {userType === "student"
                  ? "Active learning paths"
                  : "Children registered"}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  {userType === "student" ? "Coding Streak" : "Active Courses"}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {userType === "student" ? (
                    <Target className="h-4 w-4 text-white" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {userType === "student"
                  ? `${(stats as any)?.codingStreak || 0} days`
                  : (stats as any)?.activeChildren || 0}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {userType === "student" ? "Keep it up!" : "Currently active"}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {userType === "student" ? "Total Coins" : "Average Progress"}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {userType === "student" ? (
                    <Coins className="h-4 w-4 text-white" />
                  ) : (
                    <Award className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {userType === "student"
                  ? (stats as any)?.totalCoins || 0
                  : `${(stats as any)?.averageProgress || 0}%`}
              </div>
              {userType === "parent" && (
                <Progress value={(stats as any)?.averageProgress || 0} className="mt-2 h-2" />
              )}
              <p className="text-xs text-purple-600 dark:text-purple-400">
                {userType === "student"
                  ? "Earned through learning"
                  : "Across all children"}
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Time Spent
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {userType === "student" 
                  ? `${Math.floor(((stats as any)?.timeSpent || 0) / 60)}h ${((stats as any)?.timeSpent || 0) % 60}m`
                  : `${Math.floor(((stats as any)?.totalTimeSpent || 0) / 60)}h ${((stats as any)?.totalTimeSpent || 0) % 60}m`}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Total learning time
              </p>
            </Card>
          </motion.div>
        </motion.div>

        {/* Content based on selected tab */}
        {selectedTab === "overview" && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.slice(0, 3).map((course, index) => (
                    <motion.div
                      key={course._id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{course.courseTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.courseLanguage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{course.subType}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === "courses" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Courses</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {selectedTab === "children" && userType === "parent" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Children</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Child
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => (
                <StudentCard key={child._id} student={child} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, index }: { course: ICourse; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6 text-white" />
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Language</span>
              <Badge variant="outline">{course.courseLanguage}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
            </div>
            {course.progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}



// Student Card Component
function StudentCard({ student, index }: { student: IStudentWithUserData; index: number }) {
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
          <CardTitle className="text-lg">{student.name || "Unknown Student"}</CardTitle>
          <p className="text-sm text-muted-foreground">{student.email || "No email"}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Coins</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>{student.coins}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Streak</span>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-orange-500" />
                <span>{student.codingStreak} days</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Courses</span>
              <span>{student.enrolledCourses.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
