import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const maybeSingle = vi.fn();

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

function context(id = "redemption-1") {
  return { params: Promise.resolve({ id }) };
}

function adminClient() {
  return {
    from: vi.fn(() => ({ update })),
  };
}

describe("/api/admin/reward-redemptions/[id]", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    update.mockReset();
    eq.mockReset();
    select.mockReset();
    maybeSingle.mockReset();

    requireAdmin.mockResolvedValue({ ok: true, actorId: "admin-1" });
    createAdminClient.mockReturnValue(adminClient());
    update.mockReturnValue({ eq });
    eq.mockReturnValue({ select });
    select.mockReturnValue({ maybeSingle });
    maybeSingle.mockResolvedValue({
      data: {
        id: "redemption-1",
        status: "used",
        redemption_code: "ST-ABC123DEF0",
        fulfilled_at: "2026-06-04T00:00:00.000Z",
      },
      error: null,
    });
  });

  it("requires an admin session", async () => {
    requireAdmin.mockResolvedValueOnce({ ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) });
    const { PATCH } = await import("./route");

    const response = await PATCH(new Request("https://eco.test/api/admin/reward-redemptions/redemption-1", { method: "PATCH", body: "{}" }), context());

    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("updates redemption status and marks used as fulfilled", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("https://eco.test/api/admin/reward-redemptions/redemption-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "used" }),
      }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      status: "used",
      fulfilled_at: expect.any(String),
    });
    expect(eq).toHaveBeenCalledWith("id", "redemption-1");
  });

  it("rejects invalid statuses", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("https://eco.test/api/admin/reward-redemptions/redemption-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "pending" }),
      }),
      context(),
    );

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});
