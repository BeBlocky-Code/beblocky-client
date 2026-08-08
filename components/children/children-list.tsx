"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  BookOpen,
  Coins,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ICourse } from "@/types/course";
import type { IStudentWithUserData } from "@/types/enriched-student";

interface ChildrenListProps {
  studentList: IStudentWithUserData[];
  courses: ICourse[];
  onAddChild: () => void;
  onEditChild: (child: IStudentWithUserData) => void;
  onDeleteChild: (childId: string) => void;
  onManageCourses: (child: IStudentWithUserData) => void;
}

export function ChildrenList({
  studentList,
  courses,
  onAddChild,
  onEditChild,
  onDeleteChild,
  onManageCourses,
}: ChildrenListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");

  const filteredChildren = studentList.filter((child) => {
    const matchesSearch =
      child.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      child.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesGrade =
      filterGrade === "all" || child.grade?.toString() === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const getEnrolledCoursesInfo = (child: IStudentWithUserData) => {
    const enrolledCourses = courses.filter((course) =>
      child.enrolledCourses.includes(course._id)
    );
    return enrolledCourses;
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="rounded-lg border border-border bg-muted/40 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Manage Children
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your children&apos;s profiles and learning journey
            </p>
          </div>
          <Button onClick={onAddChild} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Child
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search children by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="1">Grade 1</SelectItem>
            <SelectItem value="2">Grade 2</SelectItem>
            <SelectItem value="3">Grade 3</SelectItem>
            <SelectItem value="4">Grade 4</SelectItem>
            <SelectItem value="5">Grade 5</SelectItem>
            <SelectItem value="6">Grade 6</SelectItem>
            <SelectItem value="7">Grade 7</SelectItem>
            <SelectItem value="8">Grade 8</SelectItem>
            <SelectItem value="9">Grade 9</SelectItem>
            <SelectItem value="10">Grade 10</SelectItem>
            <SelectItem value="11">Grade 11</SelectItem>
            <SelectItem value="12">Grade 12</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-muted-foreground">
          Showing {filteredChildren.length} of {studentList.length} children
        </p>
      </motion.div>

      {/* Children Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredChildren.map((child) => {
          const enrolledCourses = getEnrolledCoursesInfo(child);

          return (
            <motion.div key={child._id} variants={itemVariants}>
              <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {child.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditChild(child)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteChild(child._id || "")}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {child.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{child.email}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Grade:</span>
                    <Badge variant="outline">{child.grade || "Not set"}</Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span>{child.coins} coins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{child.codingStreak} day streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>{enrolledCourses.length} courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>{formatTimeSpent(child.totalTimeSpent)}</span>
                    </div>
                  </div>

                  {/* Subscription */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan:</span>
                    <Badge
                      variant={
                        child.subscription === "pro" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {child.subscription || "Free"}
                    </Badge>
                  </div>

                  {/* Enrolled Courses */}
                  {enrolledCourses.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">
                        Recent Courses:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {enrolledCourses.slice(0, 2).map((course) => (
                          <Badge
                            key={course._id}
                            variant="outline"
                            className="text-xs"
                          >
                            {course.courseLanguage}
                          </Badge>
                        ))}
                        {enrolledCourses.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{enrolledCourses.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => onManageCourses(child)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Courses
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filteredChildren.length === 0 && studentList.length > 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No children found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters.
          </p>
        </motion.div>
      )}

      {/* No Children State */}
      {studentList.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No children added yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first child to begin their coding journey.
          </p>
          <Button onClick={onAddChild} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Your First Child
          </Button>
        </motion.div>
      )}
    </div>
  );
}
