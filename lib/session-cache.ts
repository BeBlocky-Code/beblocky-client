/**
 * Small helpers used by the proxy to avoid calling auth-service on every
 * request. The cache value is a short SHA-256 hash of the session token, stored
 * in an httpOnly cookie named `acct_ok`.
 */

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(token),
  );
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex.slice(0, 16);
}

/**
 * True when the request is an App Router in-app navigation (an RSC fetch),
 * not a full document load.
 *
 * Next.js (16.x, `server/web/adapter.js`) deletes its flight headers (`RSC`,
 * `Next-Router-State-Tree`, `Next-Router-Prefetch`,
 * `Next-Router-Segment-Prefetch`) and the `_rsc` query param before
 * proxy/middleware sees the request. So checking only those never fires in
 * proxy.ts. We still check them (they are present in other contexts and if
 * Next changes this), and add signals that survive:
 * - `Next-Url`, which the router sends on RSC fetches and Next does not strip;
 * - Fetch Metadata: the router uses fetch(), so the browser sends
 *   `Sec-Fetch-Mode` other than `navigate` and `Sec-Fetch-Dest: empty`.
 *   A document load always sends `Sec-Fetch-Mode: navigate`.
 *
 * Pass `searchParams` to also detect `_rsc` where it has not been stripped.
 */
export function isRscRequest(
  headerGet: (name: string) => string | null,
  searchParams?: { has(name: string): boolean },
): boolean {
  if (headerGet("rsc") === "1") return true;
  if (headerGet("next-router-state-tree")) return true;
  if (headerGet("next-router-prefetch")) return true;
  if (headerGet("next-router-segment-prefetch")) return true;
  if (searchParams?.has("_rsc")) return true;
  if (headerGet("next-url")) return true;
  const mode = headerGet("sec-fetch-mode")?.toLowerCase();
  const dest = headerGet("sec-fetch-dest")?.toLowerCase();
  if (mode && mode !== "navigate" && dest === "empty") return true;
  return false;
}
