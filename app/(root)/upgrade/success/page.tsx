"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle,
  Crown,
  Globe,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { usePayment } from "@/hooks/use-payment";
import { useSubscription } from "@/hooks/use-subscription";
import { subscriptionApi } from "@/lib/api/subscription";
import type { CheckoutStatus } from "@/lib/api/subscription";

const PLAN_PRESENTATION: Record<
  string,
  { name: string; icon: React.ReactNode; description: string }
> = {
  Starter: {
    name: "Starter Plan",
    icon: <Smartphone className="h-6 w-6" />,
    description: "Full mobile experience with engaging puzzles and characters",
  },
  Builder: {
    name: "Builder Plan",
    icon: <Globe className="h-6 w-6" />,
    description: "Transition to real coding with web technologies",
  },
  "Pro-Bundle": {
    name: "Pro Bundle",
    icon: <Crown className="h-6 w-6" />,
    description: "Complete family coding solution with premium features",
  },
};

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90_000;

type ActivationState = "pending" | "active" | "failed" | "timeout" | "missing";

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { getPendingCheckoutId, clearPendingCheckout } = usePayment();
  const { refreshSubscription } = useSubscription();

  const [state, setState] = useState<ActivationState>("pending");
  const [status, setStatus] = useState<CheckoutStatus | null>(null);

  const paymentId = searchParams.get("paymentId") ?? getPendingCheckoutId();
  const token = session?.token;
  const startedAt = useRef(Date.now());

  const finish = useCallback(
    (next: ActivationState) => {
      setState(next);
      if (next === "active") {
        clearPendingCheckout();
        refreshSubscription();
      }
    },
    [clearPendingCheckout, refreshSubscription]
  );

  useEffect(() => {
    if (!paymentId) {
      setState("missing");
      return;
    }
    if (!token) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (cancelled) return;

      try {
        const elapsed = Date.now() - startedAt.current;
        // Nudge the server to re-check the gateway if the webhook is slow.
        const result =
          elapsed > POLL_INTERVAL_MS * 3
            ? await subscriptionApi.verifyCheckout(paymentId, token)
            : await subscriptionApi.getCheckoutStatus(paymentId, token);

        if (cancelled) return;
        setStatus(result);

        if (result.subscription) {
          finish("active");
          return;
        }
        if (
          result.transactionStatus &&
          ["failed", "canceled", "expired", "unauthorized"].includes(
            result.transactionStatus.toLowerCase()
          )
        ) {
          finish("failed");
          return;
        }
        if (elapsed > POLL_TIMEOUT_MS) {
          finish("timeout");
          return;
        }
      } catch (error) {
        console.error("Could not read checkout status:", error);
        if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
          finish("timeout");
          return;
        }
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId, token, finish]);

  const subscription = status?.subscription ?? null;
  const presentation = subscription
    ? PLAN_PRESENTATION[subscription.planName]
    : null;

  if (state === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Confirming your payment...
          </h2>
          <p className="text-muted-foreground max-w-md">
            We&apos;re waiting for your payment provider to confirm the
            transaction. This usually takes a few seconds.
          </p>
        </div>
      </div>
    );
  }

  if (state !== "active") {
    const copy: Record<Exclude<ActivationState, "active" | "pending">, string> =
      {
        failed:
          "Your payment did not go through. You have not been charged for a plan.",
        timeout:
          "Your payment is still being confirmed. Refresh this page in a minute, or contact support if the charge went through.",
        missing:
          "We could not find a checkout to confirm. Start again from the plans page.",
      };

    return (
      <div className="container mx-auto max-w-xl p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              Payment not confirmed yet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{copy[state]}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/upgrade">Back to plans</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/support">Contact support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <motion.div
          className="border-b border-border rounded-lg p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Your subscription is active and ready to use.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {subscription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {presentation?.icon ?? <Crown className="h-6 w-6" />}
                  </div>
                  <div>
                    <div>{presentation?.name ?? subscription.planName}</div>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {subscription.billingCycle} billing
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {presentation?.description && (
                  <p className="text-muted-foreground">
                    {presentation.description}
                  </p>
                )}

                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Expires on{" "}
                    <span className="font-medium">
                      {formatDate(subscription.endDate)}
                    </span>
                  </span>
                </div>

                {subscription.features?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">What&apos;s included:</h4>
                    <ul className="space-y-2">
                      {subscription.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/children">Manage Children</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
