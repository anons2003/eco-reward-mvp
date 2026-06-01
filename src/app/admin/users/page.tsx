import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Filter, Search, ShieldAlert, TrendingUp, UserPlus, Users, WalletCards, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicUserManagementActions } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

const pageSize = 10;
const userColumns = "id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at";

type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "avatar_url" | "phone" | "location" | "bio" | "role" | "status" | "points" | "trust_score" | "created_at">;
type StatusFilter = "all" | "active" | "blocked";
type SearchParams = Promise<{ page?: string | string[]; q?: string | string[]; status?: string | string[] }>;
type PageState = { page: number; q: string; status: StatusFilter };

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const rawParams = await searchParams;
  const state = parsePageState(rawParams);
  const from = (state.page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await createClient();

  let usersQuery = supabase
    .from("profiles")
    .select(userColumns, { count: "exact" })
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (state.status !== "all") {
    usersQuery = usersQuery.eq("status", state.status);
  }

  const searchTerm = sanitizeSearchTerm(state.q);
  if (searchTerm) {
    usersQuery = usersQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
  }

  const [usersResult, totalResult, blockedResult] = await Promise.all([
    usersQuery,
    supabase.from("profiles").select("id", { count: "exact", head: true }).neq("status", "deleted"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "blocked"),
  ]);

  const users = (usersResult.data ?? []) as ProfileRow[];
  const filteredTotal = usersResult.count ?? 0;
  const totalUsers = totalResult.count ?? 0;
  const blockedUsers = blockedResult.count ?? 0;
  const pagePoints = users.reduce((sum, user) => sum + user.points, 0);
  const pageCount = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const loadError = usersResult.error || totalResult.error || blockedResult.error;

  if (!loadError && state.page > pageCount) {
    redirect(buildUsersHref(state, { page: pageCount }));
  }

  const rangeStart = filteredTotal === 0 ? 0 : from + 1;
  const rangeEnd = filteredTotal === 0 ? 0 : Math.min(filteredTotal, from + users.length);

  const kpis = [
    { label: "Tổng người dùng", value: formatNumber(totalUsers), note: "Không gồm đã xóa", Icon: Users, tone: "green" },
    { label: "Trang hiện tại", value: formatNumber(users.length), note: `Trang ${state.page}`, Icon: UserPlus, tone: "blue" },
    { label: "Đã chặn", value: formatNumber(blockedUsers), note: "Cần theo dõi", Icon: ShieldAlert, tone: "red" },
    { label: "Điểm trang này", value: formatNumber(pagePoints), note: "Tổng điểm hiển thị", Icon: WalletCards, tone: "amber" },
  ] as const;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý người dùng</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và quản lý cộng đồng tái chế SeaTech.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DynamicUserManagementActions />
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#bbcbbb]/40 bg-white/80 shadow-[0_14px_38px_rgba(45,156,219,0.08)] backdrop-blur-md" data-admin-reveal>
        <div className="grid gap-4 border-b border-[#bbcbbb]/45 bg-[#f5f3f2]/40 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <form action="/admin/users" className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Tìm kiếm</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
                <input className="h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" defaultValue={state.q} name="q" placeholder="Tên, email hoặc khu vực..." type="search" />
              </span>
            </label>
            <StatusFilterSelect current={state.status} />
            <button className="inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-xl bg-[#e9e8e7] px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e4e2e1]" type="submit">
              <Filter size={17} />
              Lọc
            </button>
          </form>
          <p className="text-sm font-semibold text-[#3d4a3e]">
            Hiển thị <span className="font-black text-[#1b1c1b]">{rangeStart} - {rangeEnd}</span> trong số <span className="font-black text-[#1b1c1b]">{formatNumber(filteredTotal)}</span> người dùng
          </p>
        </div>

        {loadError ? (
          <p className="border-b border-[#bbcbbb]/35 bg-[#ffdad6]/35 px-5 py-4 text-sm font-black text-[#ba1a1a]">Không thể tải danh sách người dùng.</p>
        ) : null}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f5f3f2]/70">
                {["Người dùng", "Khu vực", "Tham gia", "Tổng điểm", "Độ uy tín", "Trạng thái", "Hành động"].map((heading) => (
                  <th className={`border-b border-[#bbcbbb]/45 px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e] ${heading === "Hành động" ? "w-44 text-right" : ""}`} key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/35">
              {users.map((user) => {
                const trust = trustMeta(user.trust_score);
                return (
                  <tr className={`group transition hover:bg-[#f5f3f2]/70 ${user.status === "blocked" ? "opacity-70" : ""}`} key={user.id}>
                    <td className="px-6 py-4">
                      <UserIdentity name={user.full_name} code={user.email} tone={trust.tone} />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1b1c1b]">{user.location || "Chưa cập nhật"}</td>
                    <td className="px-6 py-4 text-sm font-black text-[#1b1c1b]">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-black text-[#2ecc71]">{formatNumber(user.points)}</td>
                    <td className="px-6 py-4">
                      <TrustPill tone={trust.tone} label={trust.label} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill blocked={user.status === "blocked"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex shrink-0 items-center justify-end gap-1.5 whitespace-nowrap">
                        <Link className="grid size-9 shrink-0 place-items-center rounded-lg text-[#2d9cdb] transition hover:bg-[#2d9cdb]/10 active:scale-90" href={`/admin/users/${user.id}`} title="Xem chi tiết" aria-label="Xem chi tiết">
                          <Eye size={18} />
                        </Link>
                        <DynamicUserManagementActions user={user} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {users.map((user) => {
            const trust = trustMeta(user.trust_score);
            return (
              <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={user.id}>
                <div className="flex items-start justify-between gap-3">
                  <UserIdentity name={user.full_name} code={user.email} tone={trust.tone} />
                  <StatusPill blocked={user.status === "blocked"} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-bold text-[#6c7b6d]">
                  <span>
                    Tham gia
                    <strong className="block text-base text-[#1b1c1b]">{formatDate(user.created_at)}</strong>
                  </span>
                  <span>
                    Điểm
                    <strong className="block text-base text-[#2ecc71]">{formatNumber(user.points)}</strong>
                  </span>
                  <span>
                    Uy tín
                    <strong className="block text-base text-[#1b1c1b]">{trust.label}</strong>
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-[#3d4a3e]">{user.location || "Chưa cập nhật khu vực"}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#bbcbbb]/60 bg-white px-4 text-sm font-black text-[#2d9cdb] transition hover:bg-[#2d9cdb]/10" href={`/admin/users/${user.id}`}>
                    <Eye size={17} />
                    Chi tiết
                  </Link>
                  <div className="shrink-0">
                    <DynamicUserManagementActions user={user} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-black text-[#1b1c1b]">{loadError ? "Không có dữ liệu để hiển thị." : "Chưa có người dùng phù hợp."}</p>
            <p className="mt-2 text-sm font-semibold text-[#6c7b6d]">Thử đổi bộ lọc hoặc tạo người dùng mới.</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-[#bbcbbb]/45 bg-[#f5f3f2]/40 px-5 py-4">
          <PaginationArrow direction="previous" disabled={state.page <= 1} href={buildUsersHref(state, { page: Math.max(1, state.page - 1) })} />
          <div className="flex gap-2">
            {paginationPages(state.page, pageCount).map((page) => (
              <Link className={`grid size-8 place-items-center rounded-lg text-sm font-black ${page === state.page ? "bg-[#2ecc71] text-white" : "text-[#3d4a3e] hover:bg-white"}`} href={buildUsersHref(state, { page })} key={page}>
                {page}
              </Link>
            ))}
          </div>
          <PaginationArrow direction="next" disabled={state.page >= pageCount} href={buildUsersHref(state, { page: Math.min(pageCount, state.page + 1) })} />
        </div>
      </section>

      <section className="grid-flow-dense grid gap-8 overflow-hidden rounded-[32px] border border-[#58bcfd]/20 bg-[#58bcfd]/10 p-8 md:grid-cols-2 md:items-center" data-admin-reveal>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-[#2c3e50]">Sức mạnh từ sự kết nối</h2>
          <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-[#3d4a3e]">Mỗi người dùng trong hệ thống là một đại sứ môi trường. Nhóm uy tín cao đang chiếm phần lớn cộng đồng SeaTech.</p>
          <div className="mt-6 flex gap-8">
            <ImpactMetric value={`${Math.round((users.filter((user) => user.trust_score >= 80).length / Math.max(users.length, 1)) * 100)}%`} label="uy tín cao trên trang" />
            <ImpactMetric value={formatNumber(pagePoints)} label="điểm đang hiển thị" />
          </div>
        </div>
        <div className="relative min-h-60 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_35%_35%,rgba(46,204,113,0.32),transparent_28%),linear-gradient(135deg,#e8f5ff,#edf6ed)] shadow-2xl transition duration-700 hover:rotate-0 md:rotate-2">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
          <Users className="absolute right-8 top-8 text-[#006d37]/18" size={150} />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-white/88 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-black text-[#006d37]">{formatNumber(users.length)} người dùng</p>
            <p className="mt-1 text-xs font-semibold text-[#3d4a3e]">Dữ liệu từ trang hiện tại</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusFilterSelect({ current }: { current: StatusFilter }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Trạng thái</span>
      <select className="h-11 rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" defaultValue={current} name="status">
        <option value="all">Tất cả</option>
        <option value="active">Hoạt động</option>
        <option value="blocked">Đã chặn</option>
      </select>
    </label>
  );
}

function KpiCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "green" | "blue" | "red" | "amber" }) {
  const toneClass = {
    green: "border-l-[#2ecc71] bg-[#2ecc71]/10 text-[#006d37]",
    blue: "border-l-[#2d9cdb] bg-[#2d9cdb]/10 text-[#006492]",
    red: "border-l-[#e74c3c] bg-[#ffdad6]/35 text-[#ba1a1a]",
    amber: "border-l-[#f39c12] bg-[#ffe084]/35 text-[#735c00]",
  }[tone];

  return (
    <article className="flex items-center justify-between rounded-2xl border border-white/60 border-l-4 bg-white/82 p-6 shadow-[0_12px_34px_rgba(45,156,219,0.08)] backdrop-blur-md" data-admin-reveal>
      <div>
        <p className="text-sm font-black text-[#3d4a3e]">{label}</p>
        <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#1b1c1b]">{value}</h2>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-current">
          <TrendingUp size={14} />
          {note}
        </p>
      </div>
      <span className={`grid size-14 place-items-center rounded-full border-l-4 ${toneClass}`}>
        <Icon size={26} />
      </span>
    </article>
  );
}

function UserIdentity({ name, code, tone }: { name: string; code: string; tone: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 text-sm font-black ${tone === "low" ? "border-[#e74c3c]/15 bg-[#ffdad6]/35 text-[#ba1a1a] grayscale" : "border-[#2ecc71]/15 bg-[#6bfe9c]/20 text-[#006d37]"}`}>
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-[#1b1c1b]">{name}</span>
        <span className="block truncate text-xs font-semibold text-[#6c7b6d]">{code}</span>
      </span>
    </span>
  );
}

function TrustPill({ tone, label }: { tone: string; label: string }) {
  const className = {
    high: "bg-[#2ecc71]/18 text-[#1e8449]",
    medium: "bg-[#58bcfd]/16 text-[#006492]",
    low: "bg-[#ffdad6]/50 text-[#ba1a1a]",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatusPill({ blocked }: { blocked: boolean }) {
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${blocked ? "bg-[#ffdad6]/55 text-[#ba1a1a]" : "bg-[#2ecc71]/12 text-[#2ecc71]"}`}>{blocked ? "Đã chặn" : "Hoạt động"}</span>;
}

function PaginationArrow({ direction, disabled, href }: { direction: "previous" | "next"; disabled: boolean; href: string }) {
  const content =
    direction === "previous" ? (
      <>
        <ChevronLeft size={17} />
        Trước
      </>
    ) : (
      <>
        Tiếp
        <ChevronRight size={17} />
      </>
    );

  const className = "inline-flex items-center gap-2 text-sm font-black text-[#6c7b6d] disabled:opacity-50";
  return disabled ? (
    <span className={`${className} opacity-50`} aria-disabled="true">
      {content}
    </span>
  ) : (
    <Link className={className} href={href}>
      {content}
    </Link>
  );
}

function ImpactMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-black tracking-[-0.04em] text-[#2ecc71]">{value}</p>
      <p className="text-xs font-black text-[#3d4a3e]">{label}</p>
    </div>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parsePageState(params: Awaited<SearchParams>): PageState {
  const parsedPage = Number.parseInt(readParam(params.page), 10);
  const status = readParam(params.status);

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    q: readParam(params.q).trim().replace(/\s+/g, " ").slice(0, 120),
    status: status === "active" || status === "blocked" ? status : "all",
  };
}

function sanitizeSearchTerm(query: string) {
  return query.replace(/[\\,%*_()]/g, " ").replace(/\s+/g, " ").trim();
}

function buildUsersHref(state: PageState, overrides: Partial<PageState>) {
  const nextState = { ...state, ...overrides };
  const params = new URLSearchParams();

  if (nextState.q) params.set("q", nextState.q);
  if (nextState.status !== "all") params.set("status", nextState.status);
  if (nextState.page > 1) params.set("page", String(nextState.page));

  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

function paginationPages(currentPage: number, pageCount: number) {
  const start = Math.max(1, Math.min(currentPage - 1, pageCount - 2));
  const end = Math.min(pageCount, start + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function trustMeta(score: number) {
  if (score >= 80) return { tone: "high", label: "Cao" };
  if (score >= 50) return { tone: "medium", label: "Trung bình" };
  return { tone: "low", label: "Thấp" };
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}
