"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarClock, Crown, Sparkles, Smartphone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { usePayment } from "@/hooks/use-payment";
import { useSubscription } from "@/hooks/use-subscription";
import {
  PaymentMethodSelector,
  PaymentProvider,
  type StripePaymentData,
  type ArifPayPaymentData,
} from "@/components/payment/payment-method-selector";
import { useToast } from "@/hooks/use-toast";
import { BillingCycle, SubscriptionPlan } from "@/types/subscription";
import { useSession } from "@/lib/auth-client";
import { CurrencyStudentSelector } from "@/components/upgrade/currency-student-selector";
import { PricingPlans } from "@/components/upgrade/pricing-plans";
import { SchoolPlan } from "@/components/upgrade/school-plan";
import { FAQSection } from "@/components/upgrade/faq-section";
import { getCurrentPlanIdFromSubscription } from "@/lib/utils/subscription-hierarchy";

/** UI plan ids map to the catalog plan names the API expects. */
const PLAN_ID_TO_PLAN_NAME: Record<string, SubscriptionPlan> = {
  starter: SubscriptionPlan.STARTER,
  builder: SubscriptionPlan.BUILDER,
  pro: SubscriptionPlan.PRO_BUNDLE,
};

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

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    audience: "Ages 6–10",
    description: "Perfect for getting started with basic coding concepts",
    monthlyPrice: "Free",
    annualPrice: "Free",
    features: [
      "Limited access to mobile app levels",
      "Basic blocks (similar to Scratch/Blockly)",
      "Intro level content",
      "Community support",
    ],
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: "starter",
    name: "Starter",
    audience: "Ages 6–10",
    description: "Full mobile experience with engaging puzzles and characters",
    monthlyPrice: 6.99,
    annualPrice: 59.99,
    features: [
      "Full mobile app access",
      "More puzzles & characters",
      "Progress tracking",
      "Parental dashboard",
      "Email support",
    ],
    icon: <Smartphone className="h-6 w-6" />,
  },
  {
    id: "builder",
    name: "Builder",
    audience: "Ages 8–14",
    description: "Transition to real coding with web technologies",
    monthlyPrice: 9.99,
    annualPrice: 89.99,
    features: [
      "Full web access",
      "HTML & CSS courses",
      "Intro Python programming",
      "Real coding projects",
      "Code editor access",
      "Priority support",
    ],
    popular: true,
    icon: <Globe className="h-6 w-6" />,
  },
  {
    id: "pro",
    name: "Pro Bundle",
    audience: "Families / Siblings",
    description: "Complete family coding solution with premium features",
    monthlyPrice: 13.99,
    annualPrice: 119.99,
    features: [
      "Mobile + Web access",
      "New projects monthly",
      "Bonus badges & rewards",
      "Multiple child accounts",
      "Advanced progress tracking",
      "Premium support",
    ],
    icon: <Crown className="h-6 w-6" />,
  },
];

// Currency conversion rates
const currencyRates = {
  USD: 1,
  ETB: 160,
  KES: 129.2,
  NGN: 1531.87,
};

const currencySymbols = {
  USD: "$",
  ETB: "ETB ",
  KES: "KES ",
  NGN: "₦",
};

