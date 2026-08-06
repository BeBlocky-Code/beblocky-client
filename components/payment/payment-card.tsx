"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield } from "lucide-react";

export enum PaymentProvider {
  ARIFPAY = "arifpay",
  STRIPE = "stripe",
}

interface PaymentMethod {
  id: PaymentProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
  available: boolean;
  processingTime: string;
  popularityBadge?: string;
}

interface PaymentCardProps {
  method: PaymentMethod;
  selected: boolean;
  hovered: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  index: number;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  method,
  selected,
  hovered,
  onHoverStart,
  onHoverEnd,
  index,
}) => (
  <motion.div
    key={method.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onHoverStart={onHoverStart}
    onHoverEnd={onHoverEnd}
  >
    {/* Use a label to associate the entire card with the hidden radio item */}
    <label htmlFor={`payment-${method.id}`} className="block">
      <Card
        className={`relative cursor-pointer transition-all duration-200 overflow-hidden ${
          selected
            ? "ring-2 ring-primary border-primary shadow-lg"
            : "hover:border-primary/30 hover:shadow-sm"
        } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Soft selected wash */}
        {selected && (
          <div className="absolute inset-0 bg-primary/5" />
        )}

        <CardHeader className="pb-3 sm:pb-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <RadioGroupItem
                value={method.id}
                id={`payment-${method.id}`}
                disabled={!method.available}
                className="sr-only"
              />

              {/* Icon */}
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary sm:h-14 sm:w-14"
                animate={{
                  scale: selected ? 1.05 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                {method.icon}
              </motion.div>

              {/* Method Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <CardTitle className="text-base sm:text-lg">
                    {method.name}
                  </CardTitle>
                  {method.recommended && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1 w-fit">
                      <Star className="h-3 w-3 mr-1" />
                      {method.popularityBadge || "Recommended"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  {method.description}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {method.processingTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Secure
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary self-center shadow-sm sm:h-8 sm:w-8 sm:self-auto"
                >
                  <Check className="h-3 w-3 text-primary-foreground sm:h-4 sm:w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="pt-0 relative px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {method.features.map((feature, featureIndex) => (
              <motion.div
                key={featureIndex}
                className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm p-2 sm:p-4 rounded-lg bg-muted/30"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: featureIndex * 0.05 }}
              >
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-muted-foreground text-xs sm:text-sm font-medium line-clamp-1">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </label>
  </motion.div>
);

export default PaymentCard;
