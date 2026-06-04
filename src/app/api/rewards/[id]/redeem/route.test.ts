import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getSupabaseServerClient = vi.fn();
const rpc = vi.fn();

vi.mock("@/infrastructure/auth/session", () => ({ getCurrentUser, getSupabaseServerClient }));

function serverClient() {
  return { rpc };
}

function context(id = "reward-1") {
  return { params: Promise.resolve({ id }) };
}

describe("/api/rewards/[id]/redeem", () => {
  beforeEach(() => {
    vi.resetModules();
    getCurrentUser.mockReset();
    getSupabaseServerClient.mockReset();
    rpc.mockReset();

    getCurrentUser.mockResolvedValue({ id: "user-1", email: "user@example.com" });
    getSupabaseServerClient.mockResolvedValue(serverClient());
    rpc.mockResolvedValue({
      data: {
        redemption_id: "redemption-1",
        reward_item_id: "reward-1",
        points_spent: 120,
        remaining_points: 380,
        remaining_stock: 9,
        redemption_code: "ST-ABC123DEF0",
        redemption_status: "issued",
      },
      error: null,
    });
  });

  it("requires a signed-in user", async () => {
    getCurrentUser.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    const response = await POST(new Request("https://eco.test/api/rewards/reward-1/redeem", { method: "POST" }), context());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("redeems a reward through the atomic database function", async () => {
    const { POST } = await import("./route");

    const response = await POST(new Request("https://eco.test/api/rewards/reward-1/redeem", { method: "POST" }), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      redemption: {
        redemption_id: "redemption-1",
        reward_item_id: "reward-1",
        points_spent: 120,
        remaining_points: 380,
        remaining_stock: 9,
        redemption_code: "ST-ABC123DEF0",
        redemption_status: "issued",
      },
    });
    expect(rpc).toHaveBeenCalledWith("redeem_reward", { reward_id: "reward-1" });
  });

  it("returns a friendly error when points are insufficient", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "insufficient_points" } });
    const { POST } = await import("./route");

    const response = await POST(new Request("https://eco.test/api/rewards/reward-1/redeem", { method: "POST" }), context());

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Không đủ điểm để đổi phần thưởng này." });
  });

  it("returns a friendly error when stock is unavailable", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "reward_out_of_stock" } });
    const { POST } = await import("./route");

    const response = await POST(new Request("https://eco.test/api/rewards/reward-1/redeem", { method: "POST" }), context());

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Phần thưởng đã hết hàng." });
  });
});