export default function UpgradePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] =
    useState<PaymentProvider | null>(null);
  const [selectedCurrency, setSelectedCurrency] =
    useState<keyof typeof currencyRates>("USD");
  const [studentCount, setStudentCount] = useState(1);
  const [isAnnual, setIsAnnual] = useState(false);

  const { toast } = useToast();
  const { loading: paymentLoading, startCheckout } = usePayment({
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  const { subscription, getExpiryDate } = useSubscription();
  const currentPlanId = getCurrentPlanIdFromSubscription(subscription);
  const expiryDate = getExpiryDate();

  const convertPrice = (price: number | string): string => {
    if (typeof price === "string") return price;

    const convertedPrice = price * currencyRates[selectedCurrency];
    const symbol = currencySymbols[selectedCurrency];

    if (selectedCurrency === "USD") {
      return `${symbol}${convertedPrice.toFixed(2)}`;
    } else {
      return `${symbol}${Math.round(convertedPrice)}`;
    }
  };

  const getPlanBasePrice = (plan: PricingPlan): number | null => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return typeof price === "number" ? price : null;
  };

  const getPrice = (plan: PricingPlan) => {
    const basePrice = getPlanBasePrice(plan);
    if (basePrice === null) return String(plan.monthlyPrice);
    return convertPrice(basePrice * studentCount);
  };

  const getPeriod = (plan: PricingPlan) => {
    if (getPlanBasePrice(plan) === null) return "";
    return isAnnual ? "/year per student" : "/month per student";
  };

  const getSavings = (plan: PricingPlan) => {
    if (typeof plan.monthlyPrice === "string") return null;
    const monthlyTotal = (plan.monthlyPrice as number) * 12;
    const annualPrice = plan.annualPrice as number;
    const savings = monthlyTotal - annualPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const handleChoosePlan = (planId: string) => {
    if (planId === "free") {
      toast({
        title: "Free Plan Selected",
        description: "You're already on the free plan!",
      });
      return;
    }

    setSelectedPlan(planId);
    setShowPaymentSelector(true);
  };

  /**
   * Hands the plan choice to the API. Prices shown here are for display only —
   * the server re-derives what to charge from its own catalog.
   */
  const handlePaymentMethodSelect = async (
    provider: PaymentProvider,
    paymentData?: ArifPayPaymentData | StripePaymentData
  ) => {
    const planName = selectedPlan
      ? PLAN_ID_TO_PLAN_NAME[selectedPlan]
      : undefined;

    if (!planName) {
      toast({
        title: "Invalid Plan",
        description: "Please select a valid plan to continue.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPaymentProvider(provider);

    try {
      await startCheckout({
        planName,
        billingCycle: isAnnual ? BillingCycle.YEARLY : BillingCycle.MONTHLY,
        provider,
        phone: paymentData?.phoneNumber || undefined,
        quantity: studentCount,
      });
      setShowPaymentSelector(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <motion.div
        className="mb-6 sm:mb-8 rounded-lg border border-border bg-muted/40 p-4 sm:p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2 sm:gap-3 justify-center">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Choose Your Plan
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
              Unlock the full potential of coding education for your children
            </p>
            {expiryDate && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                Your {subscription?.planName} plan renews on{" "}
                {expiryDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Early Bird Promotion */}
  
      {/* Currency Toggle and Student Counter */}
      <CurrencyStudentSelector
        selectedCurrency={selectedCurrency}
        onCurrencyChange={(value: keyof typeof currencyRates) =>
          setSelectedCurrency(value)
        }
        studentCount={studentCount}
        onStudentCountChange={setStudentCount}
        isAnnual={isAnnual}
        onBillingChange={setIsAnnual}
      />

      {/* Pricing Plans */}
      <PricingPlans
        pricingPlans={pricingPlans}
        getPrice={getPrice}
        getPeriod={getPeriod}
        onChoosePlan={handleChoosePlan}
        currentUserPlan={currentPlanId}
      />

      {/* School Plan */}
      <SchoolPlan />

      {/* Payment Method Selector Dialog */}
      <Dialog open={showPaymentSelector} onOpenChange={setShowPaymentSelector}>
        <DialogContent className="w-full max-w-[98vw] sm:max-w-[90vw] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] max-h-[95vh] h-[70vh] p-6 overflow-y-auto scrollbar-hide">
          <DialogHeader className="sr-only">
            <DialogTitle>Choose Payment Method</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <PaymentMethodSelector
              onProviderChange={(p) => setSelectedPaymentProvider(p)}
              onSelect={handlePaymentMethodSelect}
              loading={paymentLoading}
              selectedProvider={selectedPaymentProvider || undefined}
              userId={session?.user?.id || ""}
              planName={selectedPlan}
              billingCycle={isAnnual ? "yearly" : "monthly"}
              amount={
                (getPlanBasePrice(
                  pricingPlans.find((p) => p.id === selectedPlan)!
                ) ?? 0) * studentCount
              }
              userEmail={session?.user?.email}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
