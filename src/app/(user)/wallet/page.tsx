import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock3, Coins, Gift, History, Leaf, QrCode, Recycle, ShoppingBag, Sparkles, WalletCards, type LucideIcon } from "lucide-react";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { AIResult, SubmissionStatus } from "@/core/entities/types";
import type { Database } from "@/infrastructure/supabase/database.types";

type SubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "ai_result" | "status" | "points" | "created_at">;
type TransactionRow = Pick<Database["public"]["Tables"]["point_transactions"]["Row"], "id" | "points" | "reason" | "created_at">;
type RewardRow = Pick<Database["public"]["Tables"]["reward_items"]["Row"], "id" | "title" | "description" | "points_required">;
type RedemptionRow = Pick<Database["public"]["Tables"]["reward_redemptions"]["Row"], "id" | "points_spent" | "status" | "created_at">;

function parseAiResult(value: unknown): AIResult {
  if (value && typeof value === "object" && "wasteType" in value) {
    return value as AIResult;
  }

  return { wasteType: "unknown", confidence: 0, objectCount: 0, imageQuality: "unclear" };
}

export default async function WalletPage() {
  const { points, user } = await getUserShell();
  const supabase = await getSupabaseServerClient();

  let submissions: SubmissionRow[] = [];
  let transactions: TransactionRow[] = [];
  let rewards: RewardRow[] = [];
  let redemptions: RedemptionRow[] = [];

  if (user) {
    const [{ data: submissionData }, { data: transactionData }, { data: rewardData }, { data: redemptionData }] = await Promise.all([
      supabase.from("submissions").select("id,ai_result,status,points,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
      supabase.from("point_transactions").select("id,points,reason,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
      supabase.from("reward_items").select("id,title,description,points_required").eq("active", true).order("points_required", { ascending: true }).limit(2),
      supabase.from("reward_redemptions").select("id,points_spent,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    ]);

    submissions = submissionData ?? [];
    transactions = transactionData ?? [];
    rewards = rewardData ?? [];
    redemptions = redemptionData ?? [];
  }

  const totalEarned = transactions.reduce((sum, row) => sum + Math.max(row.points, 0), 0);
  const totalRedeemed = redemptions.reduce((sum, row) => sum + row.points_spent, 0);
  const pendingSubmissions = submissions.filter((row) => row.status === "pending_review");
  const pendingPoints = pendingSubmissions.reduce((sum, row) => sum + row.points, 0);
  const nextReward = rewards[0];
  const nextTarget = nextReward?.points_required ?? 120;
  const progress = Math.min(100, Math.round((points / Math.max(nextTarget, 1)) * 100));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Ví điểm</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#093719] md:text-5xl">Ví điểm</h1>
          <p className="mt-2 max-w-2xl font-semibold leading-7 text-[#5d6a60]">Theo dõi số dư, điểm chờ duyệt và lịch sử giao dịch xanh.</p>
        </div>
        <Link className="hidden min-h-12 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 font-black text-white shadow-[0_12px_30px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] md:inline-flex" href="/rewards">
          <Gift size={18} />
          Đổi thưởng
        </Link>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#007a3d_0%,#008f4a_58%,#007a3d_100%)] p-6 text-white shadow-[0_24px_70px_rgba(0,106,61,0.22)] md:min-h-[300px] md:p-10">
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/78">Số dư điểm SeaTech</p>
              <h2 className="mt-3 text-6xl font-black tracking-[-0.06em] md:text-7xl">
                {points.toLocaleString("vi-VN")} <span className="text-2xl font-bold tracking-normal text-white/78">Pts</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-white/78">Bạn đang ở gần mốc {nextTarget.toLocaleString("vi-VN")} điểm cho phần thưởng tiếp theo.</p>
            </div>

            <div>
              <div className="h-3 overflow-hidden rounded-full bg-white/18">
                <div className="h-full rounded-full bg-[#8ff8b6]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 font-black text-[#007a3d] transition hover:bg-[#f3fcf3]" href="/scan" style={{ color: "#007a3d" }}>
                  <QrCode size={18} />
                  Quét rác
                </Link>
                <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 bg-white/16 px-5 font-black text-white backdrop-blur transition hover:bg-white/24" href="/rewards">
                  Đổi quà ngay
                </Link>
              </div>
            </div>
          </div>
          <Leaf className="absolute -bottom-10 right-7 text-white/10" size={190} strokeWidth={1.2} />
          <div className="absolute -bottom-24 -right-16 size-80 rounded-full bg-white/8 blur-3xl" />
          <WalletCards className="absolute right-9 top-9 text-white/18" size={76} />
        </div>

        <div className="grid gap-4">
          <WalletStat icon={ArrowDownRight} label="Tổng điểm nhận" value={`${totalEarned.toLocaleString("vi-VN")} Pts`} tone="green" note="+12% so với tháng trước" />
          <WalletStat icon={ArrowUpRight} label="Tổng điểm đổi" value={`${totalRedeemed.toLocaleString("vi-VN")} Pts`} tone="blue" note={`${redemptions.length} lượt đổi thưởng`} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-[#d9e5da] bg-white/84 p-5 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[#151d18]">
              <Clock3 className="text-[#f0a100]" size={22} />
              Điểm chờ duyệt
            </h2>
            <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-black text-[#92400E]">{pendingSubmissions.length} đang xử lý</span>
          </div>

          <div className="mt-4 grid gap-3">
            {pendingSubmissions.slice(0, 3).map((submission) => {
              const aiResult = parseAiResult(submission.ai_result);
              return (
                <Link className="flex items-center justify-between gap-3 rounded-[22px] border border-[#d9e5da] bg-white p-4 transition hover:border-[#f0a100]" href={`/result/${submission.id}`} key={submission.id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
                      <Recycle size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#151d18]">{aiResult.wasteType.replaceAll("_", " ")}</p>
                      <p className="text-xs font-semibold text-[#5d6a60]">{new Date(submission.created_at).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-[#151d18]">+{submission.points}</p>
                    <p className="text-xs font-bold text-[#92400E]">Chờ duyệt</p>
                  </div>
                </Link>
              );
            })}

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-[22px] bg-[#f3fcf3] p-5 text-sm font-semibold leading-6 text-[#5d6a60]">
                Không có điểm chờ duyệt. Các lượt hợp lệ sẽ được cộng trực tiếp vào ví.
              </div>
            ) : null}

            <div className="rounded-[22px] bg-[#f3fcf3] p-4">
              <p className="text-sm font-black text-[#151d18]">Tổng điểm chờ</p>
              <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#007a3d]">+{pendingPoints.toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d9e5da] bg-white/84 p-5 shadow-[0_12px_40px_rgba(21,29,24,0.05)] md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[#151d18]">
              <History className="text-[#007a3d]" size={22} />
              Lịch sử giao dịch
            </h2>
            <Link className="inline-flex items-center gap-1 text-sm font-black text-[#007a3d]" href="/history">
              Xem tất cả
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#d9e5da] text-xs font-black uppercase tracking-[0.12em] text-[#6e7a70]">
                  <th className="pb-4">Hoạt động</th>
                  <th className="pb-4">Ngày</th>
                  <th className="pb-4">Danh mục</th>
                  <th className="pb-4 text-right">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9e5da]">
                {transactions.map((transaction) => (
                  <tr className="transition hover:bg-[#f3fcf3]" key={transaction.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-[#d8f5df] text-[#007a3d]">
                          <Sparkles size={18} />
                        </span>
                        <span className="text-sm font-black text-[#151d18]">{transaction.reason}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-semibold text-[#5d6a60]">{new Date(transaction.created_at).toLocaleDateString("vi-VN")}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-black text-[#5d6a60]">NHẬN ĐIỂM</span>
                    </td>
                    <td className="py-4 text-right text-sm font-black text-[#007a3d]">+{transaction.points} Pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {transactions.map((transaction) => (
              <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#d9e5da] bg-white p-4" key={transaction.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
                    <Coins size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#151d18]">{transaction.reason}</p>
                    <p className="text-xs font-semibold text-[#5d6a60]">{new Date(transaction.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <p className="shrink-0 font-black text-[#007a3d]">+{transaction.points}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <PromoCard title="X2 Điểm Nhựa" body="Nhận gấp đôi điểm khi phân loại chai nhựa trong tuần này." href="/scan" cta="Tham gia ngay" icon={Recycle} tone="green" />
        <PromoCard title={nextReward?.title ?? "Đổi túi vải Canvas xanh"} body={nextReward?.description ?? "Sử dụng điểm SeaTech để nhận phần thưởng xanh từ đối tác."} href={nextReward ? `/rewards/${nextReward.id}` : "/rewards"} cta="Đổi ngay" icon={ShoppingBag} tone="blue" />
      </section>
    </div>
  );
}

function WalletStat({ icon: Icon, label, value, note, tone }: { icon: LucideIcon; label: string; value: string; note: string; tone: "green" | "blue" }) {
  const styles = {
    green: "bg-[#d8f5df] text-[#007a3d]",
    blue: "bg-[#cbe6ff] text-[#006496]",
  }[tone];

  return (
    <div className="rounded-[28px] border border-[#d9e5da] bg-white/84 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
      <div className="flex items-center gap-4">
        <span className={`grid size-12 place-items-center rounded-2xl ${styles}`}>
          <Icon size={22} />
        </span>
        <div>
          <p className="text-sm font-bold text-[#5d6a60]">{label}</p>
          <p className="text-2xl font-black tracking-[-0.03em] text-[#151d18]">{value}</p>
        </div>
      </div>
      <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${styles}`}>{note}</p>
    </div>
  );
}

function PromoCard({ title, body, href, cta, icon: Icon, tone }: { title: string; body: string; href: string; cta: string; icon: LucideIcon; tone: "green" | "blue" }) {
  const styles = {
    green: "bg-[#09864f] text-white shadow-[0_18px_44px_rgba(0,106,61,0.16)]",
    blue: "bg-[#e3f2ff] text-[#00344f] shadow-[0_18px_44px_rgba(0,100,150,0.10)]",
  }[tone];

  return (
    <Link className={`group relative min-h-48 overflow-hidden rounded-[32px] p-7 transition hover:-translate-y-0.5 ${styles}`} href={href}>
      <div className="relative z-10 max-w-sm">
        <span className="inline-flex rounded-full bg-white/24 px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">Ưu đãi</span>
        <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 opacity-80">{body}</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#007a3d]" style={{ color: "#007a3d" }}>
          {cta}
          <ArrowRight size={16} />
        </span>
      </div>
      <Icon className="absolute -bottom-5 -right-4 opacity-20 transition group-hover:scale-105" size={150} />
    </Link>
  );
}
