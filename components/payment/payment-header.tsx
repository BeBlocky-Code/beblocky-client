"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const PaymentHeader: React.FC = () => (
  <motion.div
    className="text-center bg-background/95 backdrop-blur-sm pt-3 sm:pt-4 pb-4 sm:pb-6 z-10 border-b border-border/50"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
      <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
      Secure Payment
    </div>
    <h3 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
      Choose Payment Method
    </h3>
    <p className="text-sm sm:text-base text-muted-foreground">
      Select your preferred payment method to continue with your subscription
    </p>
  </motion.div>
);

export default PaymentHeader;
