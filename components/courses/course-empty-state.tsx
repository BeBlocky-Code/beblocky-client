"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Smartphone, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface CourseEmptyStateProps {
  type: "no-results" | "no-courses";
  onUpgrade?: () => void;
}

export function CourseEmptyState({ type, onUpgrade }: CourseEmptyStateProps) {
  if (type === "no-results") {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No courses found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="mx-auto max-w-2xl border-border">
        <CardContent className="p-6 sm:p-12">
          <div className="mb-4 sm:mb-6">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary sm:mb-4 sm:h-20 sm:w-20">
              <Crown className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h2 className="mb-3 text-center text-xl font-bold text-foreground sm:mb-4 sm:text-2xl md:text-3xl">
              Unlock More Courses
            </h2>
            <p className="mb-4 text-center text-sm text-muted-foreground sm:mb-6 sm:text-lg">
              Upgrade your plan to access our complete library of coding courses
              designed for young learners
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-lg bg-muted/50 p-3 text-center sm:p-4">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mb-3 sm:h-12 sm:w-12">
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-1 text-sm font-semibold sm:text-base">
                Mobile Apps
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Interactive coding games
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center sm:p-4">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mb-3 sm:h-12 sm:w-12">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-1 text-sm font-semibold sm:text-base">
                Web Development
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                HTML, CSS, JavaScript
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center sm:p-4">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mb-3 sm:h-12 sm:w-12">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-1 text-sm font-semibold sm:text-base">
                Advanced Projects
              </h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Real-world applications
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button onClick={onUpgrade} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
