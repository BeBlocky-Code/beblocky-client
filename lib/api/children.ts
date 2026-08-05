import type {
  IStudent,
  ICreateStudentDto,
  IUpdateStudentDto,
} from "@/types/student";
import { getSession } from "@/lib/auth-client";

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// New interfaces for the updated API
export interface IAddChildDto {
  email: string;
  grade: number;
  /** When true, creates a new auth account for the child (requires name + password). */
  createAccount?: boolean;
  name?: string;
  password?: string;
  // Optional demographic fields — skippable to protect conversion
  dateOfBirth?: string; // ISO or yyyy-mm-dd
  gender?: "male" | "female" | "other";
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function simpleFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { data: session } = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (session?.token && !headers.Authorization) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  console.log("🌐 [Children API] Making request to:", url);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    console.log("🌐 [Children API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Children API] Error Response:", errorText);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ [Children API] Success Response:", data);
    return data;
  } catch (error) {
    console.error("❌ [Children API] Request failed:", error);
    throw error;
  }
}

export class ChildrenApi {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const data = await simpleFetch<ApiResponse<T>>(endpoint, options);

      // If the response is already an array, wrap it in the expected format
      if (Array.isArray(data)) {
        console.log(
          "✅ [Children API] Wrapping array response in expected format"
        );
        return {
          data: data as T,
          success: true,
          message: "Children fetched successfully",
        } as ApiResponse<T>;
      }

      return data;
    } catch (error) {
      console.error("❌ [Children API] Request failed:", error);
      throw error;
    }
  }

  // GET /children - Get all children
  static async getAllChildren(): Promise<ApiResponse<IStudent[]>> {
    return this.request<IStudent[]>("/children", {
      method: "GET",
    });
  }

  // GET /children/:id - Get single child
  static async getChildById(id: string): Promise<ApiResponse<IStudent>> {
    return this.request<IStudent>(`/children/${id}`, {
      method: "GET",
    });
  }

  // POST /children - Create new child
  static async createChild(
    childData: ICreateStudentDto
  ): Promise<ApiResponse<IStudent>> {
    return this.request<IStudent>("/children", {
      method: "POST",
      body: JSON.stringify(childData),
    });
  }

  // PUT /children/:id - Update child
  static async updateChild(
    id: string,
    childData: IUpdateStudentDto
  ): Promise<ApiResponse<IStudent>> {
    return this.request<IStudent>(`/children/${id}`, {
      method: "PUT",
      body: JSON.stringify(childData),
    });
  }

  // DELETE /children/:id - Delete child
  static async deleteChild(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/children/${id}`, {
      method: "DELETE",
    });
  }

  // NEW: GET /parents/:parentId/children - Get children of a parent
  static async getChildrenByParent(
    parentId: string
  ): Promise<ApiResponse<IStudent[]>> {
    return this.request<IStudent[]>(`/parents/${parentId}/children`, {
      method: "GET",
    });
  }

  // NEW: GET /parents/:parentId/with-children - Get parent with populated children
  static async getParentWithChildren(
    parentId: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/parents/${parentId}/with-children`, {
      method: "GET",
    });
  }

  // NEW: GET /students/parent/:parentId - Get students by parent ID
  static async getStudentsByParentId(
    parentId: string
  ): Promise<ApiResponse<IStudent[]>> {
    return this.request<IStudent[]>(`/students/parent/${parentId}`, {
      method: "GET",
    });
  }

  // NEW: POST /parents/:parentId/children - Add child to parent
  static async addChildToParent(
    parentId: string,
    childData: IAddChildDto
  ): Promise<ApiResponse<IStudent>> {
    return this.request<IStudent>(`/parents/${parentId}/children`, {
      method: "POST",
      body: JSON.stringify(childData),
    });
  }

  // Add course to child
  static async addCourseToChild(
    childId: string,
    courseId: string
  ): Promise<ApiResponse<IStudent>> {
    return this.request<IStudent>(`/children/${childId}/courses`, {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  // Remove course from child
  static async removeCourseFromChild(
    childId: string,
    courseId: string
  ): Promise<ApiResponse<IStudent>> {
    return this.request<IStudent>(`/children/${childId}/courses/${courseId}`, {
      method: "DELETE",
    });
  }
}

// Instance methods for backward compatibility
export const childrenApi = {
  async fetchAllChildren(): Promise<IStudent[]> {
    const response = await ChildrenApi.getAllChildren();
    return response.data;
  },

  async fetchChildById(id: string): Promise<IStudent> {
    const response = await ChildrenApi.getChildById(id);
    return response.data;
  },

  async createChild(childData: ICreateStudentDto): Promise<IStudent> {
    const response = await ChildrenApi.createChild(childData);
    return response.data;
  },

  async updateChild(
    id: string,
    childData: IUpdateStudentDto
  ): Promise<IStudent> {
    const response = await ChildrenApi.updateChild(id, childData);
    return response.data;
  },

  async deleteChild(id: string): Promise<void> {
    await ChildrenApi.deleteChild(id);
  },

  // Updated to use new endpoint
  async getChildrenByParent(parentId: string): Promise<IStudent[]> {
    const response = await ChildrenApi.getChildrenByParent(parentId);
    return response.data;
  },

  // New methods
  async getParentWithChildren(parentId: string): Promise<any> {
    const response = await ChildrenApi.getParentWithChildren(parentId);
    return response.data;
  },

  async getStudentsByParentId(parentId: string): Promise<IStudent[]> {
    const response = await ChildrenApi.getStudentsByParentId(parentId);
    return response.data;
  },

  async addChildToParent(
    parentId: string,
    childData: IAddChildDto
  ): Promise<IStudent> {
    const response = await ChildrenApi.addChildToParent(parentId, childData);
    return response.data;
  },

  async addCourseToChild(childId: string, courseId: string): Promise<IStudent> {
    const response = await ChildrenApi.addCourseToChild(childId, courseId);
    return response.data;
  },

  async removeCourseFromChild(
    childId: string,
    courseId: string
  ): Promise<IStudent> {
    const response = await ChildrenApi.removeCourseFromChild(childId, courseId);
    return response.data;
  },
};
