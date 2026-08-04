import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { isEntitlementEffective, subscriptionApi } from "@/lib/api/subscription";
import type { ISubscription, SubscriptionPlan } from "@/types/subscription";

const PLAN_HIERARCHY: Record<string, number> = {
  Free: 0,
  Starter: 1,
  Builder: 2,
  "Pro-Bundle": 3,
  Organization: 4,
};

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = session?.token;
  const userId = session?.user?.id;

  const fetchUserSubscription = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // `/subscriptions/me` already filters on status and endDate server-side.
      const effective = await subscriptionApi.getMySubscription(token);
      setSubscription(isEntitlementEffective(effective) ? effective : null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch subscription";
      setError(message);
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchUserSubscription();
  }, [fetchUserSubscription]);

  /** Active, paid-for and not past its end date. */
  const hasEffectiveEntitlement = (): boolean =>
    isEntitlementEffective(subscription);

  const hasActiveSubscription = (planName?: SubscriptionPlan): boolean => {
    if (!hasEffectiveEntitlement()) return false;
    if (!planName) return true;
    return subscription?.planName === planName;
  };

  const hasAnyActiveSubscription = (): boolean => hasEffectiveEntitlement();

  const getCurrentPlan = (): string =>
    hasEffectiveEntitlement() ? (subscription?.planName ?? "Free") : "Free";

  const isOnFreePlan = (): boolean => getCurrentPlan() === "Free";

  /** Date the current entitlement lapses, or null on Free / no plan. */
  const getExpiryDate = (): Date | null => {
    if (!hasEffectiveEntitlement() || !subscription) return null;
    if (subscription.planName === "Free") return null;
    return new Date(subscription.endDate);
  };

  const getDaysRemaining = (): number | null => {
    const expiry = getExpiryDate();
    if (!expiry) return null;
    return Math.max(
      0,
      Math.ceil((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    );
  };

  const canAccessFeature = (requiredPlan: SubscriptionPlan): boolean => {
    const currentLevel = PLAN_HIERARCHY[getCurrentPlan()] ?? 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] ?? 0;
    return currentLevel >= requiredLevel;
  };

  const cancelSubscription = async () => {
    await subscriptionApi.cancelMySubscription(token);
    await fetchUserSubscription();
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    hasAnyActiveSubscription,
    hasEffectiveEntitlement,
    getCurrentPlan,
    isOnFreePlan,
    getExpiryDate,
    getDaysRemaining,
    canAccessFeature,
    cancelSubscription,
    refreshSubscription: fetchUserSubscription,
  };
}
