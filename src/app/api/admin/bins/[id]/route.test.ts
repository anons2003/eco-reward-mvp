import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const update = vi.fn();
const updateEq = vi.fn();
const updateSelect = vi.fn();
const updateSingle = vi.fn();
const locationSelect = vi.fn();
const locationEq = vi.fn();
const locationSingle = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  if (table === "locations") return { select: locationSelect };
  return { update };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const binColumns = "id,name,qr_code,location_name,location_id,lat,lng,active";

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
    locationSelect.mockReset();
    locationEq.mockReset();
    locationSingle.mockReset();
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
    locationSelect.mockReturnValue({ eq: locationEq });
    locationEq.mockReturnValue({ single: locationSingle });
    locationSingle.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "127 Quách Thị Trang",
        lat: 16.005406,
        lng: 108.222811,
      },
      error: null,
    });
    updateSingle.mockResolvedValue({
      data: {
        id: "bin-1",
        name: "SeaBin Edited",
        qr_code: "ECO-BIN-EDITED",
        location_name: "127 Quách Thị Trang",
        location_id: "11111111-1111-4111-8111-111111111111",
        lat: 16.005406,
        lng: 108.222811,
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
        locationId: "11111111-1111-4111-8111-111111111111",
        active: false,
      }),
      { params: { id: "bin-1" } },
    );

    expect(response.status).toBe(200);
    expect(locationSelect).toHaveBeenCalledWith("id,name,lat,lng");
    expect(locationEq).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(update).toHaveBeenCalledWith({
      name: "SeaBin Edited",
      qr_code: "ECO-BIN-EDITED",
      location_id: "11111111-1111-4111-8111-111111111111",
      location_name: "127 Quách Thị Trang",
      lat: 16.005406,
      lng: 108.222811,
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
