import type { IStudent } from "@/types/student";
import type { IAddChildDto } from "./children";

const defaultHeaders = { "Content-Type": "application/json" };

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

class ParentApi {
  async createParentFromUser(userId: string): Promise<IParent> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/from-user`;

    const response = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Parent API] createParentFromUser failed:", errorText);
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ [Parent API] createParentFromUser success:", data);
    return data;
  }

  async getParent(parentId: string): Promise<IParent> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  async getParentByUserId(userId: string): Promise<IParent> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/user/${userId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // NEW: GET /parents/:parentId/children - Get children of a parent
  async getChildrenByParent(parentId: string): Promise<IStudent[]> {

    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentId}/children`;

    const response = await fetch(url, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // NEW: GET /parents/:parentId/with-children - Get parent with populated children
  async getParentWithChildren(parentId: string): Promise<any> {

    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentId}/with-children`;

    const response = await fetch(url, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // NEW: POST /parents/:parentId/children - Add child to parent
  async addChildToParent(
    parentId: string,
    childData: IAddChildDto
  ): Promise<IStudent> {

    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentId}/children`;

    console.log("➡️  [Parent API] POST addChildToParent:", {
      url,
      parentId,
      payload: childData,
      hasAuth: true,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify(childData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Parent API] addChildToParent failed:", errorText);
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ [Parent API] addChildToParent success:", data);
    return data;
  }

  // NEW: PATCH /parents/:parentId - Update parent information
  async updateParent(
    parentId: string,
    parentData: Partial<IParent>
  ): Promise<IParent> {

    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify(parentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // DELETE /parents/:parentId - Delete parent profile
  async deleteParent(parentId: string): Promise<void> {

    const url = `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentId}`;

    console.log("➡️  [Parent API] DELETE deleteParent:", { url, parentId });

    const response = await fetch(url, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Parent API] deleteParent failed:", errorText);
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    console.log("✅ [Parent API] deleteParent success");
  }
}

export const parentApi = new ParentApi();
