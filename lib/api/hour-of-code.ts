const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface HourOfCodeCourse {
  _id: string;
  courseTitle?: string;
  courseDescription?: string;
  courseLanguage?: string;
  subType?: string;
  status?: string;
  language?: string;
}

export interface HourOfCodeResponse {
  _id: string;
  name: string;
  courseIds: HourOfCodeCourse[] | string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchHourOfCode(): Promise<HourOfCodeResponse | null> {
  if (!API_BASE_URL) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/hour-of-code`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.status === 404 || res.status === 204) return null;
    if (!res.ok) return null;

    const data = await res.json();
    return data as HourOfCodeResponse;
  } catch {
    return null;
  }
}
