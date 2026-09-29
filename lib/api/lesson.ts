import type { ILesson } from "@/types/lesson";
import { getApiAuthHeaders } from "@/lib/auth-client";

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Simple API client for lesson operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function simpleFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getApiAuthHeaders();

  console.log("🌐 [Lesson API] Making request to:", url);

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...((options?.headers as Record<string, string>) ?? {}),
      },
    });

    console.log("🌐 [Lesson API] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Lesson API] Error Response:", errorText);
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ [Lesson API] Success Response:", data);
    return data;
  } catch (error) {
    console.error("❌ [Lesson API] Request failed:", error);
    throw error;
  }
}

export class LessonApi {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const data = await simpleFetch<ApiResponse<T>>(endpoint, options);

      // If the response is already an array, wrap it in the expected format
      if (Array.isArray(data)) {
        console.log(
          "✅ [Lesson API] Wrapping array response in expected format"
        );
        return {
          data: data as T,
          success: true,
          message: "Lessons fetched successfully",
        } as ApiResponse<T>;
      }

      return data;
    } catch (error) {
      console.error("❌ [Lesson API] Request failed:", error);
      throw error;
    }
  }

  // GET /lessons - Get all lessons
  static async getAllLessons(): Promise<ApiResponse<ILesson[]>> {
    return this.request<ILesson[]>("/lessons", {
      method: "GET",
    });
  }

  // GET /lessons/:id - Get specific lesson
  static async getLessonById(id: string): Promise<ApiResponse<ILesson>> {
    return this.request<ILesson>(`/lessons/${id}`, {
      method: "GET",
    });
  }

  // GET /lessons/course/:courseId - Get lessons by course
  static async getLessonsByCourse(
    courseId: string
  ): Promise<ApiResponse<ILesson[]>> {
    return this.request<ILesson[]>(`/lessons/course/${courseId}`, {
      method: "GET",
    });
  }
}

// Instance methods for backward compatibility
export const lessonApi = {
  async getAllLessons(): Promise<ILesson[]> {
    const response = await LessonApi.getAllLessons();
    return response.data;
  },

  async getLessonById(id: string): Promise<ILesson> {
    const response = await LessonApi.getLessonById(id);
    return response.data;
  },

  async getLessonsByCourse(courseId: string): Promise<ILesson[]> {
    const response = await LessonApi.getLessonsByCourse(courseId);
    return response.data;
  },
};
