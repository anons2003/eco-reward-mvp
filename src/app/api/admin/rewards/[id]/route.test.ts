import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const update = vi.fn();
const updateEq = vi.fn();
const updateSelect = vi.fn();
const updateSingle = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { update };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const rewardColumns = "id,title,description,points_required,stock,active,category,partner,image_url,expires_at,created_at";

function adminClient() {
  return { from };
}

function context(id = "reward-1") {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/rewards/reward-1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/rewards/[id]", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    update.mockReset();
    updateEq.mockReset();
    updateSelect.mockReset();
    updateSingle.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue(adminClient());
    update.mockReturnValue({ eq: updateEq });
    updateEq.mockReturnValue({ select: updateSelect });
    updateSelect.mockReturnValue({ single: updateSingle });
    updateSingle.mockResolvedValue({ data: { id: "reward-1", title: "Voucher cập nhật", active: true }, error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("updates a reward and writes an audit log", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({
        title: " Voucher cập nhật ",
        description: " Mô tả mới ",
        pointsRequired: 180,
        stock: 7,
        active: true,
        category: "Quà tặng",
        partner: " SeaTech Shop ",
        imageUrl: "",
        expiresAt: "",
      }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reward: { id: "reward-1", title: "Voucher cập nhật", active: true } });
    expect(update).toHaveBeenCalledWith({
      title: "Voucher cập nhật",
      description: "Mô tả mới",
      points_required: 180,
      stock: 7,
      active: true,
      category: "Quà tặng",
      partner: "SeaTech Shop",
      image_url: null,
      expires_at: null,
    });
    expect(updateEq).toHaveBeenCalledWith("id", "reward-1");
    expect(updateSelect).toHaveBeenCalledWith(rewardColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.reward.update",
      target_id: "reward-1",
      metadata: { title: "Voucher cập nhật", active: true, stock: 7 },
    });
  });

  it("soft deletes rewards by marking them inactive", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/rewards/reward-1", { method: "DELETE" }), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ active: false });
    expect(updateEq).toHaveBeenCalledWith("id", "reward-1");
    expect(updateSelect).toHaveBeenCalledWith("id");
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.reward.delete",
      target_id: "reward-1",
      metadata: { mode: "deactivate" },
    });
  });

  it("returns 404 for missing rewards", async () => {
    updateSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ title: "Missing", description: "Missing reward", pointsRequired: 100, stock: 1, active: true, category: "Voucher" }),
      context("missing"),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Reward not found" });
    expect(auditInsert).not.toHaveBeenCalled();
  });
});
