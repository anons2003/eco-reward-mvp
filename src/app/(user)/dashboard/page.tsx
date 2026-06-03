import Link from "next/link";
import {
  ArrowRight,
  Award,
  Coins,
  Gift,
  History as HistoryIcon,
  Leaf,
  MapPin,
  QrCode,
  Recycle,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { buildDashboardMetrics, buildPreferredRewards, dashboardWasteLabel, type PreferredDashboardReward } from "./dashboard-metrics";
import type { SubmissionStatus } from "@/core/entities/types";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { Database } from "@/infrastructure/supabase/database.types";

type DashboardSubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "bin_id" | "ai_result" | "status" | "points" | "created_at">;
type DashboardBinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "location_name">;
type DashboardProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "points">;
type DashboardRewardRow = Pick<Database["public"]["Tables"]["reward_items"]["Row"], "id" | "title" | "description" | "points_required" | "stock" | "image_url">;

export default async function DashboardPage() {
  const { displayName: fullName, points, profile, user } = await getUserShell();
  const supabase = await getSupabaseServerClient();
  const [{ data: submissionData }, { data: rewardData }, { data: profileData }] = await Promise.all([
    supabase.from("submissions").select("id,bin_id,ai_result,status,points,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reward_items").select("id,title,description,points_required,stock,image_url").eq("active", true).order("points_required", { ascending: true }),
    supabase.from("profiles").select("id,points").eq("role", "user").neq("status", "deleted"),
  ]);
  const submissionRows: DashboardSubmissionRow[] = submissionData ?? [];
  const rewards: DashboardRewardRow[] = rewardData ?? [];
  const preferredRewards = buildPreferredRewards({ points, rewards });
  const featuredReward = preferredRewards[0] ?? null;
  const profiles: DashboardProfileRow[] = profileData ?? [];
  const binIds = [...new Set(submissionRows.map((row) => row.bin_id))];
  const { data: binData } = binIds.length > 0 ? await supabase.from("bins").select("id,location_name").in("id", binIds) : { data: [] };
  const bins: DashboardBinRow[] = binData ?? [];
  const submissions = submissionRows.slice(0, 5).map((row) => ({
    id: row.id,
    label: dashboardWasteLabel(row.ai_result, row.status),
    status: row.status as SubmissionStatus,
    points: row.points,
    createdAt: row.created_at,
  }));
  const dashboardMetrics = buildDashboardMetrics({
    currentUserId: user.id,
    currentPoints: points,
    submissions: submissionRows,
    bins,
    profiles,
  });

  const firstName = fullName.split(" ")[0] || "Bạn";
  const trustScore = profile?.trust_score ?? 80;
  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative overflow-hidden rounded-[28px] bg-[#008f4a] p-6 text-white shadow-[0_18px_46px_rgba(0,122,61,0.22)] md:p-8">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">Chào buổi sáng, {firstName}!</h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/88">
              Hôm nay là một ngày tuyệt vời để bảo vệ môi trường. Hãy cùng nhau giảm thiểu rác thải nhựa nhé!
            </p>
            <Link
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#007a3d] shadow-[0_12px_30px_rgba(0,57,31,0.16)] transition hover:bg-[#f3fcf3]"
              href="/scan"
              style={{ color: "#007a3d" }}
            >
              <QrCode size={18} />
              Quét mã QR ngay
            </Link>
          </div>
          <Leaf className="absolute -bottom-8 right-6 text-white/10" size={190} strokeWidth={1.2} />
          <div className="absolute bottom-8 right-12 hidden size-32 rounded-[36px] border border-white/12 bg-white/8 md:block" />
        </div>

        <FeaturedRewardCard className="hidden xl:block" reward={featuredReward} />
      </section>

      <nav aria-label="Lối tắt dashboard" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {[
          { href: "#recent", label: "Gần đây", Icon: HistoryIcon },
          { href: "#impact", label: "Tác động", Icon: Award },
          { href: "#rewards-fit", label: "Ưu đãi", Icon: Gift },
        ].map(({ href, label, Icon }) => (
          <a className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#d9e5da] bg-white/88 px-4 text-sm font-black text-[#071b12] shadow-[0_8px_22px_rgba(21,29,24,0.05)]" href={href} key={href}>
            <Icon className="text-[#007a3d]" size={16} />
            {label}
          </a>
        ))}
      </nav>

      <section>
        <h2 className="mb-3 px-1 text-xl font-black tracking-[-0.04em] text-[#151d18] md:hidden">Tác động của bạn</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricTile label="Ví điểm xanh" value={points.toLocaleString("vi-VN")} Icon={Coins} tone="green" />
          <MetricTile label="CO2 ước tính" value={dashboardMetrics.co2Label} Icon={Leaf} tone="blue" />
          <MetricTile label="Rác đã phân loại" value={dashboardMetrics.approvedCount.toLocaleString("vi-VN")} Icon={Recycle} tone="mint" />
          <MetricTile label="Xếp hạng hiện tại" value={dashboardMetrics.percentileLabel} Icon={Trophy} tone="gold" />
        </div>
      </section>

      <FeaturedRewardCard className="xl:hidden" reward={featuredReward} />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-2 rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)] lg:order-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-[-0.03em] text-[#151d18]">Xu hướng tích cực</h2>
              <p className="mt-1 text-sm font-semibold text-[#6e7a70]">Số lượng rác tái chế trong tuần này</p>
            </div>
            <button className="rounded-full bg-[#edf6ed] px-4 py-2 text-xs font-black text-[#3e4941]" type="button">
              Tuần này
            </button>
          </div>
          <div className="mt-8 flex h-56 items-end gap-3">
            {dashboardMetrics.weeklyTrend.map((item) => (
              <div className="flex flex-1 flex-col items-center gap-3" key={item.label}>
                <div className="flex h-44 w-full items-end rounded-full bg-[#edf6ed]">
                  <div className="w-full rounded-full bg-[#007a3d]" style={{ height: `${item.height}%` }} />
                </div>
                <span className="text-xs font-black text-[#6e7a70]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)] lg:order-2" id="recent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#151d18]">Gần đây</h2>
            <Link className="text-xs font-black text-[#007a3d]" href="/history">
              Xem tất cả
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {submissions.map((submission) => (
              <Link className="flex items-center justify-between gap-3 rounded-[22px] border border-transparent p-2 transition hover:border-[#d9e5da] hover:bg-white" href={`/result/${submission.id}`} key={submission.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#edf6ed] text-[#007a3d]">
                    <Recycle size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#151d18]">{submission.label}</p>
                    <p className="text-xs font-semibold text-[#6e7a70]">{new Date(submission.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <StatusBadge status={submission.status} />
              </Link>
            ))}
            {submissions.length === 0 ? (
              <div className="rounded-[22px] bg-white p-5 text-center text-[#5d6a60]">
                <p className="font-bold">Chưa có lượt phân loại nào.</p>
                <Link className="mt-4 inline-flex font-black text-[#007a3d]" href="/scan">
                  Quét QR đầu tiên
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]" id="impact">
        <div className="rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
          <h2 className="text-lg font-black tracking-[-0.03em] text-[#151d18]">Tác động của bạn</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Điểm tin cậy", `${trustScore}/100`, Award],
              ["Thứ hạng", dashboardMetrics.rankLabel, Trophy],
              ["Điểm gần đây", dashboardMetrics.nearestBinLabel, MapPin],
            ].map(([label, value, Icon]) => (
              <div className="flex items-center justify-between rounded-[22px] border border-[#d9e5da] bg-white p-4" key={label as string}>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
                    <Icon size={20} />
                  </span>
                  <p className="font-bold text-[#5d6a60]">{label as string}</p>
                </div>
                <p className="font-black text-[#151d18]">{value as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]" id="rewards-fit">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-[-0.03em] text-[#151d18]">Ưu đãi phù hợp</h2>
              <p className="mt-1 text-xs font-bold leading-5 text-[#667468]">Ưu tiên phần thưởng đổi được, sau đó là phần gần đủ điểm nhất.</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-black text-[#007a3d]" href="/rewards">
              Xem
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {preferredRewards.map((reward) => (
              <Link className="rounded-[22px] border border-[#d9e5da] bg-white p-4 transition hover:border-[#007a3d]" href={`/rewards/${reward.id}`} key={reward.id}>
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
                    <Gift size={20} />
                  </span>
                  <div>
                    <p className="font-black text-[#151d18]">{reward.title}</p>
                    <p className="mt-1 text-sm font-semibold text-[#5d6a60]">{reward.points_required.toLocaleString("vi-VN")} điểm</p>
                    <p className={`mt-2 text-xs font-black ${reward.canRedeem ? "text-[#007a3d]" : "text-[#755b00]"}`}>{reward.actionLabel}</p>
                  </div>
                </div>
              </Link>
            ))}
            {preferredRewards.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#d9e5da] bg-white p-5 text-sm font-bold leading-6 text-[#667468] md:col-span-2">
                Chưa có ưu đãi đang mở. Khi admin phát hành phần thưởng mới, hệ thống sẽ tự sắp theo điểm hiện có của bạn.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedRewardCard({ className = "", reward }: { className?: string; reward: PreferredDashboardReward | null }) {
  if (!reward) {
    return (
      <article className={`rounded-[24px] border border-dashed border-[#d9e5da] bg-white p-5 shadow-[0_12px_34px_rgba(21,29,24,0.06)] xl:rounded-[28px] ${className}`}>
        <span className="grid size-11 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
          <Gift size={20} />
        </span>
        <p className="mt-4 text-sm font-black text-[#151d18]">Chưa có ưu đãi đang mở</p>
        <p className="mt-2 text-xs font-bold leading-5 text-[#667468]">Phần thưởng mới sẽ hiện ở đây khi admin phát hành.</p>
      </article>
    );
  }

  const rewardHref = `/rewards/${reward.id}`;
  const actionHref = reward.canRedeem ? rewardHref : "/scan";
  const imageUrl = reward.image_url;

  return (
    <article className={`group overflow-hidden rounded-[24px] border border-[#d9e5da] bg-white p-3 shadow-[0_12px_34px_rgba(21,29,24,0.06)] transition hover:-translate-y-0.5 hover:border-[#007a3d] xl:rounded-[28px] xl:p-4 ${className}`}>
      <div className="flex gap-3 xl:block">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-[#e7f8ef] bg-[radial-gradient(circle_at_35%_30%,rgba(46,204,113,0.30),transparent_32%),linear-gradient(135deg,#d8f5df,#e3f2ff)] bg-cover bg-center md:h-32 md:w-44 xl:mt-3 xl:aspect-[16/10] xl:h-auto xl:w-full xl:rounded-3xl" style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 sm:-order-none sm:mb-0">
            <span className="rounded-full bg-[#fff3c4] px-3 py-1 text-[10px] font-black uppercase text-[#755b00] sm:text-[11px]">Ưu đãi nổi bật</span>
            <Star className="shrink-0 text-[#755b00]" size={18} />
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-black leading-5 text-[#151d18]">{reward.title}</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <p className="text-xl font-black tracking-[-0.04em] text-[#007a3d] sm:text-lg">{reward.points_required.toLocaleString("vi-VN")} pts</p>
            <Link className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#edf6ed] px-3 py-1.5 text-xs font-black text-[#007a3d] transition hover:bg-[#d8f5df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007a3d]" href={actionHref}>
              {reward.canRedeem ? "Đổi ngay" : "Tích điểm"}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

const metricTones = {
  green: "bg-[#d8f5df] text-[#007a3d]",
  blue: "bg-[#e3f2ff] text-[#006496]",
  mint: "bg-[#e7f8ef] text-[#007a3d]",
  gold: "bg-[#fff3c4] text-[#755b00]",
};

function MetricTile({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  Icon: LucideIcon;
  tone: keyof typeof metricTones;
}) {
  return (
    <div className="min-w-0 rounded-[22px] border border-[#d9e5da] bg-white p-4 shadow-[0_8px_24px_rgba(21,29,24,0.04)]">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${metricTones[tone]}`}>
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[22px] font-black leading-7 tracking-[-0.04em] text-[#151d18] sm:text-xl">{value}</p>
          <p className="mt-1 text-xs font-bold leading-4 text-[#5d6a60]">{label}</p>
        </div>
      </div>
    </div>
  );
}
