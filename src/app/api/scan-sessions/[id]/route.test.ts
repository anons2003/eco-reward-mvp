import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const from = vi.fn();
const selectSession = vi.fn();
const eqSession = vi.fn();
const sessionSingle = vi.fn();
const selectSubmission = vi.fn();
const eqSubmission = vi.fn();
const limitSubmission = vi.fn();
const submissionMaybeSingle = vi.fn();
const selectBin = vi.fn();
const eqBin = vi.fn();
const binSingle = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
  })),
}));

describe("GET /api/scan-sessions/[id]", () => {
  beforeEach(() => {
    vi.resetModules();
    getUser.mockReset();
    from.mockReset();
    selectSession.mockReset();
    eqSession.mockReset();
    sessionSingle.mockReset();
    selectSubmission.mockReset();
    eqSubmission.mockReset();
    limitSubmission.mockReset();
    submissionMaybeSingle.mockReset();
    selectBin.mockReset();
    eqBin.mockReset();
    binSingle.mockReset();

    selectSession.mockReturnValue({ eq: eqSession });
    eqSession.mockReturnValue({ single: sessionSingle });
    selectSubmission.mockReturnValue({ eq: eqSubmission });
    eqSubmission.mockReturnValue({ limit: limitSubmission });
    limitSubmission.mockReturnValue({ maybeSingle: submissionMaybeSingle });
    selectBin.mockReturnValue({ eq: eqBin });
    eqBin.mockReturnValue({ single: binSingle });
    submissionMaybeSingle.mockResolvedValue({ data: null, error: null });
    binSingle.mockResolvedValue({
      data: { id: "bin-1", name: "Thùng A", qr_code: "SEATECH-DN-A", location_name: "Chợ Hàn", active: true },
      error: null,
    });

    from.mockImplementation((table: string) => {
      if (table === "scan_sessions") return { select: selectSession };
      if (table === "submissions") return { select: selectSubmission };
      if (table === "bins") return { select: selectBin };
      throw new Error(`Unexpected table ${table}`);
    });
  });

  it("returns the authenticated user's scan session status", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    sessionSingle.mockResolvedValueOnce({
      data: {
        id: "scan-1",
        user_id: "user-1",
        bin_id: "bin-1",
        qr_code: "SEATECH-DN-A",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        created_at: "2026-06-02T00:00:00.000Z",
      },
      error: null,
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/scan-sessions/scan-1"), { params: { id: "scan-1" } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(selectSession).toHaveBeenCalledWith("id,user_id,bin_id,qr_code,expires_at,created_at");
    expect(eqSession).toHaveBeenCalledWith("id", "scan-1");
    expect(eqSubmission).toHaveBeenCalledWith("scan_session_id", "scan-1");
    expect(eqBin).toHaveBeenCalledWith("id", "bin-1");
    expect(payload.session).toEqual(
      expect.objectContaining({
        id: "scan-1",
        expired: false,
        used: false,
        createdAt: "2026-06-02T00:00:00.000Z",
      }),
    );
    expect(payload.bin).toEqual({
      id: "bin-1",
      name: "Thùng A",
      locationName: "Chợ Hàn",
      qrCode: "SEATECH-DN-A",
      active: true,
    });
  });

  it("rejects another user's scan session", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    sessionSingle.mockResolvedValueOnce({
      data: {
        id: "scan-2",
        user_id: "user-2",
        bin_id: "bin-1",
        qr_code: "SEATECH-DN-A",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        created_at: "2026-06-02T00:00:00.000Z",
      },
      error: null,
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/scan-sessions/scan-2"), { params: { id: "scan-2" } });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Phiên QR không hợp lệ.");
    expect(selectSubmission).not.toHaveBeenCalled();
    expect(selectBin).not.toHaveBeenCalled();
  });
});
