import Link from "next/link";
import { ArrowDownToLine, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileCheck2, Plus, Search, SlidersHorizontal, XCircle, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type SubmissionStatus = Database["public"]["Tables"]["submissions"]["Row"]["status"];
type SubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "user_id" | "bin_id" | "status" | "points" | "reason" | "risk_flags" | "created_at" | "ai_result">;

const statusFilters: Array<{ label: string; value?: SubmissionStatus }> = [
  { label: "Tất cả" },
  { label: "Chờ duyệt", value: "pending_review" },
  { label: "Thành công", value: "approved" },
  { label: "Bị từ chối", value: "rejected" },
];

const statusLabel: Record<SubmissionStatus, string> = {
  approved: "Thành công",
  pending_review: "Chờ duyệt",
  rejected: "Bị từ chối",
};

const statusTone: Record<SubmissionStatus, "green" | "amber" | "red"> = {
  approved: "green",
  pending_review: "amber",
  rejected: "red",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function wasteLabel(row: SubmissionRow) {
  const result = row.ai_result && typeof row.ai_result === "object" && !Array.isArray(row.ai_result) ? row.ai_result : {};
  const wasteType = typeof result.wasteType === "string" ? result.wasteType : typeof result.mode === "string" ? "manual_review" : "unknown";
  const labels: Record<string, string> = {
    manual_review: "Duyệt thủ công",
    plastic: "Nhựa",
    plastic_bottle: "Nhựa",
    metal: "Kim loại",
    metal_can: "Kim loại",
    paper: "Giấy",
    cardboard: "Chưa xác định",
    glass: "Thủy tinh",
    glass_bottle: "Thủy tinh",
    organic: "Chưa xác định",
    hazardous: "Chưa xác định",
    unknown: "Chưa xác định",
  };
  return labels[wasteType] ?? wasteType.replaceAll("_", " ");
}

function confidence(row: SubmissionRow) {
  const result = row.ai_result && typeof row.ai_result === "object" && !Array.isArray(row.ai_result) ? row.ai_result : {};
  return typeof result.confidence === "number" ? Math.round(result.confidence * 100) : 0;
}

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const currentStatus = statusFilters.find((filter) => filter.value === params.status)?.value;
  const supabase = await createClient();
  const { data, error } = await supabase.from("submissions").select("id,user_id,bin_id,status,points,reason,risk_flags,created_at,ai_result").order("created_at", { ascending: false });
  const rows = ((data ?? []) as SubmissionRow[]).filter((row) => (currentStatus ? row.status === currentStatus : true));
  const allRows = (data ?? []) as SubmissionRow[];
  const total = allRows.length;
  const pending = allRows.filter((row) => row.status === "pending_review").length;
  const approved = allRows.filter((row) => row.status === "approved").length;
  const rejected = allRows.filter((row) => row.status === "rejected").length;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Danh sách lượt gửi</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và phê duyệt các lượt phân loại rác từ DB thật. Flow hiện tại ưu tiên duyệt thủ công, AI để sau.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#006d37]/20 bg-white px-4 text-sm font-black text-[#006d37] transition hover:bg-[#006d37]/5" type="button">
            <ArrowDownToLine size={17} />
            Xuất báo cáo
          </button>
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" href="/scan">
            <Plus size={17} />
            Tạo lượt gửi
          </Link>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng lượt gửi" value={total.toLocaleString("vi-VN")} Icon={FileCheck2} tone="green" />
        <StatCard label="Đang chờ duyệt" value={pending.toLocaleString("vi-VN")} Icon={SlidersHorizontal} tone="amber" />
        <StatCard label="Thành công" value={approved.toLocaleString("vi-VN")} Icon={CheckCircle2} tone="green" />
        <StatCard label="Bị từ chối" value={rejected.toLocaleString("vi-VN")} Icon={XCircle} tone="red" />
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" data-admin-reveal>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const active = filter.value === currentStatus || (!filter.value && !currentStatus);
            const href = filter.value ? `/admin/submissions?status=${filter.value}` : "/admin/submissions";
            return (
              <Link className={`rounded-full px-5 py-2 text-sm font-black transition ${active ? "bg-[#006d37] text-white" : "border border-[#bbcbbb]/60 bg-white text-[#3d4a3e] hover:border-[#006d37]"}`} href={href} key={filter.label}>
                {filter.label}
              </Link>
            );
          })}
        </div>
        <label className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
          <input className="h-11 w-full rounded-xl border border-[#bbcbbb]/60 bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20" placeholder="Tìm mã lượt gửi, user id..." type="search" />
        </label>
      </section>

      {error ? <section className="rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/35 p-5 text-sm font-black text-[#ba1a1a]">Không thể tải danh sách lượt gửi.</section> : null}

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="border-b border-[#bbcbbb]/30 bg-[#f5f3f2]">
              <tr>
                {["Mã lượt gửi", "Người dùng", "Loại rác", "Độ tin cậy", "Bin", "Thời gian", "Điểm", "Trạng thái", ""].map((heading) => (
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {rows.map((row) => (
                <tr className="group transition hover:bg-[#2ecc71]/5" key={row.id}>
                  <td className="px-5 py-5 font-mono text-xs font-black text-[#006492]">{row.id.slice(0, 8)}</td>
                  <td className="px-5 py-5 font-mono text-xs font-black text-[#1b1c1b]">{row.user_id.slice(0, 8)}</td>
                  <td className="px-5 py-5"><WastePill label={wasteLabel(row)} tone={statusTone[row.status]} /></td>
                  <td className="px-5 py-5"><Confidence value={confidence(row)} tone={statusTone[row.status]} /></td>
                  <td className="px-5 py-5 font-mono text-xs font-semibold text-[#3d4a3e]">{row.bin_id.slice(0, 8)}</td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#6c7b6d]">{formatDate(row.created_at)}</td>
                  <td className={`px-5 py-5 text-sm font-black ${row.status === "rejected" ? "text-[#ba1a1a]" : "text-[#006d37]"}`}>{row.points > 0 ? `+${row.points}` : "0"}</td>
                  <td className="px-5 py-5"><StatusPill label={statusLabel[row.status]} tone={statusTone[row.status]} /></td>
                  <td className="px-5 py-5 text-right">
                    <Link className="inline-grid size-9 place-items-center rounded-lg text-[#6c7b6d] opacity-0 transition hover:bg-[#efedec] hover:text-[#006d37] group-hover:opacity-100" href={`/admin/submissions/${row.id}`} title="Xem chi tiết">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {rows.map((row) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={row.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-black text-[#006492]">{row.id.slice(0, 8)}</p>
                  <h2 className="mt-1 text-base font-black text-[#2c3e50]">{wasteLabel(row)}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{formatDate(row.created_at)}</p>
                </div>
                <StatusPill label={statusLabel[row.status]} tone={statusTone[row.status]} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#bbcbbb]/20 pt-3">
                <span className="text-sm font-black text-[#006d37]">{row.points > 0 ? `+${row.points} pts` : "0 pts"}</span>
                <Link className="text-sm font-black text-[#006d37]" href={`/admin/submissions/${row.id}`}>Xem chi tiết</Link>
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 ? <p className="p-10 text-center text-sm font-black text-[#6c7b6d]">Không có lượt gửi phù hợp.</p> : null}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/30 px-6 py-4 md:flex-row">
          <p className="text-sm font-semibold text-[#6c7b6d]">Hiển thị {rows.length.toLocaleString("vi-VN")} trong số {total.toLocaleString("vi-VN")} lượt gửi</p>
          <div className="flex items-center gap-2">
            <button className="grid size-9 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#6c7b6d] opacity-50" disabled type="button"><ChevronLeft size={17} /></button>
            <button className="grid size-9 place-items-center rounded-lg bg-[#006d37] text-sm font-black text-white" type="button">1</button>
            <button className="grid size-9 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#3d4a3e] opacity-50" disabled type="button"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, Icon, tone }: { label: string; value: string; Icon: LucideIcon; tone: "green" | "amber" | "red" }) {
  const styles = {
    green: "border-l-[#006d37] text-[#006d37] bg-[#006d37]/10",
    amber: "border-l-[#f39c12] text-[#f39c12] bg-[#f39c12]/10",
    red: "border-l-[#ba1a1a] text-[#ba1a1a] bg-[#ba1a1a]/10",
  }[tone];
  return (
    <article className={`flex items-center gap-4 rounded-2xl border border-[#bbcbbb]/25 border-l-4 bg-white p-5 shadow-[0_12px_34px_rgba(45,156,219,0.06)] ${styles}`} data-admin-reveal>
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-current/10"><Icon size={22} /></span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
        <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
      </div>
    </article>
  );
}

function Confidence({ value, tone }: { value: number; tone: string }) {
  const color = tone === "red" ? "bg-[#ba1a1a] text-[#ba1a1a]" : tone === "amber" ? "bg-[#f39c12] text-[#f39c12]" : "bg-[#006d37] text-[#006d37]";
  return (
    <div className="flex min-w-[110px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9e8e7]">
        <div data-admin-bar className={`h-full rounded-full ${color.split(" ")[0]}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-black ${color.split(" ")[1]}`}>{value ? `${value}%` : "N/A"}</span>
    </div>
  );
}

function WastePill({ label, tone }: { label: string; tone: string }) {
  const className = tone === "red" ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : tone === "amber" ? "bg-[#f39c12]/10 text-[#735c00]" : "bg-[#006d37]/10 text-[#006d37]";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  const className = tone === "red" ? "text-[#ba1a1a]" : tone === "amber" ? "text-[#f39c12]" : "text-[#006d37]";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-black ${className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
