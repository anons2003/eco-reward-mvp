import { beforeEach, describe, expect, it, vi } from "vitest";

const signUp = vi.fn();
const signOut = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signUp, signOut },
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/register", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    signUp.mockReset();
    signOut.mockReset();
  });

  it("creates a Supabase user with profile metadata and redirects to the email verification screen", async () => {
    signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        name: "Nguyen Van Xanh",
        email: "USER@Example.com ",
        password: "securepass",
        next: "/scan",
      }),
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "securepass",
      options: {
        data: { full_name: "Nguyen Van Xanh" },
        emailRedirectTo: "https://eco.test/auth/callback?next=%2Fscan",
      },
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://eco.test/verify-email?email=user%40example.com&next=%2Fscan&sent=1");
  });

  it("signs out an immediate signup session so email verification is still required", async () => {
    signUp.mockResolvedValueOnce({ data: { session: { access_token: "token" } }, error: null });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        name: "Nguyen Van Xanh",
        email: "user@example.com",
        password: "securepass",
      }),
    );

    expect(signOut).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toBe("https://eco.test/verify-email?email=user%40example.com&next=%2Fdashboard&sent=1");
  });

  it("rejects short passwords before calling Supabase", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        name: "Nguyen Van Xanh",
        email: "user@example.com",
        password: "short",
      }),
    );

    expect(signUp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://eco.test/register?error=weak_password&next=%2Fdashboard");
  });
});
