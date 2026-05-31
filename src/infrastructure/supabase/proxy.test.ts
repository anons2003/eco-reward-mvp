import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const createServerClient = vi.fn(() => ({
  auth: { getUser },
  from,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient,
}));

function nextRequest(url: string) {
  const nextUrl = new URL(url);
  return {
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => [],
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
});
