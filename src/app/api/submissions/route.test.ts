import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const from = vi.fn();
const sessionSingle = vi.fn();
const submissionSingle = vi.fn();
const selectSession = vi.fn();
const eqSession = vi.fn();
const selectExistingSubmission = vi.fn();
const eqExistingSubmission = vi.fn();
const limitExistingSubmission = vi.fn();
const maybeSingleExistingSubmission = vi.fn();
const insertSubmission = vi.fn();
const selectSubmission = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
  })),
}));

function postSubmission(body: unknown) {
  return new Request("https://eco.test/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/submissions", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockReset();
    sessionSingle.mockReset();
    submissionSingle.mockReset();
    selectSession.mockReset();
    eqSession.mockReset();
    selectExistingSubmission.mockReset();
    eqExistingSubmission.mockReset();
    limitExistingSubmission.mockReset();
    maybeSingleExistingSubmission.mockReset();
    insertSubmission.mockReset();
    selectSubmission.mockReset();

    selectSession.mockReturnValue({ eq: eqSession });
    eqSession.mockReturnValue({ single: sessionSingle });
    selectExistingSubmission.mockReturnValue({ eq: eqExistingSubmission });
    eqExistingSubmission.mockReturnValue({ limit: limitExistingSubmission });
    limitExistingSubmission.mockReturnValue({ maybeSingle: maybeSingleExistingSubmission });
    maybeSingleExistingSubmission.mockResolvedValue({ data: null, error: null });
    insertSubmission.mockReturnValue({ select: selectSubmission });
    selectSubmission.mockReturnValue({ single: submissionSingle });

    from.mockImplementation((table: string) => {
      if (table === "scan_sessions") return { select: selectSession };
      if (table === "submissions") return { select: selectExistingSubmission, insert: insertSubmission };
      throw new Error(`Unexpected table ${table}`);
    });
  });

  it("creates a pending manual-review submission tied to the authenticated scan session", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    sessionSingle.mockResolvedValueOnce({
      data: {
        id: "scan-1",
        user_id: "user-1",
        bin_id: "bin-1",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      error: null,
    });
    submissionSingle.mockResolvedValueOnce({
      data: { id: "sub-1" },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(selectSession).toHaveBeenCalledWith("id,user_id,bin_id,expires_at");
    expect(eqSession).toHaveBeenCalledWith("id", "scan-1");
    expect(selectExistingSubmission).toHaveBeenCalledWith("id");
    expect(eqExistingSubmission).toHaveBeenCalledWith("scan_session_id", "scan-1");
    expect(insertSubmission).toHaveBeenCalledWith({
      user_id: "user-1",
      bin_id: "bin-1",
      scan_session_id: "scan-1",
      image_url: "data:image/jpeg;base64,abc",
      ai_result: { mode: "manual_review" },
      status: "pending_review",
      points: 10,
      reason: "Chờ admin duyệt thủ công.",
      risk_flags: [],
    });
    expect(payload).toEqual({ submission: { id: "sub-1" } });
  });

  it("rejects expired scan sessions before inserting submissions", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    sessionSingle.mockResolvedValueOnce({
      data: {
        id: "scan-1",
        user_id: "user-1",
        bin_id: "bin-1",
        expires_at: new Date(Date.now() - 1_000).toISOString(),
      },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scanSessionId: "scan-1", imageUrl: "data:image/jpeg;base64,abc" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Phiên QR đã hết hạn.");
    expect(insertSubmission).not.toHaveBeenCalled();
  });

  it("rejects scan sessions that already have a submission", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    sessionSingle.mockResolvedValueOnce({
      data: {
        id: "scan-1",
        user_id: "user-1",
        bin_id: "bin-1",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      error: null,
    });
    maybeSingleExistingSubmission.mockResolvedValueOnce({ data: { id: "sub-existing" }, error: null });
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Phiên QR này đã được sử dụng.");
    expect(insertSubmission).not.toHaveBeenCalled();
  });
});
