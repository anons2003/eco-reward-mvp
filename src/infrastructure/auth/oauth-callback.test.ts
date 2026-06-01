import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const getUser = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const adminSingle = vi.fn();
const adminEq = vi.fn(() => ({ single: adminSingle }));
const adminSelect = vi.fn(() => ({ eq: adminEq }));
const adminInsert = vi.fn();
const adminFrom = vi.fn(() => ({ select: adminSelect, insert: adminInsert }));
const createAdminClient = vi.fn(() => ({ from: adminFrom }));

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, getUser },
    from,
  })),
}));

vi.mock("@/infrastructure/supabase/admin", () => ({
  createAdminClient,
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
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    getUser.mockReset();
    single.mockReset();
    eq.mockClear();
    select.mockClear();
    from.mockClear();
    adminSingle.mockReset();
    adminEq.mockClear();
    adminSelect.mockClear();
    adminInsert.mockReset();
    adminFrom.mockClear();
    createAdminClient.mockClear();
  });

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

  it("creates a missing local profile for first-time OAuth users before redirecting", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "oauth-user-1",
          email: "new-google@example.com",
          user_metadata: {
            full_name: "New Google User",
            avatar_url: "https://example.com/avatar.png",
          },
        },
      },
    });
    single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116", message: "not found" } });
    adminSingle.mockResolvedValueOnce({ data: null, error: null });
    adminInsert.mockResolvedValueOnce({ error: null });
    const { handleOAuthCallback } = await import("./oauth-callback");

    const response = await handleOAuthCallback(nextRequest("https://eco.test/auth/callback?code=abc") as never);

    expect(adminInsert).toHaveBeenCalledWith({
      id: "oauth-user-1",
      email: "new-google@example.com",
      full_name: "New Google User",
      avatar_url: "https://example.com/avatar.png",
      role: "user",
      status: "active",
    });
    expect(response.headers.get("location")).toBe("https://eco.test/dashboard");
  });
});
