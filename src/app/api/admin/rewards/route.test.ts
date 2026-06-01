import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const select = vi.fn();
const order = vi.fn();
const insert = vi.fn();
const rewardSelect = vi.fn();
const single = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { select, insert };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const rewardColumns = "id,title,description,points_required,stock,active,category,partner,image_url,expires_at,created_at";

function adminClient() {
  return { from };
}

function postRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/rewards", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/rewards", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    select.mockReset();
    order.mockReset();
    insert.mockReset();
    rewardSelect.mockReset();
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
      data: [
        {
          id: "reward-1",
          title: "Voucher xanh",
          description: "Ưu đãi demo",
          points_required: 120,
          stock: 10,
          active: true,
          category: "Voucher",
          partner: "SeaTech",
          image_url: null,
          expires_at: null,
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      error: null,
    });
    insert.mockReturnValue({ select: rewardSelect });
    rewardSelect.mockReturnValue({ single });
    single.mockResolvedValue({ data: { id: "reward-1", title: "Voucher xanh" }, error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("lists rewards for admins", async () => {
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      rewards: [
        {
          id: "reward-1",
          title: "Voucher xanh",
          description: "Ưu đãi demo",
          points_required: 120,
          stock: 10,
          active: true,
          category: "Voucher",
          partner: "SeaTech",
          image_url: null,
          expires_at: null,
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
    });
    expect(select).toHaveBeenCalledWith(rewardColumns);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("validates create payloads before inserting rewards", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ title: "", description: "", pointsRequired: 0, stock: -1, category: "Bad" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid reward payload");
    expect(body.issues).toBeTruthy();
    expect(insert).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("creates a reward and writes an audit log", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        title: " Voucher xanh ",
        description: " Ưu đãi demo ",
        pointsRequired: 120,
        stock: 10,
        active: true,
        category: "Voucher",
        partner: " SeaTech ",
        imageUrl: " https://example.com/reward.png ",
        expiresAt: "2026-12-31",
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ reward: { id: "reward-1", title: "Voucher xanh" } });
    expect(insert).toHaveBeenCalledWith({
      title: "Voucher xanh",
      description: "Ưu đãi demo",
      points_required: 120,
      stock: 10,
      active: true,
      category: "Voucher",
      partner: "SeaTech",
      image_url: "https://example.com/reward.png",
      expires_at: "2026-12-31",
    });
    expect(rewardSelect).toHaveBeenCalledWith(rewardColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.reward.create",
      target_id: "reward-1",
      metadata: { title: "Voucher xanh", pointsRequired: 120, stock: 10 },
    });
  });
});
