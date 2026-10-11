import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isMaintenanceModeEnabled,
  isIPAllowed,
  isUserAgentAllowed,
} from "@/lib/config/maintenance";
import {
  buildAuthRedirectUrl,
  buildCallbackUrl,
  buildSessionCookieHeader,
  normalizeSessionToken,
} from "@/lib/auth-callback";
import { authAppUrl } from "@/lib/app-urls";
import { isPrefetchRequest } from "@/lib/prefetch-request";
import { fetchAuthService } from "@/lib/server/same-host-fetch";
import { hashToken, isRscRequest } from "@/lib/session-cache";

const AUTH_APP_URL = authAppUrl();

const publicPaths = ["/sign-in", "/sign-up", "/maintenance"];
const publicPathPatterns = [
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/maintenance/,
];

const ACCT_OK_COOKIE = "acct_ok";
const ACCT_OK_MAX_AGE = 300; // 5 minutes
// When the account check times out or errors we let the user through and
// remember that for a short time, so a slow auth-service costs one timeout
// instead of one per navigation.
const ACCT_OK_DEGRADED_MAX_AGE = 60;

function buildAcctOkCookieHeader(
  value: string,
  options: { secure?: boolean; maxAge?: number }
): string {
  const maxAge = options.maxAge ?? ACCT_OK_MAX_AGE;
  const parts = [
    `${ACCT_OK_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSecure = request.url.startsWith("https");

  // After login/OAuth, auth redirects here with ?token=...; set session cookie and clean URL.
  const rawToken = request.nextUrl.searchParams.get("token");
  const handoffToken = normalizeSessionToken(rawToken);
  if (handoffToken) {
    const target = new URL(request.url);
    target.searchParams.delete("token");
    target.searchParams.delete("callbackUrl");
    target.searchParams.delete("origin");
    const res = NextResponse.redirect(target);
    // Avoid Next cookies.set percent-encoding ("=" → "%3D") which breaks token hashing.
    res.headers.append(
      "Set-Cookie",
      buildSessionCookieHeader(handoffToken, { secure: isSecure })
    );
    return res;
  }

  const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    publicPathPatterns.some((pattern) => pattern.test(pathname));

  const sessionToken = normalizeSessionToken(
    request.cookies.get("session")?.value ||
      request.cookies.get("__Secure-session")?.value ||
      request.cookies.get("__Host-session")?.value
  );

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
    const callbackUrl = buildCallbackUrl(request, AUTH_APP_URL);
    return NextResponse.redirect(
      buildAuthRedirectUrl(AUTH_APP_URL, callbackUrl, "client")
    );
  }

  if (
    sessionToken &&
    isPublicPath &&
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Next strips `next-router-prefetch` before proxy runs, so App Router
  // prefetches are stopped with prefetch={false} on sidebar links. Browser
  // prefetches that still send purpose / sec-purpose skip the session check.
  // Cookie absence still redirects above.
  if (
    sessionToken &&
    !isPublicPath &&
    !isPrefetchRequest((name) => request.headers.get(name))
  ) {
    const headerGet = (name: string) => request.headers.get(name);
    const acctOk = request.cookies.get(ACCT_OK_COOKIE)?.value;
    const tokenHash = await hashToken(sessionToken);

    // Skip the auth-service account check for in-app RSC navigations (the
    // full document load already verified the account) and when we have a
    // fresh, token-bound `acct_ok` cookie.
    const skipCheck =
      isRscRequest(headerGet, request.nextUrl.searchParams) ||
      (acctOk != null && acctOk === tokenHash);

    // Only a real check refreshes the cookie, so it can't slide forever and
    // the account is re-verified at least every ACCT_OK_MAX_AGE seconds.
    // null = no cookie to set; otherwise the Max-Age for the new acct_ok.
    let acctOkMaxAge: number | null = null;

    if (!skipCheck) {
      try {
        const res = await fetchAuthService("/api/v1/account/complete", {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            Cookie: `session=${sessionToken}`,
          },
        });
        if (res.status === 401) {
          const callbackUrl = buildCallbackUrl(request, AUTH_APP_URL);
          const redirectRes = NextResponse.redirect(
            buildAuthRedirectUrl(AUTH_APP_URL, callbackUrl, "client")
          );
          redirectRes.headers.append(
            "Set-Cookie",
            "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
          );
          redirectRes.headers.append(
            "Set-Cookie",
            buildAcctOkCookieHeader("", { secure: isSecure, maxAge: 0 })
          );
          return redirectRes;
        }
        if (res.status === 200) {
          const data = (await res.json()) as {
            complete?: boolean;
            readiness_unknown?: boolean;
          };
          // readiness_unknown: auth-service could not read student readiness
          // and reports complete:true; treat it as OK but re-check sooner.
          if (data.complete === false && data.readiness_unknown !== true) {
            const callbackUrl = buildCallbackUrl(request, AUTH_APP_URL);
            const onboardingUrl = `${AUTH_APP_URL.replace(/\/$/, "")}/onboarding?${new URLSearchParams({ callbackUrl, origin: "client" }).toString()}`;
            const onboardingRes = NextResponse.redirect(onboardingUrl);
            onboardingRes.headers.append(
              "Set-Cookie",
              buildAcctOkCookieHeader("", { secure: isSecure, maxAge: 0 })
            );
            return onboardingRes;
          }
          acctOkMaxAge =
            data.readiness_unknown === true
              ? ACCT_OK_DEGRADED_MAX_AGE
              : ACCT_OK_MAX_AGE;
        } else {
          // 5xx or other unexpected status: allow through, re-check soon.
          acctOkMaxAge = ACCT_OK_DEGRADED_MAX_AGE;
        }
      } catch {
        // Timeout or unreachable auth-service: allow through to avoid locking
        // users out, and cache that briefly so the next clicks don't each
        // wait for the timeout again.
        acctOkMaxAge = ACCT_OK_DEGRADED_MAX_AGE;
      }
    }

    // After a successful account check, set the short-lived
    // `acct_ok` cookie so the next request can skip the round-trip.
    if (acctOkMaxAge !== null) {
      const res = NextResponse.next();
      res.headers.append(
        "Set-Cookie",
        buildAcctOkCookieHeader(tokenHash, {
          secure: isSecure,
          maxAge: acctOkMaxAge,
        })
      );
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
