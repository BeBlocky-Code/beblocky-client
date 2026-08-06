"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CourseHeaderProps {
  title?: string;
  description?: string;
}

export function CourseHeader({
  title = "Explore Courses",
  description = "Discover amazing coding courses designed for young learners",
}: CourseHeaderProps) {
  return (
    <motion.div
      className="rounded-lg border border-border bg-muted/40 p-4 sm:p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:gap-3 sm:text-3xl md:text-4xl">
            <Sparkles className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
