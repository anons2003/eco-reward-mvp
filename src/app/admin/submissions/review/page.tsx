import { Check, ChevronLeft, ChevronRight, Clock3, Filter, History, ImageIcon, MoreVertical, ShieldAlert, TrendingUp, X, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion } from "@/components/shared/dynamic-client-components";

const reviewStats = [
  { label: "Tổng chờ duyệt", value: "24", note: "+12%", Icon: TrendingUp, tone: "red" },
  { label: "Độ tin cậy trung bình", value: "62%", note: "Thấp", Icon: ShieldAlert, tone: "amber" },
  { label: "Thời gian chờ TB", value: "14m", note: "Ổn định", Icon: Clock3, tone: "green" },
  { label: "Cảnh báo gian lận", value: "05", note: "Cần xử lý gấp", Icon: ShieldAlert, tone: "red" },
] as const;

const queueRows = [
  { user: "Nguyễn Văn A", meta: "ID: #USR-9982 - 2 phút trước", confidence: 42, label: "Nhãn: Nhựa PET (88%)", reason: "Ảnh mờ / Không rõ vật thể", tone: "amber" },
  { user: "Trần Thị B", meta: "ID: #USR-4421 - 15 phút trước", confidence: 94, label: "Nhãn: Nhôm (99%)", reason: "GPS không khớp (> 50m)", tone: "red" },
  { user: "Lê Minh H", meta: "ID: #USR-2105 - 1 giờ trước", confidence: 0, label: "Dấu hiệu giả mạo", reason: "Lượt gửi trùng lặp (98% Match)", tone: "red" },
] as const;

export default function AdminReviewQueuePage() {
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
            <span className="rounded-full bg-[#efedec] px-3 py-1 text-xs font-black text-[#3d4a3e]">Tất cả (24)</span>
            <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-black text-[#ba1a1a]">Độ tin cậy &lt; 50%</span>
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
              {queueRows.map((row) => (
                <tr className="group transition hover:bg-[#f5f3f2]/70" key={row.user}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-lg bg-[#0b1f18] text-sm font-black text-white">{row.user.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-black text-[#1b1c1b]">{row.user}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#6c7b6d]">{row.meta}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="group/img relative grid size-20 cursor-zoom-in place-items-center overflow-hidden rounded-xl bg-[#efedec]">
                      <span className={`absolute inset-0 ${row.tone === "amber" ? "bg-[linear-gradient(135deg,#fff7e6,#edf6ed)]" : "bg-[linear-gradient(135deg,#ffdad6,#e8f5ff)]"}`} />
                      <span className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.12)_1px,transparent_1px)] [background-size:14px_14px]" />
                      <span className="relative grid size-10 place-items-center rounded-lg bg-white/86 text-[#006d37] transition-transform duration-500 group-hover/img:scale-110"><ImageIcon size={20} /></span>
                    </div>
                  </td>
                  <td className="px-6 py-5"><AiConfidence value={row.confidence} label={row.label} tone={row.tone} /></td>
                  <td className="px-6 py-5"><ReasonPill label={row.reason} tone={row.tone} /></td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <ActionIcon Icon={Check} tone="green" label="Duyệt" />
                      <ActionIcon Icon={X} tone="red" label="Từ chối" />
                      <ActionIcon Icon={MoreVertical} tone="neutral" label="Thêm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {queueRows.map((row) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={row.user}>
              <div className="flex gap-3">
                <span className={`grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl ${row.tone === "amber" ? "bg-[#fff7e6]" : "bg-[#ffdad6]/70"}`}>
                  <ImageIcon className="text-[#006d37]" size={28} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-black text-[#2c3e50]">{row.user}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{row.meta}</p>
                  <div className="mt-3"><ReasonPill label={row.reason} tone={row.tone} /></div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/25 bg-white/45 px-6 py-5 md:flex-row">
          <p className="text-xs font-semibold text-[#6c7b6d]">Hiển thị 10 trong số 24 hàng chờ</p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-[#bbcbbb]/60 px-4 py-2 text-xs font-black text-[#3d4a3e] transition hover:bg-white" type="button">Xuất báo cáo</button>
            <button className="rounded-lg bg-[#006d37] px-4 py-2 text-xs font-black text-white shadow-[0_10px_24px_rgba(0,109,55,0.18)] transition hover:scale-[1.03]" type="button">Tải thêm</button>
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
