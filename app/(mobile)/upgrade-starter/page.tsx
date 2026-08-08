"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Smartphone, ArrowRight, Lock, Rocket } from "lucide-react";
import { usePayment } from "@/hooks/use-payment";
import { useSession } from "@/lib/auth-client";
import {
  PaymentMethodSelector,
  PaymentProvider,
  type StripePaymentData,
  type ArifPayPaymentData,
} from "@/components/payment/payment-method-selector";
import { useToast } from "@/hooks/use-toast";
import { BillingCycle, SubscriptionPlan } from "@/types/subscription";
import { CurrencyStudentSelector } from "@/components/upgrade/currency-student-selector";
import { parentApi } from "@/lib/api/parent";
import { childrenApi } from "@/lib/api/children";
import type { IStudent } from "@/types/student";

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

const starterPlan: PricingPlan = {
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
  note: "Competes directly with Kodable, codeSpark",
};

// Currency conversion rates
const currencyRates = {
  USD: 1,
  ETB: 160,
  KES: 129.2,
  NGN: 1531.87,
};

export default function UpgradeStarterPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] =
    useState<PaymentProvider | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<
    "USD" | "ETB" | "KES" | "NGN"
  >("USD");
  const [studentCount, setStudentCount] = useState(1);
  const [children, setChildren] = useState<IStudent[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

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

  const [isAnnual, setIsAnnual] = useState(false);

  // Load children when session is available
  useEffect(() => {
    const loadChildren = async () => {
      if (!session?.user?.id) return;

      setLoadingChildren(true);
      try {
        // Get parent by user ID
        const parent = await parentApi.getParentByUserId(session.user.id);

        // Get children for this parent
        const childrenData = await childrenApi.getChildrenByParent(parent._id);
        setChildren(childrenData);
        // Set student count to number of children, minimum 1
        setStudentCount(Math.max(1, childrenData.length));
      } catch (error) {
        console.error("Failed to load children:", error);
        // If parent doesn't exist yet, that's okay - they can add children later
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildren();
  }, [session?.user?.id]);

  const getPrice = (plan: PricingPlan) => {
    if (typeof plan.monthlyPrice === "string") return plan.monthlyPrice;

    const basePrice = isAnnual
      ? Number(plan.annualPrice)
      : Number(plan.monthlyPrice);
    const convertedPrice = basePrice * currencyRates[selectedCurrency];

    // Format based on currency
    switch (selectedCurrency) {
      case "USD":
        return `$${convertedPrice.toFixed(2)}`;
      case "ETB":
        return `Br${convertedPrice.toFixed(0)}`;
      case "KES":
        return `KSh${convertedPrice.toFixed(0)}`;
      case "NGN":
        return `₦${convertedPrice.toFixed(0)}`;
      default:
        return `$${convertedPrice.toFixed(2)}`;
    }
  };

  const getPeriod = (plan: PricingPlan) => {
    if (typeof plan.monthlyPrice === "string") return "";
    return isAnnual ? "/year" : "/month";
  };

  const handleChoosePlan = () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelect = async (
    provider: PaymentProvider,
    paymentData?: ArifPayPaymentData | StripePaymentData
  ) => {
    if (!session?.user?.id || !paymentData) {
      toast({
        title: "Payment Error",
        description: "Missing payment information",
        variant: "destructive",
      });
      return;
    }

    try {
      await startCheckout({
        planName: SubscriptionPlan.STARTER,
        billingCycle: isAnnual ? BillingCycle.YEARLY : BillingCycle.MONTHLY,
        provider,
        phone: paymentData.phoneNumber || undefined,
        quantity: studentCount,
      });
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        className="text-center mb-10 max-w-3xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          Unlock the Starter Plan
        </h1>
        <p className="text-muted-foreground text-lg mx-auto">
          Get the full mobile experience with engaging puzzles and characters
          for your child.
        </p>
      </motion.div>

      {/* Currency and Student Selector */}
      <CurrencyStudentSelector
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        studentCount={studentCount}
        onStudentCountChange={setStudentCount}
        isAnnual={isAnnual}
        onBillingChange={setIsAnnual}
      />

      {/* Starter Plan Card */}
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      >
        <Card
          className={`h-full shadow-lg hover:shadow-xl transition-all duration-300 relative ring-2 ring-primary`}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              Recommended
            </Badge>
          </div>

          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              {starterPlan.icon}
            </div>
            <CardTitle className="text-xl mb-2">{starterPlan.name}</CardTitle>
            <p className="text-sm text-muted-foreground mb-2">
              {starterPlan.audience}
            </p>
            <p className="text-xs text-muted-foreground">
              {starterPlan.description}
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">
                  {getPrice(starterPlan)}
                </span>
                <span className="text-muted-foreground">
                  {getPeriod(starterPlan)}
                </span>
              </div>
              {studentCount > 1 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Total for {studentCount} student{studentCount > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {starterPlan.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className="flex items-start gap-2 text-sm"
                >
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 group shadow-lg"
              size="lg"
              onClick={handleChoosePlan}
              disabled={paymentLoading || loadingChildren}
            >
              <Rocket className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Upgrade to Starter Plan
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {starterPlan.note && (
              <p className="text-xs text-muted-foreground mt-3 text-center italic">
                {starterPlan.note}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Note */}
      <motion.div
        className="mt-10 text-center text-sm text-muted-foreground flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Lock className="h-4 w-4" />
        Your information is secure and encrypted.
      </motion.div>

      {/* Payment Method Selector Dialog */}
      <Dialog open={showPaymentSelector} onOpenChange={setShowPaymentSelector}>
        <DialogContent className="w-full max-w-[98vw] sm:max-w-[90vw] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1400px] max-h-[95vh] h-[70vh] p-6 overflow-y-auto scrollbar-hide">
          <DialogHeader className="sr-only">
            <DialogTitle>Choose Payment Method</DialogTitle>
          </DialogHeader>
          <PaymentMethodSelector
            onProviderChange={(p) => setSelectedPaymentProvider(p)}
            onSelect={handlePaymentMethodSelect}
            loading={paymentLoading}
            selectedProvider={selectedPaymentProvider || undefined}
            userId={session?.user?.id || ""}
            planName="Starter Plan"
            billingCycle="monthly"
            amount={
              // Pass unconverted USD amount; conversion for ArifPay happens in payload util
              (typeof starterPlan.monthlyPrice === "number"
                ? starterPlan.monthlyPrice
                : 6.99) * studentCount
            }
            userEmail={session?.user?.email}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
