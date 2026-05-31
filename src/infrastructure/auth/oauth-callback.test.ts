import { describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const getUser = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, getUser },
    from,
  })),
}));

function nextRequest(url: string, cookies: Array<{ name: string; value: string }> = []) {
  return {
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => cookies,
    },
    nextUrl: new URL(url),
  };
}

describe("handleOAuthCallback", () => {
  it("sends recovery callbacks to the reset password screen when no next path is provided", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
        },
      },
    });
    single.mockResolvedValueOnce({ data: { role: "user" } });
    const { handleOAuthCallback } = await import("./oauth-callback");

    const response = await handleOAuthCallback(nextRequest("https://eco.test/auth/callback?code=abc&type=recovery") as never);

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("https://eco.test/reset-password");
  });

  it("uses the Supabase recovery PKCE cookie when the callback URL has no type marker", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
        },
      },
    });
    single.mockResolvedValueOnce({ data: { role: "user" } });
    const recoveryCookie = `base64-${Buffer.from('"pkce-verifier/recovery"').toString("base64")}`;
    const { handleOAuthCallback } = await import("./oauth-callback");

    const response = await handleOAuthCallback(
      nextRequest("https://eco.test/auth/callback?code=abc", [
        {
          name: "sb-project-auth-token-code-verifier",
          value: recoveryCookie,
        },
      ]) as never,
    );

    expect(response.headers.get("location")).toBe("https://eco.test/reset-password");
  });
});
