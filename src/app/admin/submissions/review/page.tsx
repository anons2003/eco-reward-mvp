import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Clock3, Eye, Filter, History, ImageIcon, MoreVertical, ShieldAlert, TrendingUp, X, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type SubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "user_id" | "image_url" | "ai_result" | "points" | "reason" | "risk_flags" | "created_at">;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function aiResult(row: SubmissionRow) {
  return row.ai_result && typeof row.ai_result === "object" && !Array.isArray(row.ai_result) ? row.ai_result : {};
}

function confidence(row: SubmissionRow) {
  const result = aiResult(row);
  return typeof result.confidence === "number" ? Math.round(result.confidence * 100) : 0;
}

function wasteLabel(row: SubmissionRow) {
  const result = aiResult(row);
  const wasteType = typeof result.wasteType === "string" ? result.wasteType : typeof result.mode === "string" ? "manual_review" : "unknown";
  const labels: Record<string, string> = {
    manual_review: "Duyệt thủ công",
    plastic_bottle: "Chai nhựa",
    metal_can: "Lon kim loại",
    paper: "Giấy",
    cardboard: "Bìa carton",
    glass_bottle: "Chai thủy tinh",
    organic: "Hữu cơ",
    hazardous: "Nguy hại",
    unknown: "Chưa xác định",
  };
  return labels[wasteType] ?? wasteType.replaceAll("_", " ");
}

function reasonLabel(row: SubmissionRow) {
  if (row.risk_flags.length > 0) return row.risk_flags.join(", ");
  return row.reason || "Chờ admin duyệt thủ công.";
}

