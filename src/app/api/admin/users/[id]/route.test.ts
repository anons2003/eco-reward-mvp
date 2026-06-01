import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const profileSelect = vi.fn();
const profileEq = vi.fn();
const profileSingle = vi.fn();
const profileUpdate = vi.fn();
const updateEq = vi.fn();
const updateSelect = vi.fn();
const updateSingle = vi.fn();
const deleteSelect = vi.fn();
const deleteSingle = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { select: profileSelect, update: profileUpdate };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

const userColumns = "id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at";

const user = {
  id: "user-1",
  email: "user@example.com",
  full_name: "User One",
  avatar_url: null,
  phone: "0901234567",
  location: "Quan 1",
  bio: "Recycles weekly",
  role: "user",
  status: "active",
  points: 25,
  trust_score: 88,
  created_at: "2026-06-01T00:00:00.000Z",
};

function adminClient() {
  return { from };
}

function context(id = "user-1") {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/users/user-1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/users/[id]", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    profileSelect.mockReset();
    profileEq.mockReset();
    profileSingle.mockReset();
    profileUpdate.mockReset();
    updateEq.mockReset();
    updateSelect.mockReset();
    updateSingle.mockReset();
    deleteSelect.mockReset();
    deleteSingle.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue(adminClient());
    profileSelect.mockReturnValue({ eq: profileEq });
    profileEq.mockReturnValue({ single: profileSingle });
    profileSingle.mockResolvedValue({ data: user, error: null });
    profileUpdate.mockImplementation(() => ({ eq: updateEq }));
    updateEq.mockReturnValue({ select: updateSelect });
    updateSelect.mockReturnValue({ single: updateSingle });
    updateSingle.mockResolvedValue({ data: { ...user, full_name: "Updated User" }, error: null });
    deleteSelect.mockReturnValue({ single: deleteSingle });
    deleteSingle.mockResolvedValue({ data: { id: "user-1" }, error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("rejects unauthenticated callers before creating the admin client", async () => {
    requireAdmin.mockResolvedValue({ ok: false, response: Response.json({ error: "Authentication required" }, { status: 401 }) });
    const { GET, PATCH, DELETE } = await import("./route");

    const getResponse = await GET(new Request("https://eco.test/api/admin/users/user-1"), context());
    const patchResponse = await PATCH(patchRequest({}), context());
    const deleteResponse = await DELETE(new Request("https://eco.test/api/admin/users/user-1", { method: "DELETE" }), context());

    expect(getResponse.status).toBe(401);
    expect(await getResponse.json()).toEqual({ error: "Authentication required" });
    expect(patchResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("returns user detail by id", async () => {
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users/user-1"), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user });
    expect(profileSelect).toHaveBeenCalledWith(userColumns);
    expect(profileEq).toHaveBeenCalledWith("id", "user-1");
    expect(profileSingle).toHaveBeenCalled();
  });

  it("returns 404 for missing detail rows", async () => {
    profileSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users/missing"), context("missing"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
  });

  it("validates patch payloads before updating profiles", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ fullName: "", role: "owner", phone: "1".repeat(33), trustScore: 101, status: "active" }),
      context(),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid user payload");
    expect(body.issues).toBeTruthy();
    expect(profileUpdate).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("updates a user and writes an audit log", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({
        fullName: " Updated User ",
        role: "admin",
        phone: " 0907654321 ",
        location: "   ",
        bio: " Audit ready ",
        trustScore: 91,
        status: "active",
      }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: { ...user, full_name: "Updated User" } });
    expect(profileUpdate).toHaveBeenCalledWith({
      full_name: "Updated User",
      role: "admin",
      phone: "0907654321",
      location: null,
      bio: "Audit ready",
      trust_score: 91,
      status: "active",
    });
    expect(updateEq).toHaveBeenCalledWith("id", "user-1");
    expect(updateSelect).toHaveBeenCalledWith(userColumns);
    expect(updateSingle).toHaveBeenCalled();
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.user.update",
      target_id: "user-1",
      metadata: { status: "active", role: "admin" },
    });
  });

  it("blocks a user via patch status and audits the status", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({
        fullName: "Blocked User",
        role: "user",
        trustScore: 10,
        status: "blocked",
      }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(profileUpdate).toHaveBeenCalledWith({
      full_name: "Blocked User",
      role: "user",
      phone: null,
      location: null,
      bio: null,
      trust_score: 10,
      status: "blocked",
    });
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.user.update",
      target_id: "user-1",
      metadata: { status: "blocked", role: "user" },
    });
  });

  it("rejects admins editing themselves", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      patchRequest({ fullName: "Admin One", role: "admin", trustScore: 100, status: "active" }),
      context("admin-1"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Admins cannot edit their own admin profile here" });
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(profileUpdate).not.toHaveBeenCalled();
  });

  it("soft-deletes a user and writes an audit log", async () => {
    updateEq.mockReturnValueOnce({ select: deleteSelect });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/users/user-1", { method: "DELETE" }), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(profileUpdate).toHaveBeenCalledWith({ status: "deleted" });
    expect(updateEq).toHaveBeenCalledWith("id", "user-1");
    expect(deleteSelect).toHaveBeenCalledWith("id");
    expect(deleteSingle).toHaveBeenCalled();
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.user.delete",
      target_id: "user-1",
      metadata: { mode: "soft_delete" },
    });
  });

  it("returns 404 and skips audit when deleting a missing user", async () => {
    updateEq.mockReturnValueOnce({ select: deleteSelect });
    deleteSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/users/missing", { method: "DELETE" }), context("missing"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
    expect(profileUpdate).toHaveBeenCalledWith({ status: "deleted" });
    expect(updateEq).toHaveBeenCalledWith("id", "missing");
    expect(deleteSelect).toHaveBeenCalledWith("id");
    expect(deleteSingle).toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("rejects admins deleting themselves", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("https://eco.test/api/admin/users/admin-1", { method: "DELETE" }), context("admin-1"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Admins cannot delete themselves" });
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(profileUpdate).not.toHaveBeenCalled();
  });
});
