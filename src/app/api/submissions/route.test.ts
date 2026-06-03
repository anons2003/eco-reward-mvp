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
const analyzeImage = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
  })),
}));

vi.mock("@/application/ai/analyze-image", () => ({
  analyzeImage,
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
    analyzeImage.mockReset();

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

    analyzeImage.mockResolvedValue({
      wasteType: "plastic_bottle",
      confidence: 0.92,
      objectCount: 1,
      imageQuality: "good",
      notes: "AI nhận diện chai nhựa rõ.",
      isValidSubmission: true,
      contaminationRisk: "low",
      visibleEvidence: ["Có chai nhựa trong ảnh"],
      fraudFlags: [],
      provider: "openai",
      model: "gpt-4.1-mini",
    });
  });

  it("creates a pending AI-reviewed submission tied to the authenticated scan session", async () => {
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
    expect(analyzeImage).toHaveBeenCalledWith("data:image/jpeg;base64,abc");
    expect(insertSubmission).toHaveBeenCalledWith({
      user_id: "user-1",
      bin_id: "bin-1",
      scan_session_id: "scan-1",
      image_url: "data:image/jpeg;base64,abc",
      ai_result: {
        wasteType: "plastic_bottle",
        confidence: 0.92,
        objectCount: 1,
        imageQuality: "good",
        notes: "AI nhận diện chai nhựa rõ.",
        isValidSubmission: true,
        contaminationRisk: "low",
        visibleEvidence: ["Có chai nhựa trong ảnh"],
        fraudFlags: [],
        provider: "openai",
        model: "gpt-4.1-mini",
      },
      status: "pending_review",
      points: 0,
      reason: "AI đã phân tích, chờ admin duyệt.",
      risk_flags: [],
    });
    expect(payload).toEqual({ submission: { id: "sub-1" } });
  });

  it("stores risk flags when AI cannot confidently validate the image", async () => {
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
    analyzeImage.mockResolvedValueOnce({
      wasteType: "unknown",
      confidence: 0.31,
      objectCount: 0,
      imageQuality: "unclear",
      notes: "Không đủ rõ.",
      isValidSubmission: false,
      contaminationRisk: "high",
      visibleEvidence: [],
      fraudFlags: ["no_visible_waste"],
      provider: "openai",
      model: "gpt-4.1-mini",
    });
    submissionSingle.mockResolvedValueOnce({
      data: { id: "sub-1" },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));

    expect(response.status).toBe(200);
    expect(insertSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        points: 0,
        reason: "AI đã phát hiện rủi ro, chờ admin kiểm tra.",
        risk_flags: ["no_visible_waste", "low_confidence", "unknown_waste", "image_quality", "invalid_submission", "high_contamination"],
      }),
    );
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
