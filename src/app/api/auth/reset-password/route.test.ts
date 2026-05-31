import { beforeEach, describe, expect, it, vi } from "vitest";

const updateUser = vi.fn();
const signOut = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { updateUser, signOut },
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/reset-password", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    updateUser.mockReset();
    signOut.mockReset();
  });

  it("updates the authenticated user's password and signs out the recovery session", async () => {
    updateUser.mockResolvedValueOnce({ error: null });
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ password: "newsecurepass", confirmPassword: "newsecurepass" }));

    expect(updateUser).toHaveBeenCalledWith({ password: "newsecurepass" });
    expect(signOut).toHaveBeenCalledOnce();
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://eco.test/login?reset=success");
  });

  it("rejects mismatched confirmation before calling Supabase", async () => {
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ password: "newsecurepass", confirmPassword: "differentpass" }));

    expect(updateUser).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://eco.test/reset-password?error=password_mismatch");
  });
});
