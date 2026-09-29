import type {
  ICourse,
  ICreateCourseDto,
  IUpdateCourseDto,
  ICreateCourseWithContentDto,
  ICourseRatingResponse,
  ICourseRatingStats,
} from "@/types/course";
import { getApiAuthHeaders } from "@/lib/auth-client";

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface CourseContent {
  slides?: unknown[];
  lessons?: unknown[];
  resources?: unknown[];
  metadata?: Record<string, unknown>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = RequestInit & { skipAuth?: boolean };

async function simpleFetch<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { skipAuth, ...fetchOptions } = options ?? {};
  const authHeaders = skipAuth
    ? { "Content-Type": "application/json" }
    : await getApiAuthHeaders();

  const response = await fetch(url, {
    credentials: "include",
    ...fetchOptions,
    headers: {
      ...authHeaders,
      ...((fetchOptions.headers as Record<string, string>) ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} - ${response.statusText} - ${errorText}`,
    );
  }

  return response.json();
}

// Course API functions
export class CourseApi {
  private static async request<T>(
    endpoint: string,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    try {
      const data = await simpleFetch<ApiResponse<T>>(endpoint, options);

      // If the response is already an array, wrap it in the expected format
      if (Array.isArray(data)) {
        console.log(
          "✅ [Course API] Wrapping array response in expected format"
        );
        return {
          data: data as T,
          success: true,
          message: "Courses fetched successfully",
        } as ApiResponse<T>;
      }

      return data;
    } catch (error) {
      console.error("❌ [Course API] Request failed:", error);
      throw error;
    }
  }

  // GET /courses - Get all courses
  static async getAllCourses(): Promise<ApiResponse<ICourse[]>> {
    console.log("📚 [Course API] getAllCourses called");
    return this.request<ICourse[]>("/courses", {
      method: "GET",
      skipAuth: true,
    });
  }

  static async getCatalog(): Promise<ICourse[]> {
    const data = await simpleFetch<ICourse[] | ApiResponse<ICourse[]>>(
      "/courses/catalog",
      { method: "GET" }
    );
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "data" in data) {
      return (data as ApiResponse<ICourse[]>).data;
    }
    return [];
  }

  // GET /courses/:id - Get single course
  static async getCourseById(id: string): Promise<ICourse> {
    // For historical reasons, the courses API may return either:
    // 1) A bare course object, or
    // 2) { data: course, success, message }
    const data = await simpleFetch<ICourse | ApiResponse<ICourse>>(
      `/courses/${id}`,
      {
        method: "GET",
        // Course detail usually requires session; include cookies
        credentials: "include",
      }
    );

    if (data && typeof data === "object" && "data" in data) {
      return (data as ApiResponse<ICourse>).data;
    }

    return data as ICourse;
  }

  // POST /courses - Create new course
  static async createCourse(
    courseData: ICreateCourseDto
  ): Promise<ApiResponse<ICourse>> {
    return this.request<ICourse>("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  }

  // POST /courses/with-content - Create course with content
  static async createCourseWithContent(
    courseData: ICreateCourseWithContentDto
  ): Promise<ApiResponse<ICourse>> {
    return this.request<ICourse>("/courses/with-content", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  }

  // PUT /courses/:id - Update course
  static async updateCourse(
    id: string,
    courseData: IUpdateCourseDto
  ): Promise<ApiResponse<ICourse>> {
    return this.request<ICourse>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    });
  }

  // DELETE /courses/:id - Delete course
  static async deleteCourse(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/courses/${id}`, {
      method: "DELETE",
    });
  }

  // Rating Methods
  // POST /courses/:courseId/ratings - Rate a course
  static async rateCourse(
    courseId: string,
    userId: string,
    ratingData: { rating: number; review?: string }
  ): Promise<ApiResponse<ICourseRatingResponse>> {
    return this.request<ICourseRatingResponse>(
      `/courses/${courseId}/ratings?userId=${userId}`,
      {
        method: "POST",
        body: JSON.stringify(ratingData),
      }
    );
  }

  // GET /courses/:courseId/ratings/stats - Get rating statistics
  static async getRatingStats(
    courseId: string,
    userId?: string
  ): Promise<ApiResponse<ICourseRatingStats>> {
    const url = userId
      ? `/courses/${courseId}/ratings/stats?userId=${userId}`
      : `/courses/${courseId}/ratings/stats`;
    return this.request<ICourseRatingStats>(url, {
      method: "GET",
    });
  }

  // GET /courses/:courseId/ratings - Get all ratings for a course
  static async getCourseRatings(
    courseId: string
  ): Promise<ApiResponse<ICourseRatingResponse[]>> {
    return this.request<ICourseRatingResponse[]>(
      `/courses/${courseId}/ratings`,
      {
        method: "GET",
      }
    );
  }

  // PUT /courses/:courseId/ratings - Update a rating
  static async updateRating(
    courseId: string,
    userId: string,
    ratingData: { rating: number; review?: string }
  ): Promise<ApiResponse<ICourseRatingResponse>> {
    return this.request<ICourseRatingResponse>(
      `/courses/${courseId}/ratings?userId=${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(ratingData),
      }
    );
  }

  // DELETE /courses/:courseId/ratings - Delete a rating
  static async deleteRating(
    courseId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/courses/${courseId}/ratings?userId=${userId}`, {
      method: "DELETE",
    });
  }
}

// Instance methods for backward compatibility
export const courseApi = {
  async fetchAllCourses(): Promise<ICourse[]> {
    const url = `${API_BASE_URL}/courses`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${response.statusText}`,
      );
    }
    const data: unknown = await response.json();
    if (Array.isArray(data)) return data as ICourse[];
    if (data && typeof data === "object" && "data" in data) {
      return (data as ApiResponse<ICourse[]>).data;
    }
    return [];
  },

  async fetchCatalog(): Promise<ICourse[]> {
    return CourseApi.getCatalog();
  },

  async fetchCourseById(id: string): Promise<ICourse> {
    const course = await CourseApi.getCourseById(id);
    return course;
  },

  async createCourse(courseData: ICreateCourseDto): Promise<ICourse> {
    const response = await CourseApi.createCourse(courseData);
    return response.data;
  },

  async updateCourse(
    id: string,
    courseData: IUpdateCourseDto
  ): Promise<ICourse> {
    const response = await CourseApi.updateCourse(id, courseData);
    return response.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await CourseApi.deleteCourse(id);
  },

  async rateCourse(
    courseId: string,
    userId: string,
    ratingData: { rating: number; review?: string }
  ): Promise<ICourseRatingResponse> {
    const response = await CourseApi.rateCourse(courseId, userId, ratingData);
    return response.data;
  },

  async getRatingStats(
    courseId: string,
    userId?: string
  ): Promise<ICourseRatingStats> {
    const response = await CourseApi.getRatingStats(courseId, userId);
    return response.data;
  },

  async getCourseRatings(courseId: string): Promise<ICourseRatingResponse[]> {
    const response = await CourseApi.getCourseRatings(courseId);
    return response.data;
  },

  async updateRating(
    courseId: string,
    userId: string,
    ratingData: { rating: number; review?: string }
  ): Promise<ICourseRatingResponse> {
    const response = await CourseApi.updateRating(courseId, userId, ratingData);
    return response.data;
  },

  async deleteRating(courseId: string, userId: string): Promise<void> {
    await CourseApi.deleteRating(courseId, userId);
  },
};
