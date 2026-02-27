import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isMaintenanceModeEnabled,
  isIPAllowed,
  isUserAgentAllowed,
} from "@/lib/config/maintenance";

const AUTH_APP_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://auth.beblocky.com"
    : "http://localhost:3000");
const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://auth-service.beblocky.com"
    : "http://localhost:8080");
/** Production app URL for callback after auth (e.g. https://code.beblocky.com). If set, used instead of request.url so redirect back goes to the correct host. */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const publicPaths = ["/sign-in", "/sign-up", "/maintenance"];
const publicPathPatterns = [
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/maintenance/,
];

function getCallbackUrl(request: NextRequest): string {
  if (APP_URL) {
    const base = APP_URL.replace(/\/$/, "");
    const path = request.nextUrl.pathname + request.nextUrl.search;
    return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base + "/";
  }
  return request.url;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // After OAuth, auth-service redirects here with ?token=...; set session cookie and redirect to clean URL.
  const token = request.nextUrl.searchParams.get("token");
  if (token) {
    const target = new URL(request.url);
    target.searchParams.delete("token");
    const res = NextResponse.redirect(target);
    const isSecure = request.url.startsWith("https");
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });
    return res;
  }

  const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    publicPathPatterns.some((pattern) => pattern.test(pathname));

  const sessionToken =
    request.cookies.get("session")?.value ||
    request.cookies.get("__Secure-session")?.value ||
    request.cookies.get("__Host-session")?.value;

  if (isMaintenanceModeEnabled()) {
    if (pathname === "/maintenance") {
      return NextResponse.next();
    }
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";
    const isAllowedIP = isIPAllowed(clientIP);
    const isAllowedUserAgent = isUserAgentAllowed(userAgent);
    if (!isAllowedIP && !isAllowedUserAgent) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  if (!sessionToken && !isPublicPath) {
    const callbackUrl = getCallbackUrl(request);
    const authUrl = `${AUTH_APP_URL.replace(/\/$/, "")}?callbackUrl=${encodeURIComponent(callbackUrl)}&origin=client`;
    return NextResponse.redirect(authUrl);
  }

  if (sessionToken && isPublicPath && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessionToken && !isPublicPath) {
    try {
      const base = AUTH_SERVICE_URL.replace(/\/$/, "");
      const cookieHeader = request.headers.get("cookie") ?? "";
      const res = await fetch(`${base}/api/v1/account/complete`, {
        headers: { Cookie: cookieHeader },
      });
      if (res.status === 401) {
        const callbackUrl = getCallbackUrl(request);
        const authUrl = `${AUTH_APP_URL.replace(/\/$/, "")}?callbackUrl=${encodeURIComponent(callbackUrl)}&origin=client`;
        return NextResponse.redirect(authUrl);
      }
      if (res.status === 200) {
        const data = (await res.json()) as { complete?: boolean };
        if (data.complete === false) {
          const callbackUrl = getCallbackUrl(request);
          const onboardingUrl = `${AUTH_APP_URL.replace(/\/$/, "")}/onboarding?callbackUrl=${encodeURIComponent(callbackUrl)}&origin=client`;
          return NextResponse.redirect(onboardingUrl);
        }
      }
    } catch {
      // Allow through if auth-service is unreachable to avoid locking users out
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
