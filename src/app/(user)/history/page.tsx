import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Coins, Gift, MapPin, Recycle, ShoppingBag, TreePine, XCircle, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { SubmissionStatus } from "@/core/entities/types";
import { buildHistoryViewModel, type HistoryActivity, type HistoryBinRow, type HistoryRedemptionRow, type HistoryRewardRow, type HistorySubmissionRow, type SubmissionHistoryActivity } from "./history-view-model";

type HistoryFilterType = "all" | "earned" | "spent";
type HistoryPeriod = "all" | "month";

const typeTabs: Array<{ label: string; value: HistoryFilterType }> = [
  { label: "Tất cả", value: "all" },
  { label: "Đã nhận", value: "earned" },
  { label: "Đã đổi", value: "spent" },
];

function statusTone(status: SubmissionStatus) {
  if (status === "approved") return { label: "Hoàn thành", Icon: CheckCircle2, className: "bg-[#d8f5df] text-[#007a3d]" };
  if (status === "pending_review") return { label: "Đang xử lý", Icon: Clock3, className: "bg-[#fff7e6] text-[#92400E]" };
  return { label: "Từ chối", Icon: XCircle, className: "bg-[#ffdad6] text-[#93000a]" };
}

function normalizeType(value: string | string[] | undefined): HistoryFilterType {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "earned" || candidate === "spent" ? candidate : "all";
}

function normalizePeriod(value: string | string[] | undefined): HistoryPeriod {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "month" ? "month" : "all";
}

