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

export function isRscRequest(
  headerGet: (name: string) => string | null,
): boolean {
  return (
    headerGet("rsc") === "1" || headerGet("next-router-state-tree") != null
  );
}
