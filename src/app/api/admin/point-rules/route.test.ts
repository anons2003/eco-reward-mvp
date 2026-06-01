import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const select = vi.fn();
const order = vi.fn();
const insert = vi.fn();
const insertSelect = vi.fn();
const single = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { select, insert };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const pointRuleColumns = "waste_type,points,active,updated_at";

function adminClient() {
  return { from };
}

function postRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/point-rules", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/point-rules", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    select.mockReset();
    order.mockReset();
    insert.mockReset();
    insertSelect.mockReset();
    single.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue(adminClient());
    select.mockReturnValue({ order });
    order.mockResolvedValue({
      data: [{ waste_type: "plastic_bottle", points: 10, active: true, updated_at: "2026-06-01T00:00:00.000Z" }],
      error: null,
    });
    insert.mockReturnValue({ select: insertSelect });
    insertSelect.mockReturnValue({ single });
    single.mockResolvedValue({
      data: { waste_type: "paper", points: 6, active: true, updated_at: "2026-06-01T00:00:00.000Z" },
      error: null,
    });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("lists point rules for admins", async () => {
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      rules: [{ waste_type: "plastic_bottle", points: 10, active: true, updated_at: "2026-06-01T00:00:00.000Z" }],
    });
    expect(select).toHaveBeenCalledWith(pointRuleColumns);
    expect(order).toHaveBeenCalledWith("waste_type", { ascending: true });
  });

  it("validates create payloads before inserting point rules", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ wasteType: "bad_type", points: -1, active: true }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid point rule payload" });
    expect(insert).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("creates a point rule and writes an audit log", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ wasteType: "paper", points: 6, active: true }));

    expect(response.status).toBe(201);
    expect(insert).toHaveBeenCalledWith({
      waste_type: "paper",
      points: 6,
      active: true,
      updated_at: expect.any(String),
    });
    expect(insertSelect).toHaveBeenCalledWith(pointRuleColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.point_rule.create",
      target_id: null,
      metadata: { wasteType: "paper", points: 6, active: true },
    });
  });
});
