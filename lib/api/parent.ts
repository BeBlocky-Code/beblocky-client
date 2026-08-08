import type { IStudent } from "@/types/student";
import type { IAddChildDto } from "./children";
import { getApiAuthHeaders } from "@/lib/auth-client";

export interface CreateParentFromUserDto {
  userId: string;
}

export interface IParent {
  _id: string;
  userId: string;
  children: string[];
  relationship: "mother" | "father" | "guardian" | "other";
  phoneNumber: string;
  address: {
    subCity: string;
    city: string;
    country: string;
  };
  subscription?: string;
  paymentHistory: string[];
  createdAt: string;
  updatedAt: string;
}

async function parentFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  const authHeaders = await getApiAuthHeaders();
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...authHeaders,
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} - ${response.statusText} - ${errorText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

class ParentApi {
  async createParentFromUser(userId: string): Promise<IParent> {
    return parentFetch<IParent>("/parents/from-user", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async getParent(parentId: string): Promise<IParent> {
    return parentFetch<IParent>(`/parents/${parentId}`);
  }

  async getParentByUserId(userId: string): Promise<IParent> {
    return parentFetch<IParent>(`/parents/user/${userId}`);
  }

  async getChildrenByParent(parentId: string): Promise<IStudent[]> {
    return parentFetch<IStudent[]>(`/parents/${parentId}/children`);
  }

  async getParentWithChildren(parentId: string): Promise<any> {
    return parentFetch(`/parents/${parentId}/with-children`);
  }

  async addChildToParent(
    parentId: string,
    childData: IAddChildDto,
  ): Promise<IStudent> {
    return parentFetch<IStudent>(`/parents/${parentId}/children`, {
      method: "POST",
      body: JSON.stringify(childData),
    });
  }

  async updateParent(
    parentId: string,
    parentData: Partial<IParent>,
  ): Promise<IParent> {
    return parentFetch<IParent>(`/parents/${parentId}`, {
      method: "PATCH",
      body: JSON.stringify(parentData),
    });
  }

  async deleteParent(parentId: string): Promise<void> {
    await parentFetch<void>(`/parents/${parentId}`, {
      method: "DELETE",
    });
  }
}

export const parentApi = new ParentApi();
