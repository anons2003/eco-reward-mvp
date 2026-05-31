import { beforeEach, describe, expect, it, vi } from "vitest";

const resetPasswordForEmail = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { resetPasswordForEmail },
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/forgot-password", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset();
  });

  it("sends a Supabase password reset email to the reset password flow", async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: null });
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ email: "USER@Example.com " }));

    expect(resetPasswordForEmail).toHaveBeenCalledWith("user@example.com");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://eco.test/forgot-password?sent=1");
  });

  it("returns a visible error when Supabase rejects the reset email request", async () => {
    resetPasswordForEmail.mockResolvedValueOnce({ error: new Error("redirect URL is not allowed") });
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ email: "USER@Example.com " }));

    expect(response.headers.get("location")).toBe("https://eco.test/forgot-password?error=reset_failed");
  });
});
