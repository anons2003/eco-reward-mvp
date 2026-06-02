import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const select = vi.fn();
const order = vi.fn();
const insert = vi.fn();
const insertSelect = vi.fn();
const single = vi.fn();
const locationSelect = vi.fn();
const locationEq = vi.fn();
const locationLimit = vi.fn();
const locationMaybeSingle = vi.fn();
const locationUpdate = vi.fn();
const locationUpdateEq = vi.fn();
const locationUpdateSelect = vi.fn();
const locationInsert = vi.fn();
const locationInsertSelect = vi.fn();
const locationSingle = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  if (table === "locations") return { select: locationSelect, update: locationUpdate, insert: locationInsert };
  return { select, insert };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const binColumns = "id,name,qr_code,location_name,location_id,lat,lng,active";

function adminClient() {
  return { from };
}

function postRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/bins", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/bins", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    select.mockReset();
    order.mockReset();
    insert.mockReset();
    insertSelect.mockReset();
    single.mockReset();
    locationSelect.mockReset();
    locationEq.mockReset();
    locationLimit.mockReset();
    locationMaybeSingle.mockReset();
    locationUpdate.mockReset();
    locationUpdateEq.mockReset();
    locationUpdateSelect.mockReset();
    locationInsert.mockReset();
    locationInsertSelect.mockReset();
    locationSingle.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue(adminClient());
    select.mockReturnValue({ order });
    order.mockResolvedValue({
      data: [
        {
          id: "bin-1",
          name: "SeaBin Test",
          qr_code: "ECO-BIN-TEST",
          location_name: "Quận 1",
          location_id: null,
          lat: 10.7769,
          lng: 106.7009,
          active: true,
        },
      ],
      error: null,
    });
    insert.mockReturnValue({ select: insertSelect });
    insertSelect.mockReturnValue({ single });
    locationSelect.mockReturnValue({ eq: locationEq });
    locationEq.mockReturnValue({ limit: locationLimit });
    locationLimit.mockReturnValue({ maybeSingle: locationMaybeSingle });
    locationMaybeSingle.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "127 Quách Thị Trang",
        lat: 16.005406,
        lng: 108.222811,
      },
      error: null,
    });
    locationUpdate.mockReturnValue({ eq: locationUpdateEq });
    locationUpdateEq.mockReturnValue({ select: locationUpdateSelect });
    locationUpdateSelect.mockReturnValue({ single: locationSingle });
    locationInsert.mockReturnValue({ select: locationInsertSelect });
    locationInsertSelect.mockReturnValue({ single: locationSingle });
    locationSingle.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "127 Quách Thị Trang",
        lat: 16.005406,
        lng: 108.222811,
      },
      error: null,
    });
    single.mockResolvedValue({
      data: {
        id: "bin-1",
        name: "SeaBin Test",
        qr_code: "ECO-BIN-TEST",
        location_name: "127 Quách Thị Trang",
        location_id: "11111111-1111-4111-8111-111111111111",
        lat: 16.005406,
        lng: 108.222811,
        active: true,
      },
      error: null,
    });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("lists bins for admins", async () => {
    const { GET } = await import("./route");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      bins: [
        {
          id: "bin-1",
          name: "SeaBin Test",
          qr_code: "ECO-BIN-TEST",
          location_name: "Quận 1",
          location_id: null,
          lat: 10.7769,
          lng: 106.7009,
          active: true,
        },
      ],
    });
    expect(select).toHaveBeenCalledWith(binColumns);
    expect(order).toHaveBeenCalledWith("name", { ascending: true });
  });

  it("validates create payloads before inserting bins", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ name: "", location: { name: "", address: "", lat: 100, lng: 200 } }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid bin payload" });
    expect(locationSelect).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("creates a bin and writes an audit log", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        name: " SeaBin Test ",
        location: {
          name: "127 Quách Thị Trang",
          address: "127 Quách Thị Trang, Hòa Xuân, Cẩm Lệ, Đà Nẵng",
          lat: 16.005406,
          lng: 108.222811,
        },
        active: true,
      }),
    );

    expect(response.status).toBe(201);
    expect(locationSelect).toHaveBeenCalledWith("id,name,lat,lng");
    expect(locationEq).toHaveBeenCalledWith("address", "127 Quách Thị Trang, Hòa Xuân, Cẩm Lệ, Đà Nẵng");
    expect(locationLimit).toHaveBeenCalledWith(1);
    expect(locationUpdate).toHaveBeenCalledWith({
      name: "127 Quách Thị Trang",
      address: "127 Quách Thị Trang, Hòa Xuân, Cẩm Lệ, Đà Nẵng",
      district: "Cẩm Lệ",
      ward: "Hòa Xuân",
      lat: 16.005406,
      lng: 108.222811,
      active: true,
    });
    expect(locationUpdateEq).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(locationUpdateSelect).toHaveBeenCalledWith("id,name,lat,lng");
    expect(locationInsert).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      name: "SeaBin Test",
      location_id: "11111111-1111-4111-8111-111111111111",
      location_name: "127 Quách Thị Trang",
      lat: 16.005406,
      lng: 108.222811,
      active: true,
    }));
    expect(insert.mock.calls[0]?.[0]?.qr_code).toMatch(/^SEATECH-BIN-[0-9A-F]{8}$/);
    expect(insertSelect).toHaveBeenCalledWith(binColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.bin.create",
      target_id: "bin-1",
      metadata: { name: "SeaBin Test", qrCode: expect.stringMatching(/^SEATECH-BIN-[0-9A-F]{8}$/), active: true },
    });
  });
});
