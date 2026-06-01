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

const binColumns = "id,name,qr_code,location_name,lat,lng,active";

function patchRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/bins/bin-1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/bins/[id]", () => {
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
    createAdminClient.mockReturnValue({ from });
    update.mockReturnValue({ eq: updateEq });
    updateEq.mockReturnValue({ select: updateSelect });
    updateSelect.mockReturnValue({ single: updateSingle });
    updateSingle.mockResolvedValue({
      data: {
        id: "bin-1",
        name: "SeaBin Edited",
        qr_code: "ECO-BIN-EDITED",
        location_name: "Quận 3",
        lat: 10.78,
        lng: 106.69,
        active: false,
      },
      error: null,
    });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("updates a bin and writes an audit log", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({
        name: "SeaBin Edited",
        qrCode: "ECO-BIN-EDITED",
        locationName: "Quận 3",
        lat: 10.78,
        lng: 106.69,
        active: false,
      }),
      { params: { id: "bin-1" } },
    );

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      name: "SeaBin Edited",
      qr_code: "ECO-BIN-EDITED",
      location_name: "Quận 3",
      lat: 10.78,
      lng: 106.69,
      active: false,
    });
    expect(updateSelect).toHaveBeenCalledWith(binColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.bin.update",
      target_id: "bin-1",
      metadata: { name: "SeaBin Edited", qrCode: "ECO-BIN-EDITED", active: false },
    });
  });

  it("deactivates a bin instead of hard deleting it", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/bins/bin-1", { method: "DELETE" }), { params: { id: "bin-1" } });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ active: false });
    expect(updateSelect).toHaveBeenCalledWith("id");
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.bin.delete",
      target_id: "bin-1",
      metadata: { mode: "deactivate" },
    });
  });

  it("reports missing bins", async () => {
    updateSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/bins/missing", { method: "DELETE" }), { params: { id: "missing" } });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Bin not found" });
  });
});
