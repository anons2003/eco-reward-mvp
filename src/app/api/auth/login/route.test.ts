import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();
const getUser = vi.fn();
const signOut = vi.fn();
const single = vi.fn();
const eq = vi.fn(() => ({ single }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithPassword, getUser, signOut },
    from,
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return new Request("https://eco.test/api/auth/login", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    getUser.mockReset();
    signOut.mockReset();
    single.mockReset();
    eq.mockClear();
    select.mockClear();
    from.mockClear();
  });

  it("rejects an authenticated user when email has not been verified", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: null });
    getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
          email_confirmed_at: null,
        },
      },
    });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        email: "user@example.com",
        password: "securepass",
        next: "/scan",
      }) as Parameters<typeof POST>[0],
    );

    expect(signOut).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://eco.test/verify-email?email=user%40example.com&next=%2Fscan&error=email_not_confirmed");
  });
});
