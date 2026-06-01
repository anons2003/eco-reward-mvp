import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const select = vi.fn();
const order = vi.fn();
const range = vi.fn();
const upsert = vi.fn();
const profileSelect = vi.fn();
const single = vi.fn();
const authAdminCreateUser = vi.fn();
const authAdminDeleteUser = vi.fn();
const auditInsert = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "audit_logs") return { insert: auditInsert };
  return { select, upsert };
});

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

function adminClient() {
  return {
    auth: { admin: { createUser: authAdminCreateUser, deleteUser: authAdminDeleteUser } },
    from,
  };
}

function postRequest(body: unknown) {
  return new Request("https://eco.test/api/admin/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/users", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdmin.mockReset();
    createAdminClient.mockReset();
    select.mockReset();
    order.mockReset();
    range.mockReset();
    upsert.mockReset();
    profileSelect.mockReset();
    single.mockReset();
    authAdminCreateUser.mockReset();
    authAdminDeleteUser.mockReset();
    auditInsert.mockReset();
    from.mockClear();

    requireAdmin.mockResolvedValue({
      ok: true,
      actorId: "admin-1",
      profile: { id: "admin-1", role: "admin", status: "active" },
    });
    createAdminClient.mockReturnValue(adminClient());
    select.mockReturnValue({ order });
    order.mockReturnValue({ range });
    range.mockResolvedValue({
      data: [
        {
          id: "user-1",
          email: "user@example.com",
          full_name: "User One",
          avatar_url: null,
          phone: null,
          location: null,
          bio: null,
          role: "user",
          status: "active",
          points: 10,
          trust_score: 80,
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      count: 1,
      error: null,
    });
    upsert.mockReturnValue({ select: profileSelect });
    profileSelect.mockReturnValue({ single });
    single.mockResolvedValue({ data: { id: "user-1", email: "new@example.com" }, error: null });
    authAdminCreateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    authAdminDeleteUser.mockResolvedValue({ data: {}, error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("rejects unauthenticated callers before creating the admin client", async () => {
    requireAdmin.mockResolvedValueOnce({ ok: false, response: Response.json({ error: "Authentication required" }, { status: 401 }) });
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("rejects non-admin callers before creating the admin client", async () => {
    requireAdmin.mockResolvedValueOnce({ ok: false, response: Response.json({ error: "Admin access required" }, { status: 403 }) });
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users"));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Admin access required" });
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("lists users with exact count and page pagination", async () => {
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users?page=2&pageSize=20"));
    const body = await response.json();

    expect(select).toHaveBeenCalledWith("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at", {
      count: "exact",
    });
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(range).toHaveBeenCalledWith(20, 39);
    expect(body).toEqual({
      users: [
        {
          id: "user-1",
          email: "user@example.com",
          full_name: "User One",
          avatar_url: null,
          phone: null,
          location: null,
          bio: null,
          role: "user",
          status: "active",
          points: 10,
          trust_score: 80,
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 2,
      pageSize: 20,
    });
  });

  it("validates create payloads before calling Supabase auth", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ email: "bad", fullName: "", password: "short", role: "owner" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid user payload");
    expect(body.issues).toBeTruthy();
    expect(authAdminCreateUser).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("creates an auth user, matching profile, and audit log", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        email: " New@Example.com ",
        fullName: " Nguyen Xanh ",
        password: "temporary-password",
        role: "user",
        phone: " 0901234567 ",
        location: " Quan 1 ",
        bio: "   ",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ user: { id: "user-1", email: "new@example.com" } });
    expect(authAdminCreateUser).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "temporary-password",
      email_confirm: true,
      user_metadata: { full_name: "Nguyen Xanh" },
    });
    expect(upsert).toHaveBeenCalledWith(
      {
        id: "user-1",
        email: "new@example.com",
        full_name: "Nguyen Xanh",
        role: "user",
        status: "active",
        phone: "0901234567",
        location: "Quan 1",
        bio: null,
      },
      { onConflict: "id" },
    );
    expect(profileSelect).toHaveBeenCalledWith("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at");
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.user.create",
      target_id: "user-1",
      metadata: { email: "new@example.com", role: "user" },
    });
  });

  it("returns auth creation failures without inserting a profile", async () => {
    authAdminCreateUser.mockResolvedValueOnce({ data: { user: null }, error: { message: "User already registered" } });
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        email: "user@example.com",
        fullName: "Nguyen Xanh",
        password: "temporary-password",
        role: "user",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "User already registered" });
    expect(upsert).not.toHaveBeenCalled();
    expect(auditInsert).not.toHaveBeenCalled();
  });

  it("reports profile sync failure after auth creation succeeds", async () => {
    single.mockResolvedValueOnce({ data: null, error: { message: "upsert failed" } });
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        email: "user@example.com",
        fullName: "Nguyen Xanh",
        password: "temporary-password",
        role: "user",
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Auth user created but profile creation failed" });
    expect(authAdminDeleteUser).toHaveBeenCalledWith("user-1");
    expect(auditInsert).not.toHaveBeenCalled();
  });
});
