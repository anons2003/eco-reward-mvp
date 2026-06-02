import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const createServerClient = vi.fn((_url: string, _key: string, options?: { cookies?: { getAll?: (keyHints?: string[]) => unknown } }) => {
  options?.cookies?.getAll?.(["sb-supabase-auth-token"]);
  return {
  auth: { getUser },
  from,
  };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient,
}));

function nextRequest(url: string, initialCookies: Array<{ name: string; value: string }> = []) {
  const nextUrl = new URL(url);
  const cookieJar = [...initialCookies];

  return {
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => cookieJar,
      set: (name: string, value: string) => {
        const index = cookieJar.findIndex((cookie) => cookie.name === name);
        if (index >= 0) {
          cookieJar[index] = { name, value };
        } else {
          cookieJar.push({ name, value });
        }
      },
      delete: (name: string) => {
        const index = cookieJar.findIndex((cookie) => cookie.name === name);
        if (index >= 0) {
          cookieJar.splice(index, 1);
        }
      },
    },
    nextUrl: {
      ...nextUrl,
      clone: () => new URL(url),
      searchParams: nextUrl.searchParams,
      pathname: nextUrl.pathname,
    },
  };
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    getUser.mockReset();
    single.mockReset();
    eq.mockClear();
    select.mockClear();
    from.mockClear();
    createServerClient.mockClear();
  });

  it("treats legacy root PKCE callbacks without a type as password recovery", async () => {
    const { updateSession } = await import("./proxy");

    const response = await updateSession(nextRequest("https://eco.test/?code=abc") as never);

    expect(response.headers.get("location")).toBe("https://eco.test/auth/callback?code=abc&type=recovery");
  });

  it("redirects signed-out users away from protected profile and settings routes", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import("./proxy");

    const profileResponse = await updateSession(nextRequest("https://eco.test/profile") as never);
    const settingsResponse = await updateSession(nextRequest("https://eco.test/settings") as never);

    expect(profileResponse.headers.get("location")).toBe("https://eco.test/login?next=%2Fprofile");
    expect(settingsResponse.headers.get("location")).toBe("https://eco.test/login?next=%2Fsettings");
  });

  it("treats malformed auth cookies as signed out instead of throwing", async () => {
    getUser.mockRejectedValue(new SyntaxError("Unexpected non-whitespace character after JSON"));
    const { updateSession } = await import("./proxy");

    const response = await updateSession(nextRequest("https://eco.test/wallet") as never);

    expect(response.headers.get("location")).toBe("https://eco.test/login?next=%2Fwallet");
  });

  it("deletes malformed auth cookies on protected-route redirects", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import("./proxy");

    const response = await updateSession(
      nextRequest("https://eco.test/dashboard", [{ name: "sb-supabase-auth-token", value: '{"bad":true}garbage' }]) as never,
    );

    expect(response.headers.get("location")).toBe("https://eco.test/login?next=%2Fdashboard");
    expect(response.headers.get("set-cookie")).toContain("sb-supabase-auth-token=");
    expect(response.headers.get("set-cookie")).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
});
