"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { isEntitlementEffective, subscriptionApi } from "@/lib/api/subscription";
import { queryKeys } from "@/lib/query-keys";
import type { ISubscription, SubscriptionPlan } from "@/types/subscription";

const PLAN_HIERARCHY: Record<string, number> = {
  Free: 0,
  Starter: 1,
  Builder: 2,
  "Pro-Bundle": 3,
  Organization: 4,
};

/**
 * Shared subscription query. Mounted from the sidebar and several pages —
 * TanStack Query dedupes so `/subscriptions/me` runs once per stale window.
 */
export function useMySubscription() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const token = session?.token;
  const userId = session?.user?.id;

  const query = useQuery({
    queryKey: queryKeys.subscriptions.byUser(userId || ""),
    queryFn: async (): Promise<ISubscription | null> => {
      const effective = await subscriptionApi.getMySubscription(token);
      return isEntitlementEffective(effective) ? effective : null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const subscription = query.data ?? null;

  const refreshSubscription = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.subscriptions.byUser(userId),
    });
  }, [queryClient, userId]);

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
    await refreshSubscription();
  };

  return {
    subscription,
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to fetch subscription"
      : null,
    hasActiveSubscription,
    hasAnyActiveSubscription,
    hasEffectiveEntitlement,
    getCurrentPlan,
    isOnFreePlan,
    getExpiryDate,
    getDaysRemaining,
    canAccessFeature,
    cancelSubscription,
    refreshSubscription,
  };
}

/** @deprecated Prefer `useMySubscription` from `@/lib/hooks`. */
export const useSubscription = useMySubscription;
