import { describe, expect, it } from "vitest";
import { sanitizeSupabaseAuthCookies } from "./auth-cookies";

const storageKey = "sb-lhoaxabweqpuyqqcubiz-auth-token";

function encodeAuthCookie(value: unknown) {
  return `base64-${Buffer.from(JSON.stringify(value), "utf8").toString("base64url")}`;
}

describe("sanitizeSupabaseAuthCookies", () => {
  it("removes malformed Supabase auth cookies before SSR auth reads them", () => {
    const result = sanitizeSupabaseAuthCookies([
      { name: storageKey, value: '{"bad":true}garbage' },
      { name: "theme", value: "dark" },
    ]);

    expect(result.cookies).toEqual([{ name: "theme", value: "dark" }]);
    expect([...result.staleCookieNames]).toEqual([storageKey]);
  });

  it("keeps valid base64url Supabase auth cookies", () => {
    const cookie = { name: storageKey, value: encodeAuthCookie({ access_token: "token" }) };

    const result = sanitizeSupabaseAuthCookies([cookie]);

    expect(result.cookies).toEqual([cookie]);
    expect(result.staleCookieNames.size).toBe(0);
  });

  it("removes all chunks for a malformed chunked auth cookie", () => {
    const result = sanitizeSupabaseAuthCookies([
      { name: `${storageKey}.0`, value: "base64-eyJhY2Nlc3NfdG9rZW4iOiJ0b2tlbiJ9" },
      { name: `${storageKey}.1`, value: "garbage" },
    ]);

    expect(result.cookies).toEqual([]);
    expect([...result.staleCookieNames]).toEqual([`${storageKey}.0`, `${storageKey}.1`]);
  });
});
