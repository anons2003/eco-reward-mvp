import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const from = vi.fn();
const binSingle = vi.fn();
const scanSingle = vi.fn();
const insertScan = vi.fn();
const selectScan = vi.fn();
const eqBin = vi.fn();
const selectBin = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from,
  })),
}));

function postScan(body: unknown) {
  return new Request("https://eco.test/api/scan-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/scan-sessions", () => {
  beforeEach(() => {
    getUser.mockReset();
    from.mockReset();
    selectBin.mockReset();
    eqBin.mockReset();
    binSingle.mockReset();
    insertScan.mockReset();
    selectScan.mockReset();
    scanSingle.mockReset();

    selectBin.mockReturnValue({ eq: eqBin });
    eqBin.mockReturnValue({ single: binSingle });
    insertScan.mockReturnValue({ select: selectScan });
    selectScan.mockReturnValue({ single: scanSingle });

    from.mockImplementation((table: string) => {
      if (table === "bins") return { select: selectBin };
      if (table === "scan_sessions") return { insert: insertScan };
      throw new Error(`Unexpected table ${table}`);
    });
  });

  it("creates a real scan session from qr_code for the authenticated user", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    binSingle.mockResolvedValueOnce({
      data: { id: "bin-1", name: "Bin A1", qr_code: "ECO-BIN-A1", location_name: "Sảnh A", active: true },
      error: null,
    });
    scanSingle.mockResolvedValueOnce({
      data: { id: "scan-1", expires_at: "2026-06-02T00:02:00.000Z" },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(postScan({ qr_code: " eco-bin-a1 ", lat: 10.7769, lng: 106.7009 }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(selectBin).toHaveBeenCalledWith("id,name,qr_code,location_name,active");
    expect(eqBin).toHaveBeenCalledWith("qr_code", "ECO-BIN-A1");
    expect(insertScan).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        bin_id: "bin-1",
        qr_code: "ECO-BIN-A1",
        lat: 10.7769,
        lng: 106.7009,
      }),
    );
    expect(payload).toEqual({
      ok: true,
      session: { id: "scan-1", expiresAt: "2026-06-02T00:02:00.000Z" },
      bin: { id: "bin-1", name: "Bin A1", locationName: "Sảnh A", qrCode: "ECO-BIN-A1" },
    });
  });

  it("rejects inactive bins before creating a scan session", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    binSingle.mockResolvedValueOnce({
      data: { id: "bin-1", name: "Bin C3", qr_code: "ECO-BIN-C3", location_name: "Hầm", active: false },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(postScan({ qr_code: "ECO-BIN-C3" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Thùng rác đang bảo trì.");
    expect(insertScan).not.toHaveBeenCalled();
  });
});
