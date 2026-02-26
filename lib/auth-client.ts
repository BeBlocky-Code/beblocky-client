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

export async function getSession(): Promise<{ data?: SessionData; error?: { code: string; message: string } }> {
  const { data: sessionData, error, status } = await authFetch<{ valid?: boolean; user?: { id: string }; token?: string; session?: unknown }>("/auth/session");
  if (status === 200 && sessionData?.valid && sessionData?.user?.id) {
    const user: SessionUser = { id: sessionData.user.id };
    const accountRes = await authFetch<{ name?: string; email?: string; image_url?: string; roles?: string[] }>("/account");
    if (accountRes.data) {
      user.name = accountRes.data.name;
      user.email = accountRes.data.email;
      user.image = accountRes.data.image_url;
      user.roles = accountRes.data.roles ?? [];
    }
    return { data: { valid: true, user, token: sessionData.token } };
  }
  return { data: { valid: false }, error };
}

export async function signOut(): Promise<void> {
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
  if (status === 204 || data !== undefined) return { data: null };
  return { error: error ?? { code: "ERROR", message: "Update failed" } };
}

export async function assignRole(role: string): Promise<{ data?: null; error?: { code: string; message: string } }> {
  const { error, status } = await authFetch<unknown>("/account/role", {
    method: "POST",
    body: JSON.stringify({ role: role.trim().toLowerCase() }),
  });
  if (status === 204) return { data: null };
  return { error: error ?? { code: "ERROR", message: "Assign role failed" } };
}

export { useSession } from "./use-session";

export function forgetPassword(_: { email: string; redirectTo?: string }): Promise<{ data: unknown; error: unknown }> {
  return Promise.resolve({ data: null, error: { message: "Use the auth app to reset your password." } });
}

export const forgotPassword = forgetPassword;

export function resetPassword(_: { token: string; newPassword: string }): Promise<{ data: unknown; error: unknown }> {
  return Promise.resolve({ data: null, error: { message: "Use the auth app to reset your password." } });
}
