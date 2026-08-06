"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Gift } from "lucide-react";

export function EarlyBirdPromotion() {
  return (
    <motion.div
      className="mb-6 sm:mb-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="rounded-full bg-primary/10 p-2 text-primary sm:p-3">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="mb-1 text-base font-semibold text-foreground sm:text-lg">
                Early Bird Special - Limited Time!
              </h3>
              <p className="text-sm text-muted-foreground sm:text-base">
                Get <strong>5 students for the price of 1</strong> when you
                subscribe in the next 2 months! Perfect for families with
                multiple children.
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl font-bold text-primary sm:text-2xl">
                80% OFF
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                Limited Time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
