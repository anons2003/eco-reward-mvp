import { describe, expect, it, vi } from "vitest";

function request(url: string, headers: Record<string, string> = {}) {
  return new Request(url, { headers });
}

describe("appOrigin", () => {
  it("uses the incoming production host before stale deployment env URLs", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://eco-cycle-mvp.vercel.app");
    vi.stubEnv("APP_URL", "https://eco-cycle-mvp.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "eco-cycle-mvp.vercel.app");

    const { appOrigin } = await import("./redirects");

    expect(
      appOrigin(
        request("https://eco-reward-mvp.vercel.app/api/auth/google", {
          "x-forwarded-host": "eco-reward-mvp.vercel.app",
          "x-forwarded-proto": "https",
        }),
      ),
    ).toBe("https://eco-reward-mvp.vercel.app");
  });
});
