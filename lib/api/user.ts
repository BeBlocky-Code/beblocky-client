import { getSession } from "@/lib/auth-client";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "parent" | "student" | "teacher";
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

class UserApi {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: session } = await getSession();
    const headers = { ...defaultHeaders };
    if (session?.token) {
      headers["Authorization"] = `Bearer ${session.token}`;
    }
    return headers;
  }
  async getUserById(userId: string): Promise<IUser> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`;

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

  async getUserByEmail(email: string): Promise<IUser> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/email/${email}`;

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

  async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser> {
    const authHeaders = await this.getAuthHeaders();

    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  async deleteUser(userId: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`;

    console.log("➡️  [User API] DELETE deleteUser:", { url, userId });

    const response = await fetch(url, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [User API] deleteUser failed:", errorText);
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    console.log("✅ [User API] deleteUser success");
  }
}

export const userApi = new UserApi();