export default async function AdminReviewQueuePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id,user_id,image_url,ai_result,points,reason,risk_flags,created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const queueRows = (data ?? []) as SubmissionRow[];
  const averageConfidence = queueRows.length ? Math.round(queueRows.reduce((sum, row) => sum + confidence(row), 0) / queueRows.length) : 0;
  const flagged = queueRows.filter((row) => row.risk_flags.length > 0).length;
  const oldestLabel = queueRows[0] ? formatDate(queueRows[0].created_at) : "Không có";
  const reviewStats = [
    { label: "Tổng chờ duyệt", value: queueRows.length.toLocaleString("vi-VN"), note: "DB thật", Icon: TrendingUp, tone: queueRows.length ? "amber" : "green" },
    { label: "Độ tin cậy trung bình", value: averageConfidence ? `${averageConfidence}%` : "N/A", note: averageConfidence && averageConfidence < 70 ? "Thấp" : "Ổn định", Icon: ShieldAlert, tone: averageConfidence && averageConfidence < 70 ? "amber" : "green" },
    { label: "Lượt cũ nhất", value: queueRows.length ? "Có" : "0", note: oldestLabel, Icon: Clock3, tone: queueRows.length ? "amber" : "green" },
    { label: "Cảnh báo gian lận", value: flagged.toLocaleString("vi-VN"), note: flagged ? "Cần xử lý" : "Không có", Icon: ShieldAlert, tone: flagged ? "red" : "green" },
  ] as const;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#6c7b6d]">
            <span className="size-2 rounded-full bg-[#f39c12]" />
            Tự động cập nhật mỗi 30s
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Hàng chờ kiểm duyệt</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Hệ thống đang xử lý các lượt gửi có độ tin cậy thấp hoặc có dấu hiệu bất thường. Admin cần xác minh thủ công để duy trì tính minh bạch của hệ thống.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#bbcbbb]/60 bg-white px-4 text-sm font-black text-[#3d4a3e] transition hover:border-[#006d37]" type="button">
            <Filter size={17} />
            Lọc dữ liệu
          </button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2ecc71] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(46,204,113,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
            <History size={17} />
            Lịch sử duyệt
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {reviewStats.map((stat) => (
          <ReviewStat key={stat.label} {...stat} />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white/88 shadow-[0_18px_48px_rgba(45,156,219,0.10)] backdrop-blur-md" data-admin-reveal>
        <div className="flex flex-col gap-4 border-b border-[#bbcbbb]/25 bg-white/65 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black tracking-[-0.03em] text-[#2c3e50]">Danh sách chờ duyệt</h2>
            <span className="rounded-full bg-[#efedec] px-3 py-1 text-xs font-black text-[#3d4a3e]">Tất cả ({queueRows.length})</span>
            <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-black text-[#ba1a1a]">Cờ rủi ro ({flagged})</span>
          </div>
          <div className="flex items-center gap-2 text-[#6c7b6d]">
            <button className="grid size-9 place-items-center rounded-lg transition hover:bg-[#efedec]" type="button"><ChevronLeft size={17} /></button>
            <span className="text-xs font-black">Trang 1 / 3</span>
            <button className="grid size-9 place-items-center rounded-lg transition hover:bg-[#efedec]" type="button"><ChevronRight size={17} /></button>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="bg-[#f5f3f2]/70">
              <tr>
                {["Người dùng / Thời gian", "Hình ảnh minh chứng", "Phân tích AI", "Lý do vào hàng chờ", "Thao tác nhanh"].map((heading) => (
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e] ${heading === "Thao tác nhanh" ? "text-right" : ""}`} key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {queueRows.map((row) => {
                const rowConfidence = confidence(row);
                const tone = row.risk_flags.length > 0 ? "red" : rowConfidence && rowConfidence < 60 ? "amber" : "green";
                return (
                <tr className="group transition hover:bg-[#f5f3f2]/70" key={row.id}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-lg bg-[#0b1f18] text-sm font-black text-white">{row.id.slice(0, 1).toUpperCase()}</span>
                      <span>
                        <span className="block font-mono text-sm font-black text-[#1b1c1b]">{row.id.slice(0, 8)}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#6c7b6d]">User {row.user_id.slice(0, 8)} - {formatDate(row.created_at)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="group/img relative grid size-20 cursor-zoom-in place-items-center overflow-hidden rounded-xl bg-[#efedec]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={`Ảnh lượt gửi ${row.id}`} className="absolute inset-0 size-full object-cover" src={row.image_url} />
                      <span className="relative grid size-10 place-items-center rounded-lg bg-white/86 text-[#006d37] opacity-0 transition group-hover/img:opacity-100"><ImageIcon size={20} /></span>
                    </div>
                  </td>
                  <td className="px-6 py-5"><AiConfidence value={rowConfidence} label={wasteLabel(row)} tone={tone} /></td>
                  <td className="px-6 py-5"><ReasonPill label={reasonLabel(row)} tone={tone} /></td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link className="grid size-10 place-items-center rounded-full border border-[#006d37] text-[#006d37] transition hover:bg-[#006d37] hover:text-white" href={`/admin/submissions/${row.id}`} aria-label="Mở chi tiết duyệt" title="Mở chi tiết duyệt">
                        <Eye size={17} />
                      </Link>
                      <ActionIcon Icon={Check} tone="green" label="Duyệt trong chi tiết" />
                      <ActionIcon Icon={X} tone="red" label="Từ chối trong chi tiết" />
                      <ActionIcon Icon={MoreVertical} tone="neutral" label="Thêm" />
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {queueRows.map((row) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={row.id}>
              <div className="flex gap-3">
                <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#edf6ed]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={`Ảnh lượt gửi ${row.id}`} className="absolute inset-0 size-full object-cover" src={row.image_url} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-mono text-sm font-black text-[#2c3e50]">{row.id.slice(0, 8)}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">User {row.user_id.slice(0, 8)} - {formatDate(row.created_at)}</p>
                  <div className="mt-3"><ReasonPill label={reasonLabel(row)} tone={row.risk_flags.length ? "red" : "amber"} /></div>
                  <Link className="mt-3 inline-flex text-sm font-black text-[#006d37]" href={`/admin/submissions/${row.id}`}>Mở chi tiết</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {error ? <p className="p-8 text-center text-sm font-black text-[#ba1a1a]">Không thể tải hàng chờ từ DB.</p> : null}
        {!error && queueRows.length === 0 ? <p className="p-8 text-center text-sm font-black text-[#6c7b6d]">Không có lượt gửi nào đang chờ duyệt.</p> : null}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/25 bg-white/45 px-6 py-5 md:flex-row">
          <p className="text-xs font-semibold text-[#6c7b6d]">Hiển thị {queueRows.length.toLocaleString("vi-VN")} hàng chờ từ DB</p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#bbcbbb]/60 px-4 py-2 text-xs font-black text-[#3d4a3e] transition hover:bg-white" type="button">Xuất báo cáo</button>
            <Link className="rounded-lg bg-[#006d37] px-4 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(0,109,55,0.18)] transition hover:scale-[1.03]" href="/admin/submissions?status=pending_review">Xem tất cả</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewStat({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "green" | "amber" | "red" }) {
  const color = tone === "green" ? "text-[#006d37]" : tone === "amber" ? "text-[#f39c12]" : "text-[#ba1a1a]";
  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
      <div className="mb-4 flex items-center justify-between">
        <Icon className={color} size={22} />
        <span className={`text-xs font-black ${color}`}>{note}</span>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
      <h2 className={`mt-1 text-3xl font-black tracking-[-0.04em] ${color}`}>{value}</h2>
    </article>
  );
}

function AiConfidence({ value, label, tone }: { value: number; label: string; tone: string }) {
  const color = tone === "amber" ? "bg-[#f39c12] text-[#f39c12]" : "bg-[#ba1a1a] text-[#ba1a1a]";
  return (
    <div className="min-w-[150px]">
      <div className={`mb-2 text-xs font-black ${color.split(" ")[1]}`}>Độ tin cậy: {value || "N/A"}{value ? "%" : ""}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e9e8e7]">
        <div data-admin-bar className={`h-full rounded-full ${color.split(" ")[0]}`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-[#6c7b6d]">{label}</p>
    </div>
  );
}

function ReasonPill({ label, tone }: { label: string; tone: string }) {
  const className = tone === "amber" ? "bg-[#f39c12]/12 text-[#735c00]" : "bg-[#ffdad6] text-[#ba1a1a]";
  return <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-black ${className}`}>{label}</span>;
}

function ActionIcon({ Icon, tone, label }: { Icon: LucideIcon; tone: "green" | "red" | "neutral"; label: string }) {
  const className = {
    green: "border-[#006d37] text-[#006d37] hover:bg-[#006d37] hover:text-white",
    red: "border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white",
    neutral: "border-[#bbcbbb] bg-[#efedec] text-[#3d4a3e] hover:bg-[#e4e2e1]",
  }[tone];

  return (
    <button className={`grid size-10 place-items-center rounded-full border transition ${className}`} type="button" aria-label={label} title={label}>
      <Icon size={17} />
    </button>
  );
}
