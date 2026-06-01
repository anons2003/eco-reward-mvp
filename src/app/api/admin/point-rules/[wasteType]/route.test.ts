import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const single = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { update };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const pointRuleColumns = "waste_type,points,active,updated_at";

function context(wasteType = "paper") {
  return { params: Promise.resolve({ wasteType }) };
}

function patchRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/point-rules/paper", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/point-rules/[wasteType]", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    update.mockReset();
    eq.mockReset();
    select.mockReset();
    single.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue({ from });
    update.mockReturnValue({ eq });
    eq.mockReturnValue({ select });
    select.mockReturnValue({ single });
    single.mockResolvedValue({
      data: { waste_type: "paper", points: 7, active: true, updated_at: "2026-06-01T00:00:00.000Z" },
      error: null,
    });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("updates a point rule and writes an audit log", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ points: 7, active: true }), context());

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      points: 7,
      active: true,
      updated_at: expect.any(String),
    });
    expect(eq).toHaveBeenCalledWith("waste_type", "paper");
    expect(select).toHaveBeenCalledWith(pointRuleColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.point_rule.update",
      target_id: null,
      metadata: { wasteType: "paper", points: 7, active: true },
    });
    expect(await response.json()).toEqual({
      rule: { waste_type: "paper", points: 7, active: true, updated_at: "2026-06-01T00:00:00.000Z" },
    });
  });

  it("deactivates a point rule instead of deleting the row", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/point-rules/paper", { method: "DELETE" }), context());

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      active: false,
      updated_at: expect.any(String),
    });
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.point_rule.delete",
      target_id: null,
      metadata: { wasteType: "paper" },
    });
  });

  it("rejects invalid waste types", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patchRequest({ points: 7, active: true }), context("bad_type"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid waste type" });
    expect(update).not.toHaveBeenCalled();
  });
});
