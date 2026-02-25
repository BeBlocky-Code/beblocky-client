import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isMaintenanceModeEnabled,
  isIPAllowed,
  isUserAgentAllowed,
} from "@/lib/config/maintenance";

const AUTH_APP_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_URL ?? "http://localhost:3000";
const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:8080";

const publicPaths = ["/sign-in", "/sign-up", "/reset-password", "/maintenance"];
const publicPathPatterns = [
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/reset-password/,
  /^\/maintenance/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    const authUrl = `${AUTH_APP_URL.replace(/\/$/, "")}?callbackUrl=${encodeURIComponent(request.url)}&origin=client`;
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
        const authUrl = `${AUTH_APP_URL.replace(/\/$/, "")}?callbackUrl=${encodeURIComponent(request.url)}&origin=client`;
        return NextResponse.redirect(authUrl);
      }
      if (res.status === 200) {
        const data = (await res.json()) as { complete?: boolean };
        if (data.complete === false) {
          const onboardingUrl = `${AUTH_APP_URL.replace(/\/$/, "")}/onboarding?callbackUrl=${encodeURIComponent(request.url)}&origin=client`;
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
