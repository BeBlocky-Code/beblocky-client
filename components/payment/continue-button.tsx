"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { PaymentProvider } from "./payment-card";

interface ContinueButtonProps {
  selectedProvider?: PaymentProvider;
  loading: boolean;
  isProcessing: boolean;
  phoneNumber: string;
  onClick: () => void;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({
  selectedProvider,
  loading,
  isProcessing,
  phoneNumber,
  onClick,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="bg-background/95 backdrop-blur-sm pt-4 sm:pt-6 pb-3 sm:pb-4 border-t border-border/50"
  >
    <Button
      className="w-full sm:w-auto sm:min-w-[200px] h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-300 group"
      size="lg"
      disabled={
        loading ||
        isProcessing ||
        (selectedProvider === PaymentProvider.ARIFPAY && !phoneNumber.trim())
      }
      onClick={onClick}
    >
      <AnimatePresence mode="wait">
        {loading || isProcessing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <div className="absolute inset-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-transparent border-t-white/50 animate-spin animation-delay-150" />
            </div>
            <span className="text-sm sm:text-base">
              {isProcessing ? "Creating Payment..." : "Processing..."}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="continue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">
              Continue with{" "}
              {selectedProvider === PaymentProvider.ARIFPAY
                ? "Local Payment"
                : "International Payment"}
            </span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>

    <p className="text-center text-xs text-muted-foreground mt-2 sm:mt-3 flex items-center justify-center gap-2">
      <Lock className="h-3 w-3" />
      <span className="text-xs">
        Your payment information is secure and encrypted
      </span>
    </p>
  </motion.div>
);

export default ContinueButton;
