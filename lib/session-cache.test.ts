import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashToken, isRscRequest } from "./session-cache.ts";

function headers(values: Record<string, string>) {
  return (name: string) => values[name] ?? null;
}

describe("hashToken", () => {
  it("returns a stable 16-character hex hash", async () => {
    const hash = await hashToken("session-token-123");
    assert.equal(hash.length, 16);
    assert.match(hash, /^[0-9a-f]+$/);
    assert.equal(await hashToken("session-token-123"), hash);
  });

  it("returns different hashes for different tokens", async () => {
    const a = await hashToken("token-a");
    const b = await hashToken("token-b");
    assert.notEqual(a, b);
  });
});

describe("isRscRequest", () => {
  it("detects App Router RSC navigation headers", () => {
    assert.equal(isRscRequest(headers({ rsc: "1" })), true);
    assert.equal(
      isRscRequest(headers({ "next-router-state-tree": "[\"root\"]" })),
      true,
    );
  });

  it("detects prefetch headers and the _rsc query", () => {
    assert.equal(isRscRequest(headers({ "next-router-prefetch": "1" })), true);
    assert.equal(
      isRscRequest(headers({}), new URLSearchParams("_rsc=abc")),
      true,
    );
  });

  it("detects RSC fetches after Next strips its flight headers in proxy", () => {
    assert.equal(isRscRequest(headers({ "next-url": "/courses" })), true);
    assert.equal(
      isRscRequest(
        headers({ "sec-fetch-mode": "cors", "sec-fetch-dest": "empty" }),
      ),
      true,
    );
  });

  it("does not detect normal document or API requests", () => {
    assert.equal(isRscRequest(headers({})), false);
    assert.equal(isRscRequest(headers({ accept: "text/html" })), false);
    assert.equal(
      isRscRequest(
        headers({ "sec-fetch-mode": "navigate", "sec-fetch-dest": "document" }),
      ),
      false,
    );
    assert.equal(isRscRequest(headers({}), new URLSearchParams("a=1")), false);
  });
});
