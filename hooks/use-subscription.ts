import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { subscriptionApi } from "@/lib/api/subscription";
import type { ISubscription, SubscriptionPlan } from "@/types/subscription";

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's active subscription
  const fetchUserSubscription = async () => {
    if (!session?.user?.id) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activeSubscriptions =
        await subscriptionApi.getUserActiveSubscription(
          session.user.id,
          session.token
        );

      // Get the first active subscription (or null if none)
      const activeSubscription =
        Array.isArray(activeSubscriptions) && activeSubscriptions.length > 0
          ? activeSubscriptions[0]
          : null;

      setSubscription(activeSubscription);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch subscription";
      setError(errorMessage);
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription on mount and when session changes
  useEffect(() => {
    fetchUserSubscription();
  }, [session?.user?.id]);

  // Check if user has active subscription
  const hasActiveSubscription = (planName?: SubscriptionPlan): boolean => {
    if (!subscription) return false;
    if (!planName) return subscription.status === "active";
    return (
      subscription.status === "active" && subscription.planName === planName
    );
  };

  // Check if user has any active subscription
  const hasAnyActiveSubscription = (): boolean => {
    return subscription?.status === "active";
  };

  // Get current plan name
  const getCurrentPlan = (): string => {
    return subscription?.planName || "Free";
  };

  // Check if user is on free plan
  const isOnFreePlan = (): boolean => {
    return !subscription || subscription.planName === "Free";
  };

  // Check if user can access feature (based on plan)
  const canAccessFeature = (requiredPlan: SubscriptionPlan): boolean => {
    if (!subscription) return requiredPlan === "Free";

    const planHierarchy = {
      Free: 0,
      Starter: 1,
      Builder: 2,
      "Pro-Bundle": 3,
      Organization: 4,
    };

    const userPlanLevel = planHierarchy[subscription.planName] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

    return (
      subscription.status === "active" && userPlanLevel >= requiredPlanLevel
    );
  };

  // Refresh subscription data
  const refreshSubscription = () => {
    fetchUserSubscription();
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    hasAnyActiveSubscription,
    getCurrentPlan,
    isOnFreePlan,
    canAccessFeature,
    refreshSubscription,
  };
}
