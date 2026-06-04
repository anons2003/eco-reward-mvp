import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const submissionSelect = vi.fn();
const submissionEq = vi.fn();
const submissionSingle = vi.fn();
const submissionUpdate = vi.fn();
const updateEq = vi.fn();
const updateSelect = vi.fn();
const updateSingle = vi.fn();
const profileSelect = vi.fn();
const profileSelectEq = vi.fn();
const profileSingle = vi.fn();
const profileUpdate = vi.fn();
const profileEq = vi.fn();
const pointRuleSelect = vi.fn();
const pointRuleEqWasteType = vi.fn();
const pointRuleEqActive = vi.fn();
const pointRuleMaybeSingle = vi.fn();
const transactionInsert = vi.fn();
const auditInsert = vi.fn();

const from = vi.fn((table: string) => {
  if (table === "submissions") {
    return { select: submissionSelect, update: submissionUpdate };
  }
  if (table === "profiles") {
    return { select: profileSelect, update: profileUpdate };
  }
  if (table === "point_transactions") {
    return { insert: transactionInsert };
  }
  if (table === "point_rules") {
    return { select: pointRuleSelect };
  }
  if (table === "audit_logs") {
    return { insert: auditInsert };
  }
  throw new Error(`Unexpected table: ${table}`);
});

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
    submissionSelect.mockReset();
    submissionEq.mockReset();
    submissionSingle.mockReset();
    submissionUpdate.mockReset();
    updateEq.mockReset();
    updateSelect.mockReset();
    updateSingle.mockReset();
    profileUpdate.mockReset();
    profileSelect.mockReset();
    profileSelectEq.mockReset();
    profileSingle.mockReset();
    profileEq.mockReset();
    pointRuleSelect.mockReset();
    pointRuleEqWasteType.mockReset();
    pointRuleEqActive.mockReset();
    pointRuleMaybeSingle.mockReset();
    transactionInsert.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue({ from });
    submissionSelect.mockReturnValue({ eq: submissionEq });
    submissionEq.mockReturnValue({ single: submissionSingle });
    submissionSingle.mockResolvedValue({
      data: {
        id: "submission-1",
        user_id: "user-1",
        status: "pending_review",
        points: 10,
        ai_result: { wasteType: "plastic" },
      },
      error: null,
    });
    submissionUpdate.mockReturnValue({ eq: updateEq });
    updateEq.mockReturnValue({ select: updateSelect });
    updateSelect.mockReturnValue({ single: updateSingle });
    updateSingle.mockResolvedValue({
      data: {
        id: "submission-1",
        user_id: "user-1",
        status: "approved",
        points: 10,
        reason: "Hợp lệ",
      },
      error: null,
    });
    profileUpdate.mockReturnValue({ eq: profileEq });
    profileEq.mockResolvedValue({ error: null });
    profileSelect.mockReturnValue({ eq: profileSelectEq });
    profileSelectEq.mockReturnValue({ single: profileSingle });
    profileSingle.mockResolvedValue({ data: { points: 32 }, error: null });
    pointRuleSelect.mockReturnValue({ eq: pointRuleEqWasteType });
    pointRuleEqWasteType.mockReturnValue({ eq: pointRuleEqActive });
    pointRuleEqActive.mockReturnValue({ maybeSingle: pointRuleMaybeSingle });
    pointRuleMaybeSingle.mockResolvedValue({ data: null, error: null });
    transactionInsert.mockResolvedValue({ error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("validates review payloads", async () => {
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "", decision: "approved", reason: "" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "submissionId, decision và reason là bắt buộc." });
    expect(submissionSelect).not.toHaveBeenCalled();
  });

  it("approves a submission, increments profile points, and writes point_transactions", async () => {
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "approved", reason: " Hợp lệ " }));

    expect(response.status).toBe(200);
    expect(submissionUpdate).toHaveBeenCalledWith({
      status: "approved",
      reason: "Hợp lệ",
      reviewed_at: expect.any(String),
      reviewed_by: "admin-1",
      points: 10,
    });
    expect(profileUpdate).toHaveBeenCalledWith({ points: 42 });
    expect(transactionInsert).toHaveBeenCalledWith({
      user_id: "user-1",
      submission_id: "submission-1",
      points: 10,
      reason: "Hợp lệ",
    });
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.submission.review",
      target_id: "submission-1",
      metadata: { decision: "approved", points: 10 },
    });
    expect(await response.json()).toEqual({
      submission: {
        id: "submission-1",
        user_id: "user-1",
        status: "approved",
        points: 10,
        reason: "Hợp lệ",
      },
    });
  });

  it("does not write a duplicate point transaction when an already-approved submission is reviewed again", async () => {
    submissionSingle.mockResolvedValueOnce({
      data: {
        id: "submission-1",
        user_id: "user-1",
        status: "approved",
        points: 10,
        ai_result: { wasteType: "plastic" },
      },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "approved", reason: "Đã duyệt" }));

    expect(response.status).toBe(200);
    expect(profileUpdate).not.toHaveBeenCalled();
    expect(transactionInsert).not.toHaveBeenCalled();
  });

  it("updates rejected submissions without changing wallet points", async () => {
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "rejected", reason: "Không hợp lệ" }));

    expect(response.status).toBe(200);
    expect(submissionUpdate).toHaveBeenCalledWith({
      status: "rejected",
      reason: "Không hợp lệ",
      reviewed_at: expect.any(String),
      reviewed_by: "admin-1",
      points: 0,
    });
    expect(profileUpdate).not.toHaveBeenCalled();
    expect(transactionInsert).not.toHaveBeenCalled();
  });

  it("uses an active point rule when approving a submission without precomputed points", async () => {
    submissionSingle.mockResolvedValueOnce({
      data: {
        id: "submission-1",
        user_id: "user-1",
        status: "pending_review",
        points: 0,
        ai_result: { wasteType: "paper" },
      },
      error: null,
    });
    updateSingle.mockResolvedValueOnce({
      data: {
        id: "submission-1",
        user_id: "user-1",
        status: "approved",
        points: 6,
        reason: "Hợp lệ",
      },
      error: null,
    });
    pointRuleMaybeSingle.mockResolvedValueOnce({ data: { points: 6 }, error: null });
    const { POST } = await import("./route");

    const response = await POST(reviewRequest({ submissionId: "submission-1", decision: "approved", reason: "Hợp lệ" }));

    expect(response.status).toBe(200);
    expect(pointRuleSelect).toHaveBeenCalledWith("points");
    expect(pointRuleEqWasteType).toHaveBeenCalledWith("waste_type", "paper");
    expect(pointRuleEqActive).toHaveBeenCalledWith("active", true);
    expect(submissionUpdate).toHaveBeenCalledWith({
      status: "approved",
      reason: "Hợp lệ",
      reviewed_at: expect.any(String),
      reviewed_by: "admin-1",
      points: 6,
    });
    expect(profileUpdate).toHaveBeenCalledWith({ points: 38 });
    expect(transactionInsert).toHaveBeenCalledWith({
      user_id: "user-1",
      submission_id: "submission-1",
      points: 6,
      reason: "Hợp lệ",
    });
  });
});
