/**
 * Auth client for beblocky-auth-service. Session is validated via cookie (same domain) or API.
 * Sign-in/sign-up happen on the auth app (redirect). This client provides session state and logout.
 */

const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://auth-service.beblocky.com"
    : "http://localhost:8080");
const AUTH_BASE = `${AUTH_SERVICE_URL.replace(/\/$/, "")}/api/v1`;

export type SessionUser = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  /** Roles from auth-service /account (e.g. ["student"], ["parent"]) */
  roles?: string[];
};

export type SessionData = {
  valid: boolean;
  user?: SessionUser;
  /** Session token for Authorization: Bearer when calling beblocky-api */
  token?: string;
};

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<{ data?: T; error?: { code: string; message: string }; status: number }> {
  const url = `${AUTH_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const text = await res.text();
  let data: T | undefined;
  let error: { code: string; message: string } | undefined;
  try {
    const json = text ? JSON.parse(text) : {};
    if (res.ok) data = json as T;
    else error = { code: json.error?.code ?? "ERROR", message: json.error?.message ?? res.statusText };
  } catch {
    if (!res.ok) error = { code: "ERROR", message: res.statusText || "Request failed" };
  }
  return { data, error, status: res.status };
}

let cachedSession: {
  data?: SessionData;
  error?: { code: string; message: string };
} | null = null;
let cachedSessionAt = 0;
let sessionInflight: Promise<{
  data?: SessionData;
  error?: { code: string; message: string };
}> | null = null;
const SESSION_TTL_MS = 5 * 60 * 1000;

export function clearSessionCache() {
  cachedSession = null;
  cachedSessionAt = 0;
  sessionInflight = null;
}

export async function getSession(): Promise<{
  data?: SessionData;
  error?: { code: string; message: string };
}> {
  if (cachedSession && Date.now() - cachedSessionAt < SESSION_TTL_MS) {
    return cachedSession;
  }
  if (sessionInflight) return sessionInflight;

  sessionInflight = (async () => {
    const { data: sessionData, error, status } = await authFetch<{
      valid?: boolean;
      user?: { id: string };
      token?: string;
      session?: unknown;
    }>("/auth/session");
    if (status === 200 && sessionData?.valid && sessionData?.user?.id) {
      const user: SessionUser = { id: sessionData.user.id };
      const accountRes = await authFetch<{
        name?: string;
        email?: string;
        image_url?: string;
        roles?: string[];
      }>("/account");
      if (accountRes.data) {
        user.name = accountRes.data.name;
        user.email = accountRes.data.email;
        user.image = accountRes.data.image_url;
        user.roles = accountRes.data.roles ?? [];
      }
      const result = {
        data: { valid: true, user, token: sessionData.token } as SessionData,
      };
      cachedSession = result;
      cachedSessionAt = Date.now();
      return result;
    }
    return { data: { valid: false } as SessionData, error };
  })().finally(() => {
    sessionInflight = null;
  });

  return sessionInflight;
}

/**
 * Headers for calling beblocky-api endpoints protected by BearerAuthGuard.
 * Session cookies are host-only, so cross-origin API calls need Bearer.
 */
export async function getApiAuthHeaders(): Promise<Record<string, string>> {
  const { data: session } = await getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  return headers;
}

export async function signOut(): Promise<void> {
  clearSessionCache();
  await authFetch("/auth/logout", { method: "POST" });
}

export type UpdateAccountInput = {
  name?: string;
  image_url?: string;
  bio?: string;
};

export async function updateAccount(input: UpdateAccountInput): Promise<{ data?: null; error?: { code: string; message: string } }> {
  const { data, error, status } = await authFetch<unknown>("/account", {
    method: "PATCH",
    body: JSON.stringify({
      ...(input.name != null && { name: input.name }),
      ...(input.image_url != null && { image_url: input.image_url }),
      ...(input.bio != null && { bio: input.bio }),
    }),
  });
  if (status === 204 || data !== undefined) {
    clearSessionCache();
    return { data: null };
  }
  return { error: error ?? { code: "ERROR", message: "Update failed" } };
}

export async function assignRole(role: string): Promise<{ data?: null; error?: { code: string; message: string } }> {
  const { error, status } = await authFetch<unknown>("/account/role", {
    method: "POST",
    body: JSON.stringify({ role: role.trim().toLowerCase() }),
  });
  if (status === 204) {
    clearSessionCache();
    return { data: null };
  }
  return { error: error ?? { code: "ERROR", message: "Assign role failed" } };
}

export { useSession } from "./use-session";
