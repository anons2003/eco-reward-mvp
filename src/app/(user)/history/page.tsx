import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Coins, Filter, Gift, ImageIcon, Leaf, MapPin, Recycle, ShoppingBag, TreePine, XCircle, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { SubmissionStatus } from "@/core/entities/types";
import { buildHistoryViewModel, type HistoryActivity, type HistoryBinRow, type HistoryRedemptionRow, type HistorySubmissionRow, type SubmissionHistoryActivity } from "./history-view-model";

function statusTone(status: SubmissionStatus) {
  if (status === "approved") return { label: "Hoàn thành", Icon: CheckCircle2, className: "bg-[#d8f5df] text-[#007a3d]" };
  if (status === "pending_review") return { label: "Đang xử lý", Icon: Clock3, className: "bg-[#fff7e6] text-[#92400E]" };
  return { label: "Từ chối", Icon: XCircle, className: "bg-[#ffdad6] text-[#93000a]" };
}

export default async function HistoryPage() {
  const { user } = await getUserShell();
  const supabase = await getSupabaseServerClient();

  const [{ data: submissionData }, { data: redemptionData }] = await Promise.all([
    supabase.from("submissions").select("id,bin_id,image_url,ai_result,status,points,reason,risk_flags,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reward_redemptions").select("id,reward_item_id,points_spent,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const submissions = (submissionData ?? []) as HistorySubmissionRow[];
  const redemptions = (redemptionData ?? []) as HistoryRedemptionRow[];
  const binIds = [...new Set(submissions.map((submission) => submission.bin_id))];
  let bins: HistoryBinRow[] = [];

  if (binIds.length > 0) {
    const { data: binData } = await supabase.from("bins").select("id,name,location_name").in("id", binIds);
    bins = (binData ?? []) as HistoryBinRow[];
  }

  const viewModel = buildHistoryViewModel({ submissions, bins, redemptions });
  const { rows, summary } = viewModel;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Lịch sử</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#093719] md:text-5xl">Lịch sử hoạt động</h1>
          <p className="mt-2 max-w-2xl font-semibold leading-7 text-[#5d6a60]">Theo dõi các lượt phân loại, điểm nhận và giao dịch đổi thưởng gần đây.</p>
        </div>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 font-black text-[#151d18] ring-1 ring-[#d9e5da] transition hover:bg-[#edf6ed]" type="button">
          <CalendarDays size={18} />
          Tháng này
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Recycle} label="Lượt phân loại" value={summary.totalSubmissions.toString()} note={`${summary.approvedSubmissions} lượt đã hoàn thành, ${summary.rejectedSubmissions} bị từ chối`} />
        <SummaryCard icon={Coins} label="Điểm đã nhận" value={`+${summary.pointsEarned}`} note={`${summary.pendingSubmissions} lượt đang chờ duyệt (+${summary.pendingPoints})`} />
        <SummaryCard icon={Gift} label="Điểm đã đổi" value={`-${summary.pointsSpent}`} note={`${summary.redemptionCount} giao dịch đổi thưởng`} />
      </section>

      <section className="rounded-[30px] border border-[#d9e5da] bg-white/84 p-4 shadow-[0_12px_40px_rgba(21,29,24,0.05)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto rounded-full bg-[#edf6ed] p-1">
            {["Tất cả", "Đã nhận", "Đã đổi"].map((tab, index) => (
              <button className={`min-h-10 shrink-0 rounded-full px-5 text-sm font-black transition ${index === 0 ? "bg-white text-[#007a3d] shadow-sm" : "text-[#3e4941] hover:bg-white/60"}`} key={tab} type="button">
                {tab}
              </button>
            ))}
          </div>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#151d18] ring-1 ring-[#d9e5da]" type="button">
            <Filter size={16} />
            Bộ lọc
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {rows.map((row) => (row.kind === "submission" ? <SubmissionActivity key={row.id} activity={row} /> : <RedemptionActivity key={row.id} activity={row} />))}
          {rows.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d9e5da] bg-[#f3fcf3] p-8 text-center">
              <p className="text-lg font-black text-[#151d18]">Chưa có hoạt động nào.</p>
              <p className="mt-2 text-sm font-semibold text-[#5d6a60]">Quét QR và gửi ảnh đầu tiên để bắt đầu lịch sử điểm xanh.</p>
              <Link className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white" href="/scan">
                Quét rác
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#edf6ed] px-5 py-3 text-sm font-black text-[#007a3d] transition hover:bg-[#d8f5df]" type="button">
            Xem tất cả giao dịch
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="relative min-h-48 overflow-hidden rounded-[32px] bg-[#007a3d] p-7 text-white shadow-[0_18px_44px_rgba(0,106,61,0.16)]">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8ff8b6]">Tác động của bạn</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Bạn đã giúp giảm 45kg CO2 trong tháng này.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/78">Mỗi lượt phân loại đúng giúp hệ thống ghi nhận tác động môi trường và cộng tiến độ xanh cho tài khoản.</p>
        </div>
        <TreePine className="absolute -bottom-10 right-8 text-white/18" size={180} />
        <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/10 blur-3xl" />
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return (
    <div className="rounded-[28px] border border-[#d9e5da] bg-white/84 p-5 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
        <Icon size={22} />
      </span>
      <p className="mt-4 text-sm font-bold text-[#5d6a60]">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#151d18]">{value}</p>
      <p className="mt-2 text-xs font-bold text-[#6e7a70]">{note}</p>
    </div>
  );
}

function SubmissionActivity({ activity }: { activity: SubmissionHistoryActivity }) {
  const tone = statusTone(activity.status);
  const Icon = tone.Icon;

  return (
    <Link className="group flex items-center gap-4 rounded-[24px] border border-[#d9e5da] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#007a3d] hover:shadow-[0_10px_24px_rgba(0,106,61,0.10)]" href={activity.href}>
      <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#edf6ed]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={`Ảnh ${activity.title}`} className="absolute inset-0 size-full object-cover" src={activity.imageUrl} />
        <span className={`relative grid size-9 place-items-center rounded-full bg-white/90 ${tone.className}`}>
          <Icon size={19} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <strong className="truncate text-base font-black text-[#151d18]">{activity.title}</strong>
          <span className={`shrink-0 text-base font-black ${activity.status === "rejected" ? "text-[#93000a]" : "text-[#007a3d]"}`}>{activity.pointsLabel}</span>
        </span>
        <span className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 text-sm font-semibold text-[#5d6a60]">
            <MapPin size={15} />
            <span className="truncate">{activity.binName} - {activity.binLocation}</span>
          </span>
          <StatusBadge status={activity.status} />
        </span>
        <span className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#6e7a70]">{new Date(activity.createdAt).toLocaleString("vi-VN")}</span>
          <span className="truncate text-xs font-bold text-[#6e7a70]">{activity.reason}</span>
        </span>
      </span>
    </Link>
  );
}

function RedemptionActivity({ activity }: { activity: Extract<HistoryActivity, { kind: "redemption" }> }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-[#d9e5da] bg-white p-4">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#cbe6ff] text-[#006496]">
        <ShoppingBag size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <strong className="truncate text-base font-black text-[#151d18]">{activity.title}</strong>
          <span className="shrink-0 text-base font-black text-[#ba1a1a]">{activity.pointsLabel}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#5d6a60]">{new Date(activity.createdAt).toLocaleString("vi-VN")}</span>
          <span className="rounded-full bg-[#cbe6ff] px-3 py-1 text-xs font-black text-[#00517b]">Đã đổi</span>
        </div>
      </div>
    </div>
  );
}
