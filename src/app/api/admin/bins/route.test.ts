import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const select = vi.fn();
const order = vi.fn();
const insert = vi.fn();
const insertSelect = vi.fn();
const single = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { select, insert };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const binColumns = "id,name,qr_code,location_name,lat,lng,active";

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
          lat: 10.7769,
          lng: 106.7009,
          active: true,
        },
      ],
      error: null,
    });
    insert.mockReturnValue({ select: insertSelect });
    insertSelect.mockReturnValue({ single });
    single.mockResolvedValue({
      data: {
        id: "bin-1",
        name: "SeaBin Test",
        qr_code: "ECO-BIN-TEST",
        location_name: "Quận 1",
        lat: 10.7769,
        lng: 106.7009,
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

    const response = await POST(postRequest({ name: "", qrCode: "", locationName: "", lat: 100, lng: 200 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid bin payload" });
    expect(insert).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("creates a bin and writes an audit log", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        name: " SeaBin Test ",
        qrCode: " eco-bin-test ",
        locationName: " Quận 1 ",
        lat: 10.7769,
        lng: 106.7009,
        active: true,
      }),
    );

    expect(response.status).toBe(201);
    expect(insert).toHaveBeenCalledWith({
      name: "SeaBin Test",
      qr_code: "ECO-BIN-TEST",
      location_name: "Quận 1",
      lat: 10.7769,
      lng: 106.7009,
      active: true,
    });
    expect(insertSelect).toHaveBeenCalledWith(binColumns);
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.bin.create",
      target_id: "bin-1",
      metadata: { name: "SeaBin Test", qrCode: "ECO-BIN-TEST", active: true },
    });
  });
});
