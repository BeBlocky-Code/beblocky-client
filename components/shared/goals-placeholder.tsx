import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { motion } from "framer-motion";
import { GOAL_ACCOMPLISH_COINS } from "@/lib/api/goals";

export function GoalsPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target aria-hidden="true" className="h-5 w-5" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target aria-hidden="true" className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Set a challenge</h3>
            <p className="text-muted-foreground text-pretty">
              Finish lessons this week or complete a course. Each one pays{" "}
              {GOAL_ACCOMPLISH_COINS} coins.
            </p>
            <Button asChild className="mt-6 gap-2">
              <Link href="/goals">
                <Target aria-hidden="true" className="h-4 w-4" />
                Open goals
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
