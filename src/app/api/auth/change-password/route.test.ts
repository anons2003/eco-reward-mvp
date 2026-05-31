import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const signInWithPassword = vi.fn();
const updateUser = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser, signInWithPassword, updateUser },
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/change-password", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    getUser.mockReset();
    signInWithPassword.mockReset();
    updateUser.mockReset();
  });

  it("verifies the current password before updating to the new password", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: "user@example.com" } } });
    signInWithPassword.mockResolvedValueOnce({ error: null });
    updateUser.mockResolvedValueOnce({ error: null });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        currentPassword: "oldsecurepass",
        password: "newsecurepass",
        confirmPassword: "newsecurepass",
      }),
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "oldsecurepass",
    });
    expect(updateUser).toHaveBeenCalledWith({ password: "newsecurepass" });
    expect(response.headers.get("location")).toBe("https://eco.test/settings?password=success");
  });

  it("rejects a wrong current password before updating", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: "user@example.com" } } });
    signInWithPassword.mockResolvedValueOnce({ error: new Error("invalid") });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        currentPassword: "wrongpass",
        password: "newsecurepass",
        confirmPassword: "newsecurepass",
      }),
    );

    expect(updateUser).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://eco.test/settings?password=current_invalid");
  });
});
