import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const rpc = vi.fn();

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

function reviewRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/review", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    rpc.mockReset();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue({ rpc });
    rpc.mockResolvedValue({
      data: [
        {
          submission_id: "submission-1",
          user_id: "user-1",
          status: "approved",
          points: 10,
          reason: "Hợp lệ",
        },
      ],
      error: null,
    });
  });

  it("validates review payloads before calling the review RPC", async () => {
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "", decision: "approved", reason: "" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "submissionId, decision và reason là bắt buộc." });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("reviews a submission through the atomic RPC", async () => {
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "approved", reason: " Hợp lệ " }));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("review_submission_with_points", {
      p_admin_id: "admin-1",
      p_submission_id: "submission-1",
      p_decision: "approved",
      p_reason: "Hợp lệ",
    });
    expect(await response.json()).toEqual({
      submission: {
        submission_id: "submission-1",
        user_id: "user-1",
        status: "approved",
        points: 10,
        reason: "Hợp lệ",
      },
    });
  });

  it("maps missing submissions from the review RPC to 404", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "submission_not_found" } });
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "missing", decision: "rejected", reason: "Không thấy dữ liệu" }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Submission not found" });
  });

  it("maps denied admin profiles from the review RPC to 403", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "admin_profile_not_found" } });
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "approved", reason: "Hợp lệ" }));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Admin account is not allowed to review submissions" });
  });

  it("requires an authenticated admin", async () => {
    const adminResponse = Response.json({ error: "Admin required" }, { status: 403 });
    requireAdmin.mockResolvedValueOnce({ ok: false, response: adminResponse });
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "approved", reason: "Hợp lệ" }));

    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
});
