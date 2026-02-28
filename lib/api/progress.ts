import type {
  IProgress,
  IStudentProgress,
  IProgressResponse,
  IChildProgressSummary,
} from "@/types/dashboard-simple";

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Simple API client for progress operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & { suppressErrors?: boolean };

async function simpleFetch<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  if (!options?.suppressErrors) {
    console.log("🌐 [Progress API] Making request to:", url);
  }

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!options?.suppressErrors) {
      console.log("🌐 [Progress API] Response status:", response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (!options?.suppressErrors) {
        console.error("❌ [Progress API] Error Response:", errorText);
      }
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    if (!options?.suppressErrors) {
      console.log("✅ [Progress API] Success Response:", data);
    }
    return data;
  } catch (error) {
    if (!options?.suppressErrors) {
      console.error("❌ [Progress API] Request failed:", error);
    }
    throw error;
  }
}

export class ProgressApi {
  private static async request<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const raw = await simpleFetch<unknown>(endpoint, options);

      // If backend already returns ApiResponse shape, use it
      if (
        raw &&
        typeof raw === "object" &&
        "data" in (raw as any) &&
        ("success" in (raw as any) || "message" in (raw as any))
      ) {
        return raw as ApiResponse<T>;
      }

      // If array or plain object, wrap into ApiResponse<T>
      const wrapped: ApiResponse<T> = {
        data: raw as T,
        success: true,
        message: "OK",
      };
      return wrapped;
    } catch (error) {
      if (!options?.suppressErrors) {
        console.error("❌ [Progress API] Request failed:", error);
      }
      throw error;
    }
  }

  // GET /progress/student/:studentId - Get student's progress
  static async getStudentProgress(
    studentId: string
  ): Promise<ApiResponse<IStudentProgress[]>> {
    return this.request<IStudentProgress[]>(`/progress/student/${studentId}`, {
      method: "GET",
    });
  }

  // GET /progress/student/:studentId/course/:courseId - Get student's course progress
  static async getStudentCourseProgress(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<IProgressResponse>> {
    // Align with backend route: /progress/:studentId/:courseId
    return this.request<IProgressResponse>(
      `/progress/${studentId}/${courseId}`,
      {
        method: "GET",
      }
    );
  }

  // Silent variant that does not log 404s and returns null when not found
  static async getStudentCourseProgressSilently(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<IProgressResponse> | null> {
    try {
      return await this.request<IProgressResponse>(
        `/progress/${studentId}/${courseId}`,
        { method: "GET", suppressErrors: true }
      );
    } catch {
      return null;
    }
  }

  // POST /progress - Create new progress entry
  static async createProgress(
    progressData: Partial<IProgress>
  ): Promise<ApiResponse<IProgress>> {
    return this.request<IProgress>("/progress", {
      method: "POST",
      body: JSON.stringify(progressData),
    });
  }

  // Convenience helper: create minimal progress with required fields only
  static async createMinimalProgress(
    studentId: string,
    courseId: string
  ): Promise<ApiResponse<IProgress>> {
    return this.request<IProgress>("/progress", {
      method: "POST",
      body: JSON.stringify({ studentId, courseId }),
    });
  }

  // PUT /progress/:id - Update progress entry
  static async updateProgress(
    id: string,
    progressData: Partial<IProgress>
  ): Promise<ApiResponse<IProgress>> {
    return this.request<IProgress>(`/progress/${id}`, {
      method: "PUT",
      body: JSON.stringify(progressData),
    });
  }

  // DELETE /progress/:id - Delete progress entry
  static async deleteProgress(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/progress/${id}`, {
      method: "DELETE",
    });
  }

  // GET /progress/parent/:parentId/summary - Get parent's children progress summary
  static async getParentProgressSummary(
    parentId: string
  ): Promise<ApiResponse<IChildProgressSummary[]>> {
    return this.request<IChildProgressSummary[]>(
      `/progress/parent/${parentId}/summary`,
      {
        method: "GET",
      }
    );
  }

  // GET /progress/course/:courseId - Get all progress for a course
  static async getCourseProgress(
    courseId: string
  ): Promise<ApiResponse<IProgress[]>> {
    return this.request<IProgress[]>(`/progress/course/${courseId}`, {
      method: "GET",
    });
  }

  // GET /progress/lesson/:lessonId - Get all progress for a lesson
  static async getLessonProgress(
    lessonId: string
  ): Promise<ApiResponse<IProgress[]>> {
    return this.request<IProgress[]>(`/progress/lesson/${lessonId}`, {
      method: "GET",
    });
  }

  // POST /progress/complete - Mark lesson/slide as completed
  static async markAsCompleted(
    studentId: string,
    courseId: string,
    lessonId: string,
    slideId?: string
  ): Promise<ApiResponse<IProgress>> {
    return this.request<IProgress>("/progress/complete", {
      method: "POST",
      body: JSON.stringify({
        studentId,
        courseId,
        lessonId,
        slideId,
        completed: true,
        completedAt: new Date().toISOString(),
      }),
    });
  }
}

// Instance methods for backward compatibility
export const progressApi = {
  async getStudentProgress(studentId: string): Promise<IStudentProgress[]> {
    const response = await ProgressApi.getStudentProgress(studentId);
    return response.data;
  },

  async getStudentCourseProgress(
    studentId: string,
    courseId: string
  ): Promise<IProgressResponse> {
    const response = await ProgressApi.getStudentCourseProgress(
      studentId,
      courseId
    );
    return response.data;
  },

  async getStudentCourseProgressSilently(
    studentId: string,
    courseId: string
  ): Promise<IProgressResponse | null> {
    const response = await ProgressApi.getStudentCourseProgressSilently(
      studentId,
      courseId
    );
    return response ? response.data : null;
  },

  async createProgress(progressData: Partial<IProgress>): Promise<IProgress> {
    const response = await ProgressApi.createProgress(progressData);
    return response.data;
  },

  async createMinimalProgress(
    studentId: string,
    courseId: string
  ): Promise<IProgress> {
    const response = await ProgressApi.createMinimalProgress(
      studentId,
      courseId
    );
    return response.data;
  },

  async updateProgress(
    id: string,
    progressData: Partial<IProgress>
  ): Promise<IProgress> {
    const response = await ProgressApi.updateProgress(id, progressData);
    return response.data;
  },

  async deleteProgress(id: string): Promise<void> {
    await ProgressApi.deleteProgress(id);
  },

  async getParentProgressSummary(
    parentId: string
  ): Promise<IChildProgressSummary[]> {
    const response = await ProgressApi.getParentProgressSummary(parentId);
    return response.data;
  },

  async getCourseProgress(courseId: string): Promise<IProgress[]> {
    const response = await ProgressApi.getCourseProgress(courseId);
    return response.data;
  },

  async getLessonProgress(lessonId: string): Promise<IProgress[]> {
    const response = await ProgressApi.getLessonProgress(lessonId);
    return response.data;
  },

  async markAsCompleted(
    studentId: string,
    courseId: string,
    lessonId: string,
    slideId?: string
  ): Promise<IProgress> {
    const response = await ProgressApi.markAsCompleted(
      studentId,
      courseId,
      lessonId,
      slideId
    );
    return response.data;
  },
};
