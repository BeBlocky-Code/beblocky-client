"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  showProgress?: boolean;
  progressValue?: number;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  showProgress = false,
  progressValue,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-6 transition-shadow duration-300 hover:shadow-md group">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {showProgress && progressValue !== undefined && (
          <Progress value={progressValue} className="mt-2 h-2" />
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </Card>
    </motion.div>
  );
}
