"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  TrendingUp,
  Coins,
  Calendar,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StatsCard } from "@/components/shared/stats-card";
import type { IParentDashboardProps } from "@/types/dashboard-simple";
import type { IStudent } from "@/types/student";
import { StudentCard } from "@/components/shared/student-card";
// Import the AddChildDialog component at the top
import { AddChildDialog } from "@/components/children/add-child-dialog";
import { studentApi } from "@/lib/api/student";

export function ParentDashboard({
  parent,
  children,
  stats,
  selectedTab = "overview",
}: IParentDashboardProps & { selectedTab?: "overview" | "children" }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  type UIStudent = IStudent & { _id?: string; name?: string; email?: string };
  const [recentActivityStudents, setRecentActivityStudents] = useState<
    UIStudent[]
  >([]);
  const [resolvedChildren, setResolvedChildren] = useState<UIStudent[]>(
    children as unknown as UIStudent[]
  );

  // Set recent activity students from children data
  useEffect(() => {
    if (children.length > 0) {
      const recentChildren = children.slice(0, 3);
      setRecentActivityStudents(recentChildren);
    }
  }, [children]);

  const refreshChildren = async () => {
    try {
      // Attempt to resolve child data with user info for display fields
      const enriched: UIStudent[] = [];
      for (const raw of children as unknown as UIStudent[]) {
        const studentId =
          (raw as any)?._id ?? (raw as any)?.id ?? (raw as any)?.studentId;
        if (!studentId) {
          enriched.push(raw);
          continue;
        }
        const student = await studentApi.getStudent(studentId as string);
        const name = (student as unknown as { name?: string }).name ?? (raw as UIStudent).name;
        const email = (raw as UIStudent).email;
        enriched.push({
          ...(raw as Partial<UIStudent>),
          ...(student as unknown as Partial<UIStudent>),
          _id: ((raw as any)?._id ?? (student as any)?._id) as string,
          name,
          email,
        } as UIStudent);
      }
      setResolvedChildren(enriched);
      setRecentActivityStudents(enriched.slice(0, 3));
    } catch (e) {
      // fallback to original children
      const fallback = children as unknown as UIStudent[];
      setResolvedChildren(fallback);
      setRecentActivityStudents(fallback.slice(0, 3));
    }
  };

  useEffect(() => {
    refreshChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatsCard
            title="Total Children"
            value={stats.totalChildren}
            description="Children registered"
            icon={Users}
            gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800"
            iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-blue-700 dark:text-blue-300"
            delay={0.1}
          />

          <StatsCard
            title="Active Learners"
            value={stats.activeChildren}
            description="Currently learning"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800"
            iconColor="bg-gradient-to-br from-green-500 to-green-600"
            textColor="text-green-700 dark:text-green-300"
            delay={0.2}
          />

          <StatsCard
            title="Total Coins Earned"
            value={stats.totalCoinsEarned}
            description="Across all children"
            icon={Coins}
            gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800"
            iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
            textColor="text-purple-700 dark:text-purple-300"
            delay={0.3}
          />

          <StatsCard
            title="Total Time Spent"
            value={`${Math.floor(stats.totalTimeSpent / 60)}h ${
              stats.totalTimeSpent % 60
            }m`}
            description="Combined learning time"
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800"
            iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
            textColor="text-orange-700 dark:text-orange-300"
            delay={0.4}
          />
        </motion.div>

        {/* Content based on selected tab */}
        {selectedTab === "overview" && (
          <motion.div
            className="space-y-6 sm:space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Overview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Children&apos;s Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Average Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stats.averageProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.averageProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  {recentActivityStudents.map((child, index) => (
                    <motion.div
                      key={
                        (child._id as string) ||
                        (child as any).id ||
                        `recent-${index}`
                      }
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {child.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {child.name || "Unknown Child"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {child.codingStreak || 0} day streak •{" "}
                            {child.coins || 0} coins
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {child.enrolledCourses?.length || 0} courses
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Family Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Learning Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">
                      {children.reduce(
                        (sum, child) => sum + child.enrolledCourses.length,
                        0
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Enrollments
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-secondary">
                      {Math.max(
                        ...children.map((child) => child.codingStreak),
                        0
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Longest Streak
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">
                      {children.reduce(
                        (sum, child) => sum + child.totalCoinsEarned,
                        0
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Coins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === "children" && (
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Your Children</h2>
              {/* Replace the existing AddChildModal usage in the header section with: */}
              <Button
                className="gap-2 w-full sm:w-auto"
                onClick={() => setAddDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add Child
              </Button>
            </div>
            {children.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Children Added
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven&apos;t added any of your children yet. Start by
                    adding your first child.
                  </p>
                  {/* Replace the AddChildModal in the empty state with: */}
                  <Button
                    className="gap-2"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Your First Child
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {resolvedChildren.map((child, index) => (
                  <StudentCard
                    key={
                      (child._id as string) ||
                      (child as any).id ||
                      `child-${index}`
                    }
                    student={child as unknown as IStudent}
                    index={index}
                    showDetailedStats={true}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Add Child Dialog */}
        <AddChildDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          parentId={parent?._id}
          onSuccess={refreshChildren}
        />
      </div>
    </div>
  );
}
