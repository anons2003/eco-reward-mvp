import { beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { resend },
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/resend-verification", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/resend-verification", () => {
  beforeEach(() => {
    resend.mockReset();
  });

  it("resends the signup confirmation email with the auth callback redirect", async () => {
    resend.mockResolvedValueOnce({ error: null });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        email: "USER@Example.com ",
        next: "/scan",
      }),
    );

    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: "user@example.com",
      options: {
        emailRedirectTo: "https://eco.test/auth/callback?next=%2Fscan",
      },
    });
    expect(response.headers.get("location")).toBe("https://eco.test/verify-email?email=user%40example.com&next=%2Fscan&sent=1");
  });

  it("redirects back to the verification screen when email is missing", async () => {
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ next: "/scan" }));

    expect(resend).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://eco.test/verify-email?next=%2Fscan&error=missing_email");
  });
});
