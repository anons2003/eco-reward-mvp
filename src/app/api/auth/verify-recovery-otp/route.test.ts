import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyOtp = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { verifyOtp },
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/verify-recovery-otp", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/verify-recovery-otp", () => {
  beforeEach(() => {
    verifyOtp.mockReset();
  });

  it("verifies the recovery OTP and redirects to the reset password screen", async () => {
    verifyOtp.mockResolvedValueOnce({ error: null });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        email: "USER@Example.com ",
        token: "123456",
      }),
    );

    expect(verifyOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      token: "123456",
      type: "recovery",
    });
    expect(response.headers.get("location")).toBe("https://eco.test/reset-password?verified=1");
  });

  it("returns to the OTP screen when the code is invalid", async () => {
    verifyOtp.mockResolvedValueOnce({ error: new Error("invalid otp") });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        email: "user@example.com",
        token: "000000",
      }),
    );

    expect(response.headers.get("location")).toBe("https://eco.test/verify-recovery?email=user%40example.com&error=invalid_code");
  });
});
