import Link from "next/link";
import { ArrowRight, Award, Camera, Coins, Gift, Leaf, MapPin, QrCode, Recycle, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/infrastructure/supabase/server";
import type { AIResult, SubmissionStatus } from "@/core/entities/types";
import type { Database } from "@/infrastructure/supabase/database.types";

type DashboardSubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "ai_result" | "status" | "points" | "created_at">;
type DashboardRewardRow = Pick<Database["public"]["Tables"]["reward_items"]["Row"], "id" | "title" | "points_required">;
type DashboardProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "points" | "trust_score">;

function parseAiResult(value: unknown): AIResult {
  if (value && typeof value === "object" && "wasteType" in value) {
    return value as AIResult;
  }

  return { wasteType: "unknown", confidence: 0, objectCount: 0, imageQuality: "unclear" };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let profile: DashboardProfileRow | null = null;
  if (authUser) {
    const { data } = await supabase.from("profiles").select("id,email,full_name,points,trust_score").eq("id", authUser.id).single();
    profile = data;
  }
  let submissionRows: DashboardSubmissionRow[] = [];
  if (authUser) {
    const { data } = await supabase.from("submissions").select("id,ai_result,status,points,created_at").eq("user_id", authUser.id).order("created_at", { ascending: false }).limit(4);
    submissionRows = data ?? [];
  }
  const { data } = await supabase.from("reward_items").select("id,title,points_required").eq("active", true).order("points_required", { ascending: true }).limit(2);
  const rewardRows: DashboardRewardRow[] = data ?? [];

  const submissions =
    submissionRows?.map((row) => ({
      id: row.id,
      aiResult: parseAiResult(row.ai_result),
      status: row.status as SubmissionStatus,
      points: row.points,
      createdAt: row.created_at,
    })) ?? [];
  const rewards = rewardRows ?? [];
  const dashboardProfile = profile as DashboardProfileRow | null;
  const fullName = dashboardProfile?.full_name ?? authUser?.email ?? "Eco user";
  const points = dashboardProfile?.points ?? 0;
  const trustScore = dashboardProfile?.trust_score ?? 80;
  const pendingCount = submissions.filter((row) => row.status === "pending_review").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="overflow-hidden rounded-[28px] border border-[#d7ecdc] bg-[#e9fff0] p-6 shadow-[0_20px_60px_rgba(45,156,219,0.08)] sm:p-8">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#151515]">
              <Leaf size={14} />
              Xin chào, {fullName}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight text-[#151515] sm:text-5xl">{points} điểm xanh</h1>
            <p className="mt-3 max-w-xl leading-7 text-[#5f6472]">Quét QR tại thùng rác, chụp ảnh vật phẩm và nhận điểm sau khi AI xác minh.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#151515] px-5 py-3 font-black text-[#151515] shadow-[0_16px_38px_rgba(132,204,22,0.26)] transition hover:scale-[1.01]" href="/scan">
            <QrCode size={20} />
            Quét QR
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {([
            ["Lượt phân loại", submissions.length.toString(), Recycle],
            ["Đang chờ duyệt", pendingCount.toString(), Camera],
            ["Quà có thể đổi", rewards.length.toString(), Award],
          ] as Array<[string, string, LucideIcon]>).map(([label, value, Icon]) => (
            <div className="rounded-2xl border border-white/80 bg-white/78 p-4 shadow-[0_10px_34px_rgba(45,156,219,0.08)] backdrop-blur" key={label}>
              <Icon className="text-[#151515]" />
              <p className="mt-3 text-2xl font-black text-[#151515]">{value}</p>
              <p className="text-sm font-semibold text-[#5f6472]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="eco-card rounded-[24px] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Trust score</h2>
          <Sparkles className="text-[#151515]" />
        </div>
        <div className="mt-5 grid place-items-center">
          <div className="grid size-36 place-items-center rounded-full" style={{ background: `conic-gradient(#151515 ${trustScore * 3.6}deg, #e6e7ef 0deg)` }}>
            <div className="grid size-28 place-items-center rounded-full bg-white text-center">
              <p className="text-3xl font-black text-[#151515]">{trustScore}</p>
              <p className="text-xs font-bold uppercase text-[#5f6472]">/100</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm leading-6 text-[#5f6472]">Điểm tin cậy cao giúp lượt gửi hợp lệ được duyệt nhanh hơn.</p>
      </aside>

      <section className="eco-card rounded-[24px] p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Phần thưởng nổi bật</h2>
          <Link className="inline-flex items-center gap-1 text-sm font-black text-[#151515]" href="/rewards">
            Xem
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rewards.map((reward) => (
            <div className="rounded-2xl border border-[#d7ecdc] bg-white p-4 shadow-[0_8px_24px_rgba(45,156,219,0.06)]" key={reward.id}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f4f5fb] text-[#151515]">
                  <Gift size={20} />
                </span>
                <div>
                  <p className="font-black">{reward.title}</p>
                  <p className="mt-1 text-sm font-semibold text-[#5f6472]">{reward.points_required} điểm</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="eco-card rounded-[24px] p-6">
        <h2 className="text-xl font-black">Tác động của bạn</h2>
        <div className="mt-4 grid gap-3">
          {[
            ["Điểm tích lũy", `${points}`, Coins],
            ["Top tuần", "#12", Trophy],
            ["Thùng gần nhất", "Sảnh A", MapPin],
          ].map(([label, value, Icon]) => (
            <div className="flex items-center justify-between rounded-2xl bg-white p-4" key={label as string}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-white text-[#151515]">
                  <Icon size={20} />
                </span>
                <p className="font-bold text-[#5f6472]">{label as string}</p>
              </div>
              <p className="font-black text-[#151515]">{value as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="eco-card rounded-[24px] p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Lịch sử gần đây</h2>
          <Link className="font-bold text-[#151515]" href="/wallet">
            Xem ví điểm
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {submissions.map((submission) => (
            <Link className="flex items-center justify-between gap-4 rounded-2xl border border-[#d7ecdc] bg-white p-4 transition hover:border-[#151515]" href={`/result/${submission.id}`} key={submission.id}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f4f5fb] text-[#151515]">
                  <Recycle size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                  <p className="text-sm text-[#5f6472]">{new Date(submission.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <StatusBadge status={submission.status} />
                <p className="mt-1 font-black text-[#151515]">+{submission.points}</p>
              </div>
            </Link>
          ))}
          {submissions.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-[#5f6472]">
              <p className="font-bold">Chưa có lượt phân loại nào.</p>
              <Link className="mt-4 inline-flex font-black text-[#151515]" href="/scan">
                Quét QR đầu tiên
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
