import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { subscriptionApi } from "@/lib/api/subscription";
import type {
  CheckoutProvider,
  CheckoutSession,
} from "@/lib/api/subscription";
import type { BillingCycle, SubscriptionPlan } from "@/types/subscription";

interface UsePaymentOptions {
  onSuccess?: (session: CheckoutSession) => void;
  onError?: (error: string) => void;
}

export interface StartCheckoutInput {
  planName: SubscriptionPlan;
  billingCycle: BillingCycle;
  provider: CheckoutProvider;
  phone?: string;
  quantity?: number;
}

const PENDING_CHECKOUT_KEY = "beblocky:pending-checkout";

/**
 * Starts a checkout through the API. The server owns the price, the currency
 * and the entitlement window, so nothing chargeable is decided here.
 */
export function usePayment(options: UsePaymentOptions = {}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (input: StartCheckoutInput) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const checkout = await subscriptionApi.createCheckout(
        input,
        session.token
      );

      // Kept only so the success page can poll; it grants nothing on its own.
      sessionStorage.setItem(PENDING_CHECKOUT_KEY, checkout.paymentId);

      options.onSuccess?.(checkout);
      window.location.href = checkout.checkoutUrl;
      return checkout;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not start checkout";
      setError(message);
      options.onError?.(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPendingCheckoutId = (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(PENDING_CHECKOUT_KEY);
  };

  const clearPendingCheckout = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  };

  return {
    loading,
    error,
    startCheckout,
    getPendingCheckoutId,
    clearPendingCheckout,
  };
}
