import { getSession } from "@/lib/auth-client";

export interface CreateStudentFromUserDto {
  userId: string;
}

export interface IStudentResponse {
  _id: string;
  userId: string;
  /** Resolved from auth-service on enriched list endpoints */
  name?: string;
  email?: string;
  displayName?: string;
  dateOfBirth?: string;
  grade?: number;
  gender?: "male" | "female" | "other";
  schoolId?: string;
  parentId?: string;
  enrolledCourses: string[];
  coins: number;
  codingStreak: number;
  lastCodingActivity: string;
  totalCoinsEarned: number;
  totalTimeSpent: number;
  goals?: string[];
  subscription?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: session } = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  return headers;
}

async function studentFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  /** Skip Bearer for service-key-only routes (e.g. from-user). */
  withBearer = true
): Promise<T> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  const headers = withBearer
    ? await getAuthHeaders()
    : { "Content-Type": "application/json" };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...((options.headers as Record<string, string>) ?? {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} - ${response.statusText} - ${errorText}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

class StudentApi {
  /**
   * Service-to-service bootstrap only — requires BEBLOCKY_SERVICE_KEY on the
   * server. Do not call from the browser; auth-api owns this flow.
   */
  async createStudentFromUser(userId: string): Promise<IStudentResponse> {
    return studentFetch<IStudentResponse>(
      "/students/from-user",
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      },
      false
    );
  }

  async getStudent(studentId: string): Promise<IStudentResponse> {
    return studentFetch<IStudentResponse>(`/students/${studentId}`);
  }

  async getStudentByUserId(userId: string): Promise<IStudentResponse> {
    return studentFetch<IStudentResponse>(`/students/user/${userId}`);
  }

  async updateStudent(
    studentId: string,
    studentData: Partial<IStudentResponse>
  ): Promise<IStudentResponse> {
    return studentFetch<IStudentResponse>(`/students/${studentId}`, {
      method: "PATCH",
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(studentId: string): Promise<void> {
    await studentFetch<void>(`/students/${studentId}`, {
      method: "DELETE",
    });
  }
}

export const studentApi = new StudentApi();
