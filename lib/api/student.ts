export interface CreateStudentFromUserDto {
  userId: string;
}

export interface IStudentResponse {
  _id: string;
  userId: string;
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

const defaultHeaders = { "Content-Type": "application/json" };

class StudentApi {
  async createStudentFromUser(userId: string): Promise<IStudentResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/students/from-user`;

    const response = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  async getStudent(studentId: string): Promise<IStudentResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`;

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

  async getStudentByUserId(userId: string): Promise<IStudentResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/students/user/${userId}`;

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

  async updateStudent(
    studentId: string,
    studentData: Partial<IStudentResponse>
  ): Promise<IStudentResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  async deleteStudent(studentId: string): Promise<void> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Student API] deleteStudent failed:", errorText);
      throw new Error(
        `API Error: ${response.status} - ${response.statusText} - ${errorText}`
      );
    }

    console.log("✅ [Student API] deleteStudent success");
  }
}

export const studentApi = new StudentApi();
