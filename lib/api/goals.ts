import { getApiAuthHeaders } from "@/lib/auth-client";

export type GoalRecord = {
  id: string;
  learnerId: string;
  kind: "lessons-in-window" | "named-course";
  lessonCount?: number;
  windowStart?: string;
  windowEnd?: string;
  lessonsDone?: number;
  courseId?: string;
  accomplishedAt?: string;
};

export type GoalList = {
  open: GoalRecord[];
  accomplished: GoalRecord[];
};

export type GoalSpec =
  | { kind: "lessons-in-window"; lessonCount: number; windowDays: number }
  | { kind: "named-course"; courseId: string };

/** Coins awarded when a Goal is accomplished — matches the API writer. */
export const GOAL_ACCOMPLISH_COINS = 25;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function goalsFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getApiAuthHeaders();
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...authHeaders,
      ...((options?.headers as Record<string, string>) ?? {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export const goalApi = {
  list(): Promise<GoalList> {
    return goalsFetch<GoalList>("/goals");
  },
  set(spec: GoalSpec): Promise<GoalList> {
    return goalsFetch<GoalList>("/goals", {
      method: "POST",
      body: JSON.stringify(spec),
    });
  },
};
