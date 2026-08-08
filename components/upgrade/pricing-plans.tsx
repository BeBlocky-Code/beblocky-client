"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  audience: string;
  description: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  note?: string;
}

interface PricingPlansProps {
  pricingPlans: PricingPlan[];
  getPrice: (plan: PricingPlan) => string;
  getPeriod: (plan: PricingPlan) => string;
  onChoosePlan: (planId: string) => void;
  currentUserPlan?: string | null;
}

export function PricingPlans({
  pricingPlans,
  getPrice,
  getPeriod,
  onChoosePlan,
  currentUserPlan,
}: PricingPlansProps) {
  // Helper function to determine if plan should show "Choose Plan" button
  const shouldShowChoosePlan = (planId: string) => {
    // Don't show for free plan
    if (planId === "free") return false;

    // If no current plan, show all paid plans
    if (!currentUserPlan || currentUserPlan === "free") return true;

    // Define plan hierarchy from lower to higher
    const planHierarchy = ["free", "starter", "builder", "pro"]; // ascending
    const currentPlanIndex = planHierarchy.indexOf(currentUserPlan);
    const planIndex = planHierarchy.indexOf(planId);

    // Only show plans that are higher tier than current plan
    return planIndex > currentPlanIndex;
  };

  // Exact current plan check
  const isCurrentUserPlan = (planId: string) => {
    return currentUserPlan === planId;
  };

  // Lower than current (covered)
  const isLowerThanCurrentPlan = (planId: string) => {
    if (!currentUserPlan || currentUserPlan === "free") return false;

    const planHierarchy = ["free", "starter", "builder", "pro"]; // ascending
    const currentPlanIndex = planHierarchy.indexOf(currentUserPlan);
    const planIndex = planHierarchy.indexOf(planId);

    return planIndex > -1 && planIndex < currentPlanIndex;
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
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {pricingPlans.map((plan) => (
        <motion.div key={plan.id} variants={itemVariants}>
          <Card
            className={`h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              plan.popular ? "ring-2 ring-primary shadow-lg" : "hover:shadow-lg"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                Most Popular
              </div>
            )}

            <CardHeader
              className={`pt-4 sm:pt-6 ${plan.popular ? "mt-6 sm:mt-8" : ""}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary sm:p-3">
                  {plan.icon}
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {plan.audience}
                  </p>
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {getPrice(plan)}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {getPeriod(plan)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentUserPlan(plan.id) ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : isLowerThanCurrentPlan(plan.id) ? (
                <Button className="w-full" disabled>
                  Covered
                </Button>
              ) : shouldShowChoosePlan(plan.id) ? (
                <Button
                  onClick={() => onChoosePlan(plan.id)}
                  className="w-full"
                >
                  Choose Plan
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
