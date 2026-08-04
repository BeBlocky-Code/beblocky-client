import { SubscriptionStatus } from "@/types/subscription";
import type {
  ISubscription,
  BillingCycle,
  SubscriptionPlan,
} from "@/types/subscription";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type CheckoutProvider = "arifpay" | "stripe";

export interface CreateCheckoutInput {
  planName: SubscriptionPlan;
  billingCycle: BillingCycle;
  provider: CheckoutProvider;
  /** Ethiopian MSISDN (251XXXXXXXXX), required by ArifPay. */
  phone?: string;
  quantity?: number;
}

export interface CheckoutSession {
  paymentId: string;
  checkoutUrl: string;
  provider: CheckoutProvider;
  planName: SubscriptionPlan;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
}

export interface CheckoutStatus {
  paymentId: string;
  provider?: CheckoutProvider;
  planName?: SubscriptionPlan;
  billingCycle?: BillingCycle;
  amount: number;
  currency?: string;
  transactionStatus?: string;
  subscription: ISubscription | null;
}

export interface PlanCatalogEntry {
  planName: SubscriptionPlan;
  planId: string;
  rank: number;
  features: string[];
  selfServe: boolean;
  maxSeats: number;
  pricing: Partial<Record<BillingCycle, { usd: number }>>;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail || `Request failed: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

/**
 * Subscription API. Entitlement is granted server-side after a verified
 * payment, so there is deliberately no way to create a paid subscription here.
 */
export const subscriptionApi = {
  /** Opens a gateway session for a plan the server prices itself. */
  async createCheckout(
    input: CreateCheckoutInput,
    token?: string
  ): Promise<CheckoutSession> {
    return apiFetch<CheckoutSession>(
      "/subscriptions/checkout",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  async getCheckoutStatus(
    paymentId: string,
    token?: string
  ): Promise<CheckoutStatus> {
    return apiFetch<CheckoutStatus>(
      `/subscriptions/checkout/${paymentId}/status`,
      { method: "GET" },
      token
    );
  },

  /** Asks the server to re-check the gateway when a webhook is running late. */
  async verifyCheckout(
    paymentId: string,
    token?: string
  ): Promise<CheckoutStatus> {
    return apiFetch<CheckoutStatus>(
      `/subscriptions/checkout/${paymentId}/verify`,
      { method: "POST" },
      token
    );
  },

  /** The subscription that actually grants access right now, or null. */
  async getMySubscription(token?: string): Promise<ISubscription | null> {
    return apiFetch<ISubscription | null>(
      "/subscriptions/me",
      { method: "GET" },
      token
    );
  },

  async getMySubscriptionHistory(token?: string): Promise<ISubscription[]> {
    const result = await apiFetch<ISubscription[] | null>(
      "/subscriptions/me/all",
      { method: "GET" },
      token
    );
    return result ?? [];
  },

  async cancelMySubscription(token?: string): Promise<ISubscription> {
    return apiFetch<ISubscription>(
      "/subscriptions/me/cancel",
      { method: "POST" },
      token
    );
  },

  async getPlans(token?: string): Promise<PlanCatalogEntry[]> {
    const result = await apiFetch<PlanCatalogEntry[] | null>(
      "/subscriptions/plans",
      { method: "GET" },
      token
    );
    return result ?? [];
  },
};

/** True when the subscription is active and still inside its paid period. */
export function isEntitlementEffective(
  subscription?: Pick<ISubscription, "status" | "endDate"> | null
): boolean {
  if (!subscription) return false;
  if (subscription.status !== SubscriptionStatus.ACTIVE) return false;
  return new Date(subscription.endDate).getTime() > Date.now();
}
