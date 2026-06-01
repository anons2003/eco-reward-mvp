import Link from "next/link";
import { AlertTriangle, CalendarDays, Clock3, Coins, Download, FileText, Recycle, ShieldAlert, Trash2, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion } from "@/components/shared/dynamic-client-components";
import { seaTechService } from "@/application/services/seatech-service";

const weeklyCollection = [
  { day: "Mon", mobileDay: "T2", recyclable: 60, organic: 40 },
  { day: "Tue", mobileDay: "T3", recyclable: 76, organic: 52 },
  { day: "Wed", mobileDay: "T4", recyclable: 44, organic: 34 },
  { day: "Thu", mobileDay: "T5", recyclable: 90, organic: 70 },
  { day: "Fri", mobileDay: "T6", recyclable: 80, organic: 46 },
  { day: "Sat", mobileDay: "T7", recyclable: 32, organic: 22 },
  { day: "Sun", mobileDay: "CN", recyclable: 26, organic: 16 },
];

const seededReviewUsers = ["Nguyễn An", "Trần Minh", "Phạm Hà"];
const wasteDistribution = [
  ["Nhựa", "Nhựa", 55, "#006d37"],
  ["Giấy", "Giấy", 25, "#006496"],
  ["Kim loại", "Kim loại", 20, "#f39c12"],
] as const;

