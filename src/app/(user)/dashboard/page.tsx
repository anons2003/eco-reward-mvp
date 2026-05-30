import { Award, Camera, type LucideIcon, QrCode, Recycle } from "lucide-react";
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="surface rounded-2xl p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#006492]">Xin chào, {fullName}</p>
            <h1 className="mt-2 text-4xl font-black">{points} điểm xanh</h1>
            <p className="mt-2 text-[#3f4850]">Trust score {trustScore}/100. Tiếp tục phân loại để mở thêm phần thưởng.</p>
          </div>
          <a className="btn-primary" href="/scan">
            <QrCode size={18} />
            Quét QR
          </a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {([
            ["Lượt phân loại", submissions.length.toString(), Recycle],
            ["Điểm đang chờ", submissions.filter((row) => row.status === "pending_review").length.toString(), Camera],
            ["Quà có thể đổi", rewards.length.toString(), Award],
          ] as Array<[string, string, LucideIcon]>).map(([label, value, Icon]) => (
            <div className="rounded-xl bg-[#f5f3f3] p-4" key={label}>
              <Icon className="text-[#219653]" />
              <p className="mt-3 text-2xl font-black">{value}</p>
              <p className="text-sm text-[#3f4850]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="surface rounded-2xl p-6">
        <h2 className="text-xl font-black">Phần thưởng nổi bật</h2>
        <div className="mt-4 grid gap-3">
          {rewards.map((reward) => (
            <div className="rounded-xl border border-[#d7dcdf] bg-white p-4" key={reward.id}>
              <p className="font-bold">{reward.title}</p>
              <p className="mt-1 text-sm text-[#3f4850]">{reward.points_required} điểm</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="surface rounded-2xl p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Lịch sử gần đây</h2>
          <a className="font-bold text-[#006492]" href="/wallet">
            Xem ví điểm
          </a>
        </div>
        <div className="mt-4 grid gap-3">
          {submissions.map((submission) => (
            <a className="flex items-center justify-between rounded-xl border border-[#d7dcdf] bg-white p-4" href={`/result/${submission.id}`} key={submission.id}>
              <div>
                <p className="font-bold">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                <p className="text-sm text-[#3f4850]">{new Date(submission.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={submission.status} />
                <p className="mt-1 font-black text-[#219653]">+{submission.points}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