function historyHref({ type, period }: { type: HistoryFilterType; period: HistoryPeriod }) {
  const params = new URLSearchParams();
  if (type !== "all") params.set("type", type);
  if (period !== "all") params.set("period", period);
  const query = params.toString();
  return query ? `/history?${query}` : "/history";
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ type?: string | string[]; period?: string | string[] }> }) {
  const params = await searchParams;
  const selectedType = normalizeType(params.type);
  const selectedPeriod = normalizePeriod(params.period);
  const { user } = await getUserShell();
  const supabase = await getSupabaseServerClient();

  const [{ data: submissionData }, { data: redemptionData }] = await Promise.all([
    supabase.from("submissions").select("id,bin_id,image_url,ai_result,status,points,reason,risk_flags,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reward_redemptions").select("id,reward_item_id,points_spent,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const submissions = (submissionData ?? []) as HistorySubmissionRow[];
  const redemptions = (redemptionData ?? []) as HistoryRedemptionRow[];
  const binIds = [...new Set(submissions.map((submission) => submission.bin_id))];
  const rewardIds = [...new Set(redemptions.map((redemption) => redemption.reward_item_id))];
  let bins: HistoryBinRow[] = [];
  let rewards: HistoryRewardRow[] = [];

  await Promise.all([
    binIds.length > 0
      ? supabase
          .from("bins")
          .select("id,name,location_name")
          .in("id", binIds)
          .then(({ data }) => {
            bins = (data ?? []) as HistoryBinRow[];
          })
      : Promise.resolve(),
    rewardIds.length > 0
      ? supabase
          .from("reward_items")
          .select("id,title")
          .in("id", rewardIds)
          .then(({ data }) => {
            rewards = (data ?? []) as HistoryRewardRow[];
          })
      : Promise.resolve(),
  ]);

  const monthStart = startOfCurrentMonth();
  const periodSubmissions = selectedPeriod === "month" ? submissions.filter((submission) => Date.parse(submission.created_at) >= monthStart) : submissions;
  const periodRedemptions = selectedPeriod === "month" ? redemptions.filter((redemption) => Date.parse(redemption.created_at) >= monthStart) : redemptions;
  const viewModel = buildHistoryViewModel({ submissions: periodSubmissions, bins, redemptions: periodRedemptions, rewards });
  const rows = viewModel.rows.filter((row) => {
    if (selectedType === "earned") return row.kind === "submission";
    if (selectedType === "spent") return row.kind === "redemption";
    return true;
  });
  const { summary } = viewModel;
  const hasActiveFilter = selectedType !== "all" || selectedPeriod !== "all";
  const activeFilterText = selectedPeriod === "month" ? "trong tháng này" : "toàn thời gian";

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Lịch sử</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#093719] md:text-5xl">Lịch sử hoạt động</h1>
          <p className="mt-2 max-w-2xl font-semibold leading-7 text-[#5d6a60]">Theo dõi các lượt phân loại, điểm nhận và giao dịch đổi thưởng gần đây.</p>
        </div>
        <Link
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-black ring-1 ring-[#d9e5da] transition ${
            selectedPeriod === "month" ? "bg-[#007a3d] text-white hover:bg-[#006a35]" : "bg-white text-[#151d18] hover:bg-[#edf6ed]"
          }`}
          href={historyHref({ type: selectedType, period: selectedPeriod === "month" ? "all" : "month" })}
          style={selectedPeriod === "month" ? { color: "#ffffff" } : undefined}
        >
          <CalendarDays size={18} />
          {selectedPeriod === "month" ? "Đang xem tháng này" : "Tháng này"}
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Recycle} label="Lượt phân loại" value={summary.totalSubmissions.toString()} note={`${summary.approvedSubmissions} lượt đã hoàn thành, ${summary.rejectedSubmissions} bị từ chối`} />
        <SummaryCard icon={Coins} label="Điểm đã nhận" value={`+${summary.pointsEarned}`} note={`${summary.pendingSubmissions} lượt đang chờ duyệt (+${summary.pendingPoints})`} />
        <SummaryCard icon={Gift} label="Điểm đã đổi" value={`-${summary.pointsSpent}`} note={`${summary.redemptionCount} giao dịch đổi thưởng`} />
      </section>

      <section className="rounded-[30px] border border-[#d9e5da] bg-white/84 p-4 shadow-[0_12px_40px_rgba(21,29,24,0.05)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto rounded-full bg-[#edf6ed] p-1">
            {typeTabs.map((tab) => {
              const active = selectedType === tab.value;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-5 text-sm font-black transition ${active ? "bg-white text-[#007a3d] shadow-sm" : "text-[#3e4941] hover:bg-white/60"}`}
                  href={historyHref({ type: tab.value, period: selectedPeriod })}
                  key={tab.value}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#5d6a60]">
            <span className="rounded-full bg-[#f3fcf3] px-4 py-2 text-[#3e4941] ring-1 ring-[#d9e5da]">
              {rows.length.toLocaleString("vi-VN")} hoạt động {activeFilterText}
            </span>
            {hasActiveFilter ? (
              <Link className="rounded-full bg-white px-4 py-2 text-[#007a3d] ring-1 ring-[#d9e5da] transition hover:bg-[#edf6ed]" href="/history">
                Xóa lọc
              </Link>
            ) : null}
          </div>
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

        {hasActiveFilter ? (
          <div className="mt-8 flex justify-center">
            <Link className="inline-flex items-center gap-2 rounded-full bg-[#edf6ed] px-5 py-3 text-sm font-black text-[#007a3d] transition hover:bg-[#d8f5df]" href="/history">
              Xem tất cả giao dịch
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : null}
      </section>

      <section className="relative min-h-48 overflow-hidden rounded-[32px] bg-[#007a3d] p-7 text-white shadow-[0_18px_44px_rgba(0,106,61,0.16)]">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8ff8b6]">Tác động của bạn</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Bạn đã giúp giảm {summary.co2Label} CO2 {selectedPeriod === "month" ? "trong tháng này" : "từ các lượt đã duyệt"}.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/78">
            Con số này được ước tính từ {summary.approvedSubmissions.toLocaleString("vi-VN")} lượt phân loại đã hoàn thành, không dùng dữ liệu mẫu.
          </p>
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