export default function AdminDashboardPage() {
  const stats = seaTechService.getDashboardStats();
  const latest = seaTechService.listSubmissions().slice(0, 5);
  const pending = seaTechService.listSubmissions("pending_review").slice(0, 3);
  const reviewRows = (pending.length ? pending : latest).slice(0, 3);
  const bins = seaTechService.listBins();
  const approvalRate = Math.round((stats.approved / Math.max(stats.totalSubmissions, 1)) * 100);
  const wasteKg = Math.max(stats.totalSubmissions * 1.8, 0);
  const wasteLabel = wasteKg >= 1000 ? `${(wasteKg / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}t` : `${wasteKg.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}kg`;

  const kpis: Array<{
    label: string;
    mobileLabel: string;
    value: string;
    change: string;
    Icon: LucideIcon;
    tone: "green" | "blue" | "amber" | "forest";
  }> = [
    { label: "Người dùng", mobileLabel: "NGƯỜI DÙNG", value: "12,480", change: "+12%", Icon: FileText, tone: "green" },
    { label: "Lượt gửi", mobileLabel: "LƯỢT GỬI", value: stats.totalSubmissions.toLocaleString("vi-VN"), change: "+8%", Icon: Clock3, tone: "blue" },
    { label: "Điểm đã cấp", mobileLabel: "ĐIỂM ĐÃ CẤP", value: stats.pointsIssued.toLocaleString("vi-VN"), change: "+15%", Icon: Coins, tone: "amber" },
    { label: "Rác chuyển hướng", mobileLabel: "RÁC CHUYỂN HƯỚNG", value: wasteLabel, change: `+${Math.max(approvalRate, 1)}%`, Icon: Recycle, tone: "forest" },
  ];

  const alerts = [
    {
      title: "Thùng rác sắp đầy",
      mobileTitle: "Thùng rác sắp đầy",
      body: `${bins.find((bin) => bin.active)?.name ?? "SeaBin #402"} đang ở mức 92% dung lượng.`,
      mobileBody: "Khu vực: Quận 1, TP.HCM",
      label: "Khẩn cấp",
      Icon: AlertTriangle,
      className: "border-[#ba1a1a]/12 bg-[#ffdad6]/28 text-[#ba1a1a]",
      borderClass: "border-l-[#ba1a1a]",
    },
    {
      title: "Rủi ro gian lận cao",
      mobileTitle: "Rủi ro gian lận cao",
      body: `${stats.rejected} lượt gửi bị từ chối cần rà soát ảnh trùng lặp.`,
      mobileBody: "Mã người dùng: #88219 (lặp lại lượt gửi)",
      label: "Điều tra",
      Icon: ShieldAlert,
      className: "border-[#f39c12]/20 bg-[#fff7e6] text-[#bd7700]",
      borderClass: "border-l-[#f39c12]",
    },
    {
      title: "Gateway ngoại tuyến",
      mobileTitle: "Gateway Ngoại tuyến",
      body: `${stats.pending} lượt gửi đang chờ quản trị viên xác nhận.`,
      mobileBody: "Hub: SeaTech Gateway Q1",
      label: "Kết nối",
      Icon: Trash2,
      className: "border-[#006496]/14 bg-[#e8f5ff] text-[#006496]",
      borderClass: "border-l-[#6e7a70]",
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="hidden items-end justify-between lg:flex" data-admin-reveal>
        <div>
          <h1 className="text-xl font-black tracking-[-0.02em] text-[#2c3e50]">Tổng quan vận hành SeaTech</h1>
          <p className="mt-1 text-sm font-semibold text-[#6e7a70]">Chỉ số hiệu suất theo thời gian thực của hệ thống SeaTech.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d9e5da] bg-white px-4 text-sm font-black text-[#3e4941] transition hover:bg-[#efedec]" type="button">
            <CalendarDays size={16} />
            30 ngày gần nhất
          </button>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#006d37] px-4 text-sm font-black text-white shadow-[0_8px_18px_rgba(0,106,61,0.18)] transition hover:bg-[#005d34]" type="button">
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </section>

      <section className="lg:hidden" data-admin-reveal>
        <h1 className="text-[31px] font-black leading-10 tracking-[-0.02em] text-[#191c1b]">Chào buổi sáng, Admin</h1>
        <p className="mt-1 text-base font-semibold leading-6 text-[#3e4941]">Dưới đây là diễn biến hệ thống trong 24h qua.</p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#d9e5da] bg-white p-4 shadow-[0_8px_24px_rgba(21,29,24,0.035)] lg:col-span-8 lg:p-6" data-admin-reveal>
          <div className="mb-6 flex items-center justify-between lg:mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.06em] text-[#1b1c1b] lg:text-base lg:normal-case lg:tracking-[-0.01em]">Xu hướng thu gom theo tuần</h2>
            <div className="hidden gap-4 text-xs font-bold text-[#6e7a70] lg:flex">
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#006d37]" />
                Tái chế
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#2d9cdb]" />
                Hữu cơ
              </span>
            </div>
          </div>

          <div className="flex h-48 items-end justify-between gap-2 px-2 lg:h-64">
            {weeklyCollection.map((item) => (
              <div className="flex h-full min-w-0 flex-1 flex-col items-center gap-2" key={item.day}>
                <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-1">
                  <span data-admin-bar className="block w-1/2 max-w-4 rounded-t-lg bg-[#006d37] lg:w-4" style={{ height: `${item.recyclable}%` }} />
                  <span data-admin-bar className="block w-1/2 max-w-4 rounded-t-lg bg-[#2d9cdb] lg:w-4" style={{ height: `${item.organic}%` }} />
                </div>
                <span className="text-[10px] font-black text-[#6e7a70] lg:text-xs">{item.mobileDay}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-4 text-xs font-bold text-[#6e7a70] lg:hidden">
            <span className="inline-flex items-center gap-1">
              <span className="size-3 rounded-full bg-[#006d37]" />
              Tái chế
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-3 rounded-full bg-[#2d9cdb]" />
              Hữu cơ
            </span>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#d9e5da] bg-white p-4 shadow-[0_8px_24px_rgba(21,29,24,0.035)] lg:col-span-4 lg:p-6" data-admin-reveal>
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.06em] text-[#1b1c1b] lg:mb-6 lg:text-base lg:normal-case lg:tracking-[-0.01em]">Cảnh báo hệ thống gần đây</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div className={`rounded-2xl border p-4 lg:border ${alert.className} border-l-4 ${alert.borderClass}`} key={alert.title}>
                <div className="flex items-start gap-3">
                  <alert.Icon className="mt-0.5 hidden shrink-0 lg:block" size={18} />
                  <div className="min-w-0">
                    <p className="font-black text-[#1b1c1b] lg:text-sm">{alert.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#5f6472] lg:text-sm">{alert.body}</p>
                    <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.12em]">{alert.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link className="mt-5 hidden w-full items-center justify-center rounded-xl py-2 text-sm font-black text-[#006d37] transition hover:bg-[#efedec] lg:inline-flex" href="/admin/bins">
            Xem tất cả cảnh báo
          </Link>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-2xl border border-[#d9e5da] bg-white shadow-[0_8px_24px_rgba(21,29,24,0.035)] lg:col-span-8" data-admin-reveal>
          <div className="flex items-center justify-between border-b border-[#d9e5da] p-4 lg:p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.06em] text-[#1b1c1b] lg:text-base lg:normal-case lg:tracking-[-0.01em]">Lượt gửi chờ kiểm duyệt</h2>
            <span className="rounded bg-[#fff7e6] px-2 py-1 text-[10px] font-black uppercase text-[#bd7700]">{stats.pending} mới</span>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-[minmax(0,1fr)_140px_170px_90px] gap-4 bg-[#efedec] px-6 py-3 text-xs font-black text-[#6e7a70]">
              <span>Người dùng</span>
              <span>Loại rác</span>
              <span>Độ tin cậy</span>
              <span className="text-right">Thao tác</span>
            </div>
            {reviewRows.map((submission, index) => (
              <Link className="grid grid-cols-[minmax(0,1fr)_140px_170px_90px] items-center gap-4 border-t border-[#d9e5da] px-6 py-4 transition hover:bg-[#f5f3f2]" href={`/admin/submissions/${submission.id}`} key={submission.id}>
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf6ed] text-xs font-black text-[#006d37]">{seededReviewUsers[index]?.slice(0, 1) ?? "A"}</span>
                  <span className="truncate text-sm font-bold text-[#1b1c1b]">{seededReviewUsers[index] ?? submission.userId}</span>
                </span>
                <span className="w-fit rounded-full bg-[#efedec] px-3 py-1 text-xs font-bold text-[#3e4941]">{submission.aiResult.wasteType.replaceAll("_", " ")}</span>
                <ConfidenceBar value={Math.round(submission.aiResult.confidence * 100)} />
                <span className="text-right text-sm font-black text-[#006d37]">Kiểm duyệt</span>
              </Link>
            ))}
          </div>

          <div className="space-y-2 p-3 lg:hidden">
            {reviewRows.map((submission, index) => (
              <Link className="flex items-center gap-3 rounded-2xl border border-[#d9e5da] bg-white p-4 transition active:scale-[0.99]" href={`/admin/submissions/${submission.id}`} key={submission.id}>
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#edf6ed] text-sm font-black text-[#006d37]">{seededReviewUsers[index]?.slice(0, 1) ?? "A"}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-black text-[#1b1c1b]">{seededReviewUsers[index] ?? submission.userId}</span>
                    <span className="text-[10px] font-bold text-[#6e7a70]">{submission.aiResult.wasteType.replaceAll("_", " ")}</span>
                  </span>
                  <ConfidenceBar value={Math.round(submission.aiResult.confidence * 100)} mobile />
                </span>
                <span className="rounded-full bg-[#006d37] px-3 py-1.5 text-xs font-black text-white">Duyệt</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-[#d9e5da] bg-[#f5f3f2] p-4 text-center">
            <Link className="text-sm font-black text-[#006d37]" href="/admin/submissions?status=pending_review">
              Xem tất cả lượt chờ duyệt
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#d9e5da] bg-white p-6 shadow-[0_8px_24px_rgba(21,29,24,0.035)] lg:col-span-4" data-admin-reveal>
          <h2 className="mb-6 text-sm font-black uppercase tracking-[0.06em] text-[#1b1c1b] lg:text-base lg:normal-case lg:tracking-[-0.01em]">Phân bổ loại rác</h2>
          <div className="flex items-center justify-around gap-5 lg:block">
            <div className="relative mx-auto size-36 lg:size-48">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#006d37" strokeDasharray="55 45" strokeWidth="4" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#006496" strokeDasharray="25 75" strokeDashoffset="-55" strokeWidth="4" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f39c12" strokeDasharray="20 80" strokeDashoffset="-80" strokeWidth="4" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-[#1b1c1b] lg:text-xl">{wasteLabel}</span>
                <span className="text-xs font-semibold text-[#6e7a70]">Tổng</span>
              </div>
            </div>
            <div className="w-full max-w-[180px] space-y-3 lg:mt-8 lg:max-w-none">
              {wasteDistribution.map(([desktopLabel, mobileLabel, value, color]) => (
                <div className="flex items-center justify-between gap-4" key={desktopLabel}>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-[#3e4941] lg:text-sm">
                    <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="hidden lg:inline">{desktopLabel}</span>
                    <span className="lg:hidden">{mobileLabel}</span>
                  </span>
                  <span className="text-xs font-black text-[#1b1c1b] lg:text-sm">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  mobileLabel,
  value,
  change,
  Icon,
  tone,
}: {
  label: string;
  mobileLabel: string;
  value: string;
  change: string;
  Icon: LucideIcon;
  tone: "green" | "blue" | "amber" | "forest";
}) {
  const toneClass = {
    green: "bg-[#d8f5df] text-[#006d37]",
    blue: "bg-[#e8f5ff] text-[#2d9cdb]",
    amber: "bg-[#fff7e6] text-[#f39c12]",
    forest: "bg-[#e7f8ef] text-[#1e8449]",
  }[tone];

  return (
    <article className="min-w-0 rounded-2xl border border-[#d9e5da] bg-white p-4 shadow-[0_8px_24px_rgba(21,29,24,0.035)] transition hover:-translate-y-0.5 hover:border-[#006d37]" data-admin-reveal>
      <div className="mb-4 flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-xl lg:size-12 ${toneClass}`}>
          <Icon size={18} />
        </span>
        <span className="text-xs font-black text-[#2ecc71]">{change}</span>
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6e7a70] lg:hidden">{mobileLabel}</p>
      <p className="hidden text-xs font-black uppercase tracking-[0.08em] text-[#6e7a70] lg:block">{label}</p>
      <p className="mt-1 truncate text-[31px] font-black leading-10 tracking-[-0.04em] text-[#1b1c1b] lg:text-2xl lg:leading-8">{value}</p>
    </article>
  );
}

function ConfidenceBar({ value, mobile = false }: { value: number; mobile?: boolean }) {
  const color = value < 50 ? "bg-[#ba1a1a]" : value < 80 ? "bg-[#f39c12]" : "bg-[#2ecc71]";
  const textColor = value < 50 ? "text-[#ba1a1a]" : value < 80 ? "text-[#bd7700]" : "text-[#1e8449]";

  if (mobile) {
    return (
      <span className="mt-2 block">
        <span className="block h-1.5 overflow-hidden rounded-full bg-[#efedec]">
          <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
        </span>
        <span className={`mt-1 block text-[10px] font-black ${textColor}`}>Độ tin cậy: {value}%</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-16 overflow-hidden rounded-full bg-[#efedec]">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </span>
      <span className={`text-xs font-black ${textColor}`}>{value}%</span>
    </span>
  );
}
