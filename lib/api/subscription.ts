import { SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";
import type {
  ISubscription,
  ICreateSubscriptionDto,
  IUpdateSubscriptionDto,
} from "@/types/subscription";

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Simple API client for subscription operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function simpleFetch<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("🌐 [Subscription API] Making request to:", url);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("🌐 [Subscription API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Subscription API] Error Response:", errorText);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ [Subscription API] Success Response:", data);
    return data;
  } catch (error) {
    console.error("❌ [Subscription API] Request failed:", error);
    throw error;
  }
}

export class SubscriptionApi {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
    token?: string
  ): Promise<ApiResponse<T>> {
    try {
      const data = await simpleFetch<ApiResponse<T>>(endpoint, options, token);

      // If the response is already an array, wrap it in the expected format
      if (Array.isArray(data)) {
        console.log(
          "✅ [Subscription API] Wrapping array response in expected format"
        );
        return {
          data: data as T,
          success: true,
          message: "Subscriptions fetched successfully",
        } as ApiResponse<T>;
      }

      return data;
    } catch (error) {
      console.error("❌ [Subscription API] Request failed:", error);
      throw error;
    }
  }

  // POST /subscriptions - Create new subscription
  static async createSubscription(
    subscriptionData: ICreateSubscriptionDto
  ): Promise<ApiResponse<ISubscription>> {
    return this.request<ISubscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  }

  // GET /subscriptions - Get all subscriptions
  static async getAllSubscriptions(): Promise<ApiResponse<ISubscription[]>> {
    return this.request<ISubscription[]>("/subscriptions", {
      method: "GET",
    });
  }

  // GET /subscriptions/:id - Get single subscription
  static async getSubscriptionById(
    id: string
  ): Promise<ApiResponse<ISubscription>> {
    return this.request<ISubscription>(`/subscriptions/${id}`, {
      method: "GET",
    });
  }

  // GET /subscriptions/user/:userId - Get user's subscriptions
  static async getUserSubscriptions(
    userId: string,
    token?: string
  ): Promise<ApiResponse<ISubscription[]>> {
    return this.request<ISubscription[]>(
      `/subscriptions/user/${userId}`,
      { method: "GET" },
      token
    );
  }

  // PATCH /subscriptions/:id - Update subscription
  static async updateSubscription(
    id: string,
    subscriptionData: IUpdateSubscriptionDto
  ): Promise<ApiResponse<ISubscription>> {
    return this.request<ISubscription>(`/subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(subscriptionData),
    });
  }

  // DELETE /subscriptions/:id - Delete subscription
  static async deleteSubscription(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/subscriptions/${id}`, {
      method: "DELETE",
    });
  }

  // GET /subscriptions/active/all - Get all active subscriptions
  static async getActiveSubscriptions(): Promise<ApiResponse<ISubscription[]>> {
    return this.request<ISubscription[]>("/subscriptions/active/all", {
      method: "GET",
    });
  }

  // GET /subscriptions/status/:status - Get subscriptions by status
  static async getSubscriptionsByStatus(
    status: SubscriptionStatus
  ): Promise<ApiResponse<ISubscription[]>> {
    return this.request<ISubscription[]>(`/subscriptions/status/${status}`, {
      method: "GET",
    });
  }

  // GET /subscriptions/plan/:planName - Get subscriptions by plan
  static async getSubscriptionsByPlan(
    planName: SubscriptionPlan
  ): Promise<ApiResponse<ISubscription[]>> {
    return this.request<ISubscription[]>(`/subscriptions/plan/${planName}`, {
      method: "GET",
    });
  }

  // GET /subscriptions/expiring - Get expiring subscriptions
  static async getExpiringSubscriptions(
    days: number = 7
  ): Promise<ApiResponse<ISubscription[]>> {
    return this.request<ISubscription[]>(
      `/subscriptions/expiring?days=${days}`,
      {
        method: "GET",
      }
    );
  }
}

// Instance methods for backward compatibility
export const subscriptionApi = {
  async createSubscription(
    subscriptionData: ICreateSubscriptionDto
  ): Promise<ISubscription> {
    const response = await SubscriptionApi.createSubscription(subscriptionData);
    return response.data;
  },

  async getAllSubscriptions(): Promise<ISubscription[]> {
    const response = await SubscriptionApi.getAllSubscriptions();
    return response.data;
  },

  async getSubscriptionById(id: string): Promise<ISubscription> {
    const response = await SubscriptionApi.getSubscriptionById(id);
    return response.data;
  },

  async getUserSubscriptions(
    userId: string,
    token?: string
  ): Promise<ISubscription[]> {
    const response = await SubscriptionApi.getUserSubscriptions(userId, token);
    return response.data;
  },

  async updateSubscription(
    id: string,
    subscriptionData: IUpdateSubscriptionDto
  ): Promise<ISubscription> {
    const response = await SubscriptionApi.updateSubscription(
      id,
      subscriptionData
    );
    return response.data;
  },

  async deleteSubscription(id: string): Promise<void> {
    await SubscriptionApi.deleteSubscription(id);
  },

  async getActiveSubscriptions(): Promise<ISubscription[]> {
    const response = await SubscriptionApi.getActiveSubscriptions();
    return response.data;
  },

  async getSubscriptionsByStatus(
    status: SubscriptionStatus
  ): Promise<ISubscription[]> {
    const response = await SubscriptionApi.getSubscriptionsByStatus(status);
    return response.data;
  },

  async getSubscriptionsByPlan(
    planName: SubscriptionPlan
  ): Promise<ISubscription[]> {
    const response = await SubscriptionApi.getSubscriptionsByPlan(planName);
    return response.data;
  },

  async getExpiringSubscriptions(days: number = 7): Promise<ISubscription[]> {
    const response = await SubscriptionApi.getExpiringSubscriptions(days);
    return response.data;
  },

  // Helper method to get user's active subscription
  async getUserActiveSubscription(
    userId: string,
    token?: string
  ): Promise<ISubscription[]> {
    const userSubscriptions = await this.getUserSubscriptions(userId, token);
    return userSubscriptions.filter(
      (sub) => sub.status === SubscriptionStatus.ACTIVE
    );
  },
};
