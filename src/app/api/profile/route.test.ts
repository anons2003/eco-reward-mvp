import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const update = vi.fn();
const eq = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from: vi.fn(() => ({ update })),
  })),
}));

function requestWithForm(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));

  return new Request("https://eco.test/api/profile", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/profile", () => {
  beforeEach(() => {
    getUser.mockReset();
    update.mockReset();
    eq.mockReset();

    update.mockReturnValue({ eq });
    eq.mockResolvedValue({ error: null });
  });

  it("redirects unauthenticated users to login", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ fullName: "Nguyen Xanh" }));

    expect(response.headers.get("location")).toBe("https://eco.test/login");
    expect(update).not.toHaveBeenCalled();
  });

  it("requires a full name before updating the profile", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    const { POST } = await import("./route");

    const response = await POST(requestWithForm({ fullName: "   " }));

    expect(update).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://eco.test/settings?profile=missing_name");
  });

  it("updates editable profile fields", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    const { POST } = await import("./route");

    const response = await POST(
      requestWithForm({
        fullName: " Nguyen Van Xanh ",
        phone: " 090 123 4567 ",
        location: " Đà Nẵng ",
        bio: " Cùng giữ biển sạch. ",
      }),
    );

    expect(update).toHaveBeenCalledWith({
      full_name: "Nguyen Van Xanh",
      phone: "090 123 4567",
      location: "Đà Nẵng",
      bio: "Cùng giữ biển sạch.",
    });
    expect(eq).toHaveBeenCalledWith("id", "user-1");
    expect(response.headers.get("location")).toBe("https://eco.test/settings?profile=success");
  });
});
