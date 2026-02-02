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

class UserApi {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const session = await getSession();

      if (session && typeof session === "object" && "user" in session) {
        const user = (session as { user: { id: string; email?: string } }).user;
        if (user?.id) {
          return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.id}`,
            "X-User-Id": user.id,
            "X-User-Email": user.email || "",
          };
        }
      }

      return {
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.warn("Failed to get session for auth headers:", error);
      return {
        "Content-Type": "application/json",
      };
    }
  }

  async getUserById(userId: string): Promise<IUser> {
    const authHeaders = await this.getAuthHeaders();

    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders,
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
    const authHeaders = await this.getAuthHeaders();

    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/email/${email}`;

    const response = await fetch(url, {
      method: "GET",
      headers: authHeaders,
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
    const authHeaders = await this.getAuthHeaders();

    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`;

    console.log("➡️  [User API] DELETE deleteUser:", { url, userId });

    const response = await fetch(url, {
      method: "DELETE",
      headers: authHeaders,
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
