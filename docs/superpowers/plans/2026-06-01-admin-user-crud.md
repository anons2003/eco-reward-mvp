# Admin User CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build real admin CRUD for users, replacing hard-coded admin user screens with Supabase-backed list, detail, create, update, block/unblock, and soft-delete flows.

**Architecture:** Keep reads in server-rendered admin pages and mutations behind `/api/admin/users` route handlers. Route handlers verify the current session is an admin with the normal Supabase server client, then use a service-role Supabase admin client only for privileged writes such as creating auth users or bypassing RLS for profile management. Delete is implemented as a soft delete via `profiles.status = 'deleted'` so submissions, points, redemptions, and audit history remain intact.

**Tech Stack:** Next.js App Router, React Server Components, client action components, Supabase SSR, Supabase Admin Auth API, Vitest, TypeScript.

---

## File Structure

- Create: `db/migrations/0005_admin_user_crud.sql`
  - Adds `profile_status` enum, `profiles.status`, admin insert/update policies, and helpful indexes.
- Modify: `src/infrastructure/supabase/database.types.ts`
  - Adds `created_at` and `status` to `profiles.Row`; adds enum type values.
- Create: `src/infrastructure/supabase/admin.ts`
  - Creates a service-role Supabase client for server-only admin operations.
- Create: `src/infrastructure/auth/admin-session.ts`
  - Centralizes `requireAdmin()` for API routes.
- Create: `src/app/api/admin/users/route.ts`
  - Implements `GET` list and `POST` create user.
- Create: `src/app/api/admin/users/route.test.ts`
  - Covers list/create auth, validation, and Supabase calls.
- Create: `src/app/api/admin/users/[id]/route.ts`
  - Implements `GET` detail, `PATCH` update, and `DELETE` soft delete.
- Create: `src/app/api/admin/users/[id]/route.test.ts`
  - Covers detail/update/delete auth, validation, and audit writes.
- Create: `src/components/admin/user-management-actions.tsx`
  - Client component for create/edit/block/delete dialogs and row actions.
- Modify: `src/app/admin/users/page.tsx`
  - Replaces mock data with Supabase list query, filters, pagination, KPIs, and CRUD action component.
- Modify: `src/app/admin/users/[id]/page.tsx`
  - Replaces mock detail with Supabase profile/submission/redemption data and edit/block/delete actions.

## Data Contract

Profile status values:

```ts
type ProfileStatus = "active" | "blocked" | "deleted";
```

Admin-create form payload:

```json
{
  "email": "user@example.com",
  "fullName": "Nguyen Van Xanh",
  "password": "temporary-password",
  "role": "user",
  "phone": "0901234567",
  "location": "Quan 1, TP. HCM",
  "bio": "Optional note"
}
```

Admin-update payload:

```json
{
  "fullName": "Nguyen Van Xanh",
  "role": "admin",
  "phone": "0901234567",
  "location": "Quan 1, TP. HCM",
  "bio": "Optional note",
  "trustScore": 85,
  "status": "active"
}
```

## Task 1: Database Support For Admin User State

**Files:**
- Create: `db/migrations/0005_admin_user_crud.sql`
- Modify: `src/infrastructure/supabase/database.types.ts`

- [ ] **Step 1: Add the migration**

Create `db/migrations/0005_admin_user_crud.sql`:

```sql
create type public.profile_status as enum ('active', 'blocked', 'deleted');

alter table public.profiles
  add column if not exists status public.profile_status not null default 'active';

create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
create index if not exists profiles_search_idx on public.profiles using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(location, ''))
);

drop policy if exists "profiles admin insert" on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;

create policy "profiles admin insert" on public.profiles
  for insert
  with check (public.is_admin());

create policy "profiles admin update" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.profiles to authenticated;
```

- [ ] **Step 2: Update Supabase database types**

Modify `src/infrastructure/supabase/database.types.ts` so `profiles.Row` includes the missing `created_at` and new `status` fields:

```ts
profiles: {
  Row: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    avatar_object_key: string | null;
    phone: string | null;
    location: string | null;
    bio: string | null;
    role: "user" | "admin";
    status: "active" | "blocked" | "deleted";
    points: number;
    trust_score: number;
    created_at: string;
  };
  Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
  Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
  Relationships: [];
};
```

