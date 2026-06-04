import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const from = vi.fn();
const rpc = vi.fn();
const sessionSingle = vi.fn();
const selectSession = vi.fn();
const eqSession = vi.fn();
const selectExistingSubmission = vi.fn();
const eqExistingSubmission = vi.fn();
const limitExistingSubmission = vi.fn();
const maybeSingleExistingSubmission = vi.fn();
const analyzeImage = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
    rpc,
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
    rpc.mockReset();
    sessionSingle.mockReset();
    selectSession.mockReset();
    eqSession.mockReset();
    selectExistingSubmission.mockReset();
    eqExistingSubmission.mockReset();
    limitExistingSubmission.mockReset();
    maybeSingleExistingSubmission.mockReset();
    analyzeImage.mockReset();

    selectSession.mockReturnValue({ eq: eqSession });
    eqSession.mockReturnValue({ single: sessionSingle });
    selectExistingSubmission.mockReturnValue({ eq: eqExistingSubmission });
    eqExistingSubmission.mockReturnValue({ limit: limitExistingSubmission });
    limitExistingSubmission.mockReturnValue({ maybeSingle: maybeSingleExistingSubmission });
    maybeSingleExistingSubmission.mockResolvedValue({ data: null, error: null });
    rpc.mockResolvedValue({ data: [{ submission_id: "sub-1" }], error: null });

    from.mockImplementation((table: string) => {
      if (table === "scan_sessions") return { select: selectSession };
      if (table === "submissions") return { select: selectExistingSubmission };
      throw new Error(`Unexpected user table ${table}`);
    });

    analyzeImage.mockResolvedValue({
      wasteType: "plastic",
      confidence: 0.92,
      objectCount: 1,
      imageQuality: "good",
      notes: "AI nhận diện vật liệu nhựa rõ.",
      isValidSubmission: true,
      contaminationRisk: "low",
      visibleEvidence: ["Có vật liệu nhựa trong ảnh"],
      fraudFlags: [],
      provider: "openai",
      model: "gpt-4.1-mini",
    });
  });

  it("auto-approves and awards points for confident MVP AI classifications", async () => {
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
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(selectSession).toHaveBeenCalledWith("id,user_id,bin_id,expires_at");
    expect(eqSession).toHaveBeenCalledWith("id", "scan-1");
    expect(selectExistingSubmission).toHaveBeenCalledWith("id");
    expect(eqExistingSubmission).toHaveBeenCalledWith("scan_session_id", "scan-1");
    expect(analyzeImage).toHaveBeenCalledWith("data:image/jpeg;base64,abc");
    expect(rpc).toHaveBeenCalledWith("create_submission_with_points", {
      scan_session_id: "scan-1",
      image_url: "data:image/jpeg;base64,abc",
      ai_result: {
        wasteType: "plastic",
        confidence: 0.92,
        objectCount: 1,
        imageQuality: "good",
        notes: "AI nhận diện vật liệu nhựa rõ.",
        isValidSubmission: true,
        contaminationRisk: "low",
        visibleEvidence: ["Có vật liệu nhựa trong ảnh"],
        fraudFlags: [],
        provider: "openai",
        model: "gpt-4.1-mini",
      },
      status: "approved",
      points: 10,
      reason: "AI tự động duyệt: Nhựa.",
      risk_flags: [],
      reviewed_at: expect.any(String),
    });
    expect(payload).toEqual({ submission: { id: "sub-1" } });
  });

  it("keeps non-MVP or uncertain AI classifications pending for admin review", async () => {
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
      confidence: 0.8,
      objectCount: 1,
      imageQuality: "good",
      notes: "Không thuộc nhóm MVP.",
      isValidSubmission: true,
      contaminationRisk: "low",
      visibleEvidence: [],
      fraudFlags: [],
      provider: "openai",
      model: "gpt-4.1-mini",
    });
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "create_submission_with_points",
      expect.objectContaining({
        status: "pending_review",
        points: 0,
        reason: "AI đã phát hiện rủi ro, chờ admin kiểm tra.",
        risk_flags: ["unknown_waste"],
      }),
    );
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
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith(
      "create_submission_with_points",
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
    expect(rpc).not.toHaveBeenCalled();
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
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not leave approved submissions behind when the atomic RPC fails", async () => {
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
    rpc.mockResolvedValueOnce({ data: null, error: { message: "profile_not_found" } });
    const { POST } = await import("./route");

    const response = await POST(postSubmission({ scan_session_id: "scan-1", image_url: "data:image/jpeg;base64,abc" }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Không tạo được lượt gửi.");
    expect(rpc).toHaveBeenCalledWith(
      "create_submission_with_points",
      expect.objectContaining({
        status: "approved",
        points: 10,
      }),
    );
  });
});