- [ ] **Step 3: Run tests and type checks**

Run:

```bash
npm test -- --runInBand
npm run lint
```

Expected: existing tests and lint pass. If `vitest` rejects `--runInBand`, run `npm test`.

- [ ] **Step 4: Commit**

```bash
git add db/migrations/0005_admin_user_crud.sql src/infrastructure/supabase/database.types.ts
git commit -m "feat: add admin user status schema"
```

## Task 2: Admin Supabase Client And Admin Session Guard

**Files:**
- Create: `src/infrastructure/supabase/admin.ts`
- Create: `src/infrastructure/auth/admin-session.ts`
- Test: covered by route tests in Tasks 3 and 4.

- [ ] **Step 1: Create the service-role client**

Create `src/infrastructure/supabase/admin.ts`:

```ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/infrastructure/config/env";
import type { Database } from "./database.types";

export function createAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

- [ ] **Step 2: Create the admin guard**

Create `src/infrastructure/auth/admin-session.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type AdminProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "role" | "status">;

export type AdminSession =
  | { ok: true; actorId: string; profile: AdminProfileRow }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  const { data, error } = await supabase.from("profiles").select("id,role,status").eq("id", user.id).single();
  const profile = data as AdminProfileRow | null;

  if (error || !profile || profile.role !== "admin" || profile.status !== "active") {
    return { ok: false, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { ok: true, actorId: user.id, profile };
}
```

- [ ] **Step 3: Run checks**

Run:

```bash
npm run lint
```

Expected: lint passes.

- [ ] **Step 4: Commit**

```bash
git add src/infrastructure/supabase/admin.ts src/infrastructure/auth/admin-session.ts
git commit -m "feat: add admin route authorization helpers"
```

## Task 3: Admin Users Collection API

**Files:**
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/app/api/admin/users/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const createAdminClient = vi.fn();
const select = vi.fn();
const order = vi.fn();
const range = vi.fn();
const insert = vi.fn();
const single = vi.fn();
const authAdminCreateUser = vi.fn();
const auditInsert = vi.fn();

vi.mock("@/infrastructure/auth/admin-session", () => ({ requireAdmin }));
vi.mock("@/infrastructure/supabase/admin", () => ({ createAdminClient }));

function adminClient() {
  return {
    auth: { admin: { createUser: authAdminCreateUser } },
    from: vi.fn((table: string) => {
      if (table === "audit_logs") return { insert: auditInsert };
      return { select, insert };
    }),
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
    insert.mockReset();
    single.mockReset();
    authAdminCreateUser.mockReset();
    auditInsert.mockReset();

    requireAdmin.mockResolvedValue({ ok: true, actorId: "admin-1", profile: { id: "admin-1", role: "admin", status: "active" } });
    createAdminClient.mockReturnValue(adminClient());
    select.mockReturnValue({ order });
    order.mockReturnValue({ range });
    range.mockResolvedValue({
      data: [{ id: "user-1", email: "user@example.com", full_name: "User One", role: "user", status: "active", points: 10, trust_score: 80 }],
      count: 1,
      error: null,
    });
    insert.mockReturnValue({ single });
    single.mockResolvedValue({ data: { id: "user-1" }, error: null });
    authAdminCreateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    auditInsert.mockResolvedValue({ error: null });
  });

  it("rejects unauthenticated callers", async () => {
    requireAdmin.mockResolvedValueOnce({ ok: false, response: Response.json({ error: "Authentication required" }, { status: 401 }) });
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users"));

    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("lists users with pagination", async () => {
    const { GET } = await import("./route");

    const response = await GET(new Request("https://eco.test/api/admin/users?page=2&pageSize=20"));
    const body = await response.json();

    expect(select).toHaveBeenCalledWith("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at", { count: "exact" });
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(range).toHaveBeenCalledWith(20, 39);
    expect(body.total).toBe(1);
    expect(body.users[0].email).toBe("user@example.com");
  });

  it("creates an auth user and matching profile", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        email: " New@Example.com ",
        fullName: " Nguyen Xanh ",
        password: "temporary-password",
        role: "user",
        phone: " 0901234567 ",
        location: " Quan 1 ",
      }),
    );

    expect(response.status).toBe(201);
    expect(authAdminCreateUser).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "temporary-password",
      email_confirm: true,
      user_metadata: { full_name: "Nguyen Xanh" },
    });
    expect(insert).toHaveBeenCalledWith({
      id: "user-1",
      email: "new@example.com",
      full_name: "Nguyen Xanh",
      role: "user",
      status: "active",
      phone: "0901234567",
      location: "Quan 1",
      bio: null,
    });
    expect(auditInsert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "admin.user.create",
      target_id: "user-1",
      metadata: { email: "new@example.com", role: "user" },
    });
  });

  it("validates create payload", async () => {
    const { POST } = await import("./route");

    const response = await POST(postRequest({ email: "bad", fullName: "", password: "short", role: "owner" }));

    expect(response.status).toBe(400);
    expect(authAdminCreateUser).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/app/api/admin/users/route.test.ts
```

Expected: FAIL because `src/app/api/admin/users/route.ts` does not exist.

- [ ] **Step 3: Implement the route**

Create `src/app/api/admin/users/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { Database } from "@/infrastructure/supabase/database.types";

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  fullName: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin"]).default("user"),
  phone: z.string().trim().max(32).optional(),
  location: z.string().trim().max(140).optional(),
  bio: z.string().trim().max(220).optional(),
});

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function pagination(request: NextRequest | Request) {
  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? "10"), 1), 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export async function GET(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { page, pageSize, from, to } = pagination(request);
  const supabase = createAdminClient();
  const { data, count, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Unable to load users" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, pageSize });
}

export async function POST(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Unable to create auth user" }, { status: 400 });
  }

  const profile: ProfileInsert = {
    id: authData.user.id,
    email: input.email,
    full_name: input.fullName,
    role: input.role,
    status: "active",
    phone: nullable(input.phone),
    location: nullable(input.location),
    bio: nullable(input.bio),
  };

  const { data, error } = await supabase.from("profiles").insert(profile).single();
  if (error) {
    return NextResponse.json({ error: "Auth user created but profile creation failed" }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_id: admin.actorId,
    action: "admin.user.create",
    target_id: authData.user.id,
    metadata: { email: input.email, role: input.role },
  });

  return NextResponse.json({ user: data }, { status: 201 });
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/app/api/admin/users/route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/users/route.ts src/app/api/admin/users/route.test.ts
git commit -m "feat: add admin users collection api"
```

## Task 4: Admin User Detail API

**Files:**
- Create: `src/app/api/admin/users/[id]/route.ts`
- Create: `src/app/api/admin/users/[id]/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/app/api/admin/users/[id]/route.test.ts` with tests for unauthenticated access, fetching a user, updating fields, blocking a user via `status`, and soft-deleting a user via `status = 'deleted'`. Use the same mocks from Task 3, but mock `.from("profiles").select().eq().single()`, `.from("profiles").update().eq().select().single()`, and `.from("audit_logs").insert()`.

Critical expectations:

```ts
expect(update).toHaveBeenCalledWith({
  full_name: "Updated User",
  role: "user",
  phone: "0901234567",
  location: "Quan 3",
  bio: null,
  trust_score: 90,
  status: "blocked",
});
expect(auditInsert).toHaveBeenCalledWith({
  actor_id: "admin-1",
  action: "admin.user.update",
  target_id: "user-1",
  metadata: { status: "blocked", role: "user" },
});
```

For delete:

```ts
expect(update).toHaveBeenCalledWith({ status: "deleted" });
expect(auditInsert).toHaveBeenCalledWith({
  actor_id: "admin-1",
  action: "admin.user.delete",
  target_id: "user-1",
  metadata: { mode: "soft_delete" },
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- 'src/app/api/admin/users/[id]/route.test.ts'
```

Expected: FAIL because the detail route does not exist.

- [ ] **Step 3: Implement the route**

Create `src/app/api/admin/users/[id]/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { Database } from "@/infrastructure/supabase/database.types";

const updateUserSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  role: z.enum(["user", "admin"]),
  phone: z.string().trim().max(32).optional(),
  location: z.string().trim().max(140).optional(),
  bio: z.string().trim().max(220).optional(),
  trustScore: z.number().int().min(0).max(100),
  status: z.enum(["active", "blocked", "deleted"]),
});

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

async function paramsId(params: Promise<{ id: string }> | { id: string }) {
  const resolved = await params;
  return resolved.id;
}

export async function GET(_request: NextRequest | Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await paramsId(context.params);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: data });
}

export async function PATCH(request: NextRequest | Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await paramsId(context.params);
  if (id === admin.actorId) {
    return NextResponse.json({ error: "Admins cannot edit their own admin profile here" }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const input = parsed.data;
  const updatePayload: ProfileUpdate = {
    full_name: input.fullName,
    role: input.role,
    phone: nullable(input.phone),
    location: nullable(input.location),
    bio: nullable(input.bio),
    trust_score: input.trustScore,
    status: input.status,
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profiles").update(updatePayload).eq("id", id).select().single();
  if (error || !data) {
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_id: admin.actorId,
    action: "admin.user.update",
    target_id: id,
    metadata: { status: input.status, role: input.role },
  });

  return NextResponse.json({ user: data });
}

export async function DELETE(_request: NextRequest | Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await paramsId(context.params);
  if (id === admin.actorId) {
    return NextResponse.json({ error: "Admins cannot delete themselves" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ status: "deleted" }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Unable to delete user" }, { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_id: admin.actorId,
    action: "admin.user.delete",
    target_id: id,
    metadata: { mode: "soft_delete" },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- 'src/app/api/admin/users/[id]/route.test.ts'
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add 'src/app/api/admin/users/[id]/route.ts' 'src/app/api/admin/users/[id]/route.test.ts'
git commit -m "feat: add admin user detail api"
```

## Task 5: Admin Users List UI With Real Data

**Files:**
- Create: `src/components/admin/user-management-actions.tsx`
- Modify: `src/app/admin/users/page.tsx`

- [ ] **Step 1: Create the client CRUD actions component**

Create `src/components/admin/user-management-actions.tsx` with:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ban, Pencil, Trash2, UserPlus } from "lucide-react";

type EditableUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: "user" | "admin";
  status: "active" | "blocked" | "deleted";
  trust_score: number;
};

export function UserManagementActions({ user }: { user?: EditableUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isCreate = !user;

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const payload = {
      email: String(formData.get("email") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "user"),
      phone: String(formData.get("phone") ?? ""),
      location: String(formData.get("location") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      trustScore: Number(formData.get("trustScore") ?? user?.trust_score ?? 80),
      status: String(formData.get("status") ?? user?.status ?? "active"),
    };

    const response = await fetch(isCreate ? "/api/admin/users" : `/api/admin/users/${user.id}`, {
      method: isCreate ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Không thể lưu người dùng.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  async function setStatus(status: "active" | "blocked") {
    if (!user) return;
    setPending(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: user.full_name,
        role: user.role,
        phone: user.phone ?? "",
        location: user.location ?? "",
        bio: user.bio ?? "",
        trustScore: user.trust_score,
        status,
      }),
    });
    setPending(false);
    router.refresh();
  }

  async function softDelete() {
    if (!user || !window.confirm("Ẩn người dùng này khỏi hệ thống quản trị?")) return;
    setPending(true);
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  }

  return (
    <>
      {isCreate ? (
        <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2d9cdb] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(45,156,219,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button" onClick={() => setOpen(true)}>
          <UserPlus size={17} />
          Thêm người dùng
        </button>
      ) : (
        <div className="flex justify-end gap-2">
          <button className="grid size-9 place-items-center rounded-lg text-[#2d9cdb] transition hover:bg-[#2d9cdb]/10 active:scale-90" type="button" onClick={() => setOpen(true)} title="Sửa người dùng">
            <Pencil size={18} />
          </button>
          <button className="grid size-9 place-items-center rounded-lg text-[#e74c3c] transition hover:bg-[#e74c3c]/10 active:scale-90" type="button" onClick={() => setStatus(user.status === "blocked" ? "active" : "blocked")} disabled={pending} title={user.status === "blocked" ? "Mở chặn" : "Chặn"}>
            <Ban size={18} />
          </button>
          <button className="grid size-9 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#6c7b6d]/10 active:scale-90" type="button" onClick={softDelete} disabled={pending} title="Xóa mềm">
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <form action={submit} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-[#1b1c1b]">{isCreate ? "Thêm người dùng" : "Sửa người dùng"}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {isCreate ? <Field name="email" label="Email" type="email" required defaultValue="" /> : null}
              <Field name="fullName" label="Họ tên" required defaultValue={user?.full_name ?? ""} />
              {isCreate ? <Field name="password" label="Mật khẩu tạm" type="password" required defaultValue="" /> : null}
              <Select name="role" label="Vai trò" defaultValue={user?.role ?? "user"} options={[["user", "Người dùng"], ["admin", "Quản trị"]]} />
              <Field name="phone" label="Số điện thoại" defaultValue={user?.phone ?? ""} />
              <Field name="location" label="Khu vực" defaultValue={user?.location ?? ""} />
              {!isCreate ? <Field name="trustScore" label="Độ uy tín" type="number" min={0} max={100} defaultValue={String(user?.trust_score ?? 80)} /> : null}
              {!isCreate ? <Select name="status" label="Trạng thái" defaultValue={user?.status ?? "active"} options={[["active", "Hoạt động"], ["blocked", "Đã chặn"], ["deleted", "Đã xóa"]]} /> : null}
              <label className="grid gap-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Ghi chú</span>
                <textarea className="min-h-24 rounded-xl border border-[#bbcbbb] bg-white px-3 py-2 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" name="bio" defaultValue={user?.bio ?? ""} />
              </label>
            </div>
            {error ? <p className="mt-4 text-sm font-bold text-[#ba1a1a]">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button className="min-h-10 rounded-xl bg-[#e9e8e7] px-4 text-sm font-black text-[#3d4a3e]" type="button" onClick={() => setOpen(false)}>Hủy</button>
              <button className="min-h-10 rounded-xl bg-[#2d9cdb] px-4 text-sm font-black text-white disabled:opacity-60" type="submit" disabled={pending}>{pending ? "Đang lưu..." : "Lưu"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <input className="h-11 rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" {...inputProps} />
    </label>
  );
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: Array<[string, string]> }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <select className="h-11 rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" name={name} defaultValue={defaultValue}>
        {options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
  );
}
```

- [ ] **Step 2: Replace mock list with Supabase data**

Modify `src/app/admin/users/page.tsx`:

```tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Filter, Search, ShieldAlert, TrendingUp, Users, WalletCards, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";
import { UserManagementActions } from "@/components/admin/user-management-actions";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "avatar_url" | "phone" | "location" | "bio" | "role" | "status" | "points" | "trust_score" | "created_at">;

const pageSize = 10;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1"), 1);
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  let usersQuery = supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at", { count: "exact" })
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    usersQuery = usersQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,location.ilike.%${query}%`);
  }

  if (status !== "all") {
    usersQuery = usersQuery.eq("status", status);
  }

  const [{ data, count }, { count: activeCount }, { count: blockedCount }] = await Promise.all([
    usersQuery,
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("status", "deleted"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "blocked"),
  ]);

  const users = (data ?? []) as ProfileRow[];
  const total = count ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const pointsTotal = users.reduce((sum, user) => sum + user.points, 0);
  const kpis = [
    { label: "Tổng người dùng", value: String(activeCount ?? total), note: "Không tính đã xóa", Icon: Users, tone: "green" },
    { label: "Người dùng trang này", value: String(users.length), note: `Trang ${page}/${totalPages}`, Icon: Users, tone: "blue" },
    { label: "Người dùng bị chặn", value: String(blockedCount ?? 0), note: "Cần kiểm tra", Icon: ShieldAlert, tone: "red" },
    { label: "Điểm trang này", value: pointsTotal.toLocaleString("vi-VN"), note: "Tổng điểm hiện có", Icon: WalletCards, tone: "amber" },
  ] as const;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />
      {/* Keep existing header/card/table layout; replace hard-coded rows with users.map(...) and render <UserManagementActions /> in the create button and row actions. */}
    </div>
  );
}
```

Keep the existing visual helper components (`FilterSelect`, `KpiCard`, `UserIdentity`, `TrustPill`, `StatusPill`, `ImpactMetric`) but change row rendering to use:

```tsx
{users.map((user) => (
  <tr className={`group transition hover:bg-[#f5f3f2]/70 ${user.status === "blocked" ? "opacity-70" : ""}`} key={user.id}>
    <td className="px-6 py-4">
      <UserIdentity name={user.full_name} code={user.email} tone={user.trust_score >= 80 ? "high" : user.trust_score >= 50 ? "medium" : "low"} />
    </td>
    <td className="px-6 py-4 text-sm font-semibold text-[#1b1c1b]">{user.location ?? "Chưa cập nhật"}</td>
    <td className="px-6 py-4 text-sm font-black text-[#1b1c1b]">{user.role === "admin" ? "Admin" : "User"}</td>
    <td className="px-6 py-4 text-sm font-black text-[#2ecc71]">{user.points.toLocaleString("vi-VN")}</td>
    <td className="px-6 py-4">
      <TrustPill tone={user.trust_score >= 80 ? "high" : user.trust_score >= 50 ? "medium" : "low"} label={`${user.trust_score}/100`} />
    </td>
    <td className="px-6 py-4">
      <StatusPill blocked={user.status === "blocked"} />
    </td>
    <td className="px-6 py-4">
      <div className="flex justify-end gap-2">
        <Link className="grid size-9 place-items-center rounded-lg text-[#2d9cdb] transition hover:bg-[#2d9cdb]/10 active:scale-90" href={`/admin/users/${user.id}`} title="Xem chi tiết">
          <Eye size={18} />
        </Link>
        <UserManagementActions user={user} />
      </div>
    </td>
  </tr>
))}
```

- [ ] **Step 3: Run checks**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/user-management-actions.tsx src/app/admin/users/page.tsx
git commit -m "feat: connect admin users list to Supabase"
```

## Task 6: Admin User Detail UI With Real Data

**Files:**
- Modify: `src/app/admin/users/[id]/page.tsx`

- [ ] **Step 1: Replace mock profile and metrics**

Modify `src/app/admin/users/[id]/page.tsx` to query:

```ts
const [{ data: profile }, { data: submissions }, { data: redemptions }] = await Promise.all([
  supabase.from("profiles").select("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at").eq("id", id).single(),
  supabase.from("submissions").select("id,status,points,reason,risk_flags,created_at,image_url,ai_result").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
  supabase.from("reward_redemptions").select("id,points_spent,status,created_at,reward_items(title)").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
]);
```

If `profile` is missing, call `notFound()` from `next/navigation`.

Use real metrics:

```ts
const approvedSubmissions = (submissions ?? []).filter((row) => row.status === "approved").length;
const warningCount = (submissions ?? []).filter((row) => row.risk_flags.length > 0).length;
const metrics = [
  { label: "Lượt gửi gần đây", value: String(submissions?.length ?? 0), note: `${approvedSubmissions} đã duyệt`, Icon: Recycle, tone: "green" },
  { label: "Tổng điểm hiện có", value: profile.points.toLocaleString("vi-VN"), note: profile.role === "admin" ? "Quản trị viên" : "Người dùng", Icon: WalletCards, tone: "blue" },
  { label: "Độ uy tín", value: `${profile.trust_score}/100`, note: profile.status === "blocked" ? "Đang bị chặn" : "Đang hoạt động", Icon: ShieldCheck, tone: "greenSolid" },
  { label: "Cảnh báo", value: String(warningCount), note: "Từ lượt gửi gần đây", Icon: ShieldAlert, tone: "red" },
] as const;
```

- [ ] **Step 2: Add real edit/block/delete actions**

Import and render:

```tsx
import { UserManagementActions } from "@/components/admin/user-management-actions";
```

In the header actions:

```tsx
<UserManagementActions user={profile} />
```

Keep existing visual structure but replace profile facts with:

```tsx
<ProfileFact Icon={CalendarDays} text={`Tham gia: ${new Date(profile.created_at).toLocaleDateString("vi-VN")}`} />
<ProfileFact Icon={Mail} text={profile.email} />
<ProfileFact Icon={Phone} text={profile.phone ?? "Chưa cập nhật"} />
<ProfileFact Icon={MapPin} text={profile.location ?? "Chưa cập nhật"} />
```

- [ ] **Step 3: Render real submissions**

Replace hard-coded `submissions.map` with queried rows:

```tsx
{(submissions ?? []).map((submission) => (
  <tr className="group border-b border-[#bbcbbb]/25 transition hover:bg-[#f5f3f2]/70" key={submission.id}>
    <td className="px-4 py-4"><ProofVisual tone={submission.status === "approved" ? "blue" : "amber"} /></td>
    <td className="px-4 py-4"><WastePill label={String((submission.ai_result as { wasteType?: string }).wasteType ?? "Chưa rõ")} tone={submission.status === "approved" ? "blue" : "amber"} /></td>
    <td className="px-4 py-4 text-sm font-semibold text-[#6c7b6d]">{new Date(submission.created_at).toLocaleString("vi-VN")}</td>
    <td className="px-4 py-4 text-sm font-black text-[#2ecc71]">+{submission.points}</td>
    <td className="px-4 py-4">
      <span className="inline-flex items-center gap-2 text-sm font-black text-[#2ecc71]">
        <span className="size-2 rounded-full bg-[#2ecc71]" />
        {submission.status}
      </span>
    </td>
    <td className="px-4 py-4">
      <Link className="grid size-9 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#006d37]/10 hover:text-[#006d37]" href={`/admin/submissions/${submission.id}`} aria-label="Xem lượt gửi">
        <Eye size={18} />
      </Link>
    </td>
  </tr>
))}
```

- [ ] **Step 4: Run checks**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add 'src/app/admin/users/[id]/page.tsx'
git commit -m "feat: connect admin user detail to Supabase"
```

## Task 7: Full Verification

**Files:**
- All files above.

- [ ] **Step 1: Run unit tests**

Run:

```bash
npm test
```

Expected: all Vitest tests pass.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes.

- [ ] **Step 3: Build the app**

Run:

```bash
npm run build
```

Expected: Next.js build completes.

- [ ] **Step 4: Manual browser verification**

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/admin/users
```

Verify:

- Admin users list loads real profiles.
- Search by name/email/location filters results.
- Pagination changes page with `?page=`.
- “Thêm người dùng” creates a new auth user and profile.
- Edit updates full name, role, phone, location, bio, trust score, and status.
- Block/unblock toggles the status without removing history.
- Delete hides the user by setting status to `deleted`.
- Detail page at `/admin/users/<id>` shows real profile metrics and recent submissions.
- Non-admin sessions receive `403` from API routes.

- [ ] **Step 5: Final commit if verification required fixes**

```bash
git status --short
git add <fixed-files>
git commit -m "fix: stabilize admin user crud"
```

## Self-Review

Spec coverage:

- Create user: Task 3 API and Task 5 UI.
- Read/list users: Task 3 API and Task 5 list page.
- Read/detail user: Task 4 API and Task 6 detail page.
- Update user: Task 4 API and Task 5/6 UI.
- Delete user: Task 4 soft delete and Task 5/6 UI.
- Admin authorization: Task 2, Task 3 tests, Task 4 tests.
- Auditability: Task 3 and Task 4 insert `audit_logs`.
- Existing history preservation: Task 1 status column and Task 4 soft delete.

Placeholder scan:

- No task depends on an undefined file.
- Code snippets define concrete payloads, status values, route behavior, and verification commands.

Type consistency:

- API and UI use `fullName` over the wire and `full_name` in Supabase rows.
- Status values are consistently `"active" | "blocked" | "deleted"`.
- Role values remain the existing `"user" | "admin"` enum.
