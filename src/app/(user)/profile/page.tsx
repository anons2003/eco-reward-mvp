import Link from "next/link";
import { Award, BarChart3, Camera, Droplets, Edit3, Leaf, Mail, MapPin, Phone, Recycle, Trees, Trophy, WalletCards, type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ProfileShareButton } from "@/components/user/profile-share-button";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { Database } from "@/infrastructure/supabase/database.types";
import { buildProfileMetrics, type ProfileAchievement, type ProfileMetricsRedemption, type ProfileMetricsReward, type ProfileMetricsSubmission } from "./profile-metrics";

type RewardItemRow = Pick<Database["public"]["Tables"]["reward_items"]["Row"], "id" | "category">;

const achievementIcons: Record<ProfileAchievement["kind"], LucideIcon> = {
  recycle: Recycle,
  droplets: Droplets,
  leaf: Leaf,
};

const achievementTone: Record<ProfileAchievement["tone"], string> = {
  amber: "bg-[#fff3c4] text-[#755b00]",
  blue: "bg-[#e3f2ff] text-[#006496]",
  green: "bg-[#d8f5df] text-[#007a3d]",
};

function StatCard({ Icon, label, value, unit }: { Icon: LucideIcon; label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-[#bdcabe]/60 bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs font-bold text-[#6e7a70]">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#151d18]">
          {value} <span className="text-sm font-semibold tracking-normal text-[#6e7a70]">{unit}</span>
        </p>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const { avatarUrl, displayName, points, profile, user } = await getUserShell();
  const supabase = await getSupabaseServerClient();
  const email = user.email ?? "nguyen.an@seatech.app";
  const phone = profile?.phone ?? "Chưa cập nhật";
  const location = profile?.location ?? "Chưa cập nhật";
  const bio = profile?.bio ?? "Hành động nhỏ, tác động lớn. Cùng nhau xây dựng thế giới xanh hơn!";
  const [{ data: submissionData }, { data: redemptionData }] = await Promise.all([
    supabase.from("submissions").select("id,ai_result,status,points,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reward_redemptions").select("id,reward_item_id,points_spent,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const submissions = (submissionData ?? []) as ProfileMetricsSubmission[];
  const redemptions = (redemptionData ?? []) as ProfileMetricsRedemption[];
  const rewardIds = [...new Set(redemptions.map((redemption) => redemption.reward_item_id))];
  let rewards: ProfileMetricsReward[] = [];

  if (rewardIds.length > 0) {
    const { data: rewardData } = await supabase.from("reward_items").select("id,category").in("id", rewardIds);
    rewards = ((rewardData ?? []) as RewardItemRow[]).map((reward) => ({ id: reward.id, category: reward.category }));
  }

  const metrics = buildProfileMetrics({ points, submissions, redemptions, rewards });
  const nextRankLabel = metrics.nextRank ? `${metrics.nextRank.toLocaleString("vi-VN")} pts` : "Đã đạt hạng cao nhất";

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a3d]">Hồ sơ</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#151d18] md:text-5xl">Hồ sơ cá nhân</h1>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#151d18] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]" href="/settings">
          <Edit3 size={17} />
          Chỉnh sửa hồ sơ
        </Link>
      </section>

      <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative">
              <UserAvatar className="ring-[#007a3d]/20" name={displayName} size="xl" src={avatarUrl} />
              <Link className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-[#007a3d] text-white ring-4 ring-white transition hover:bg-[#006a35]" href="/settings" aria-label="Cập nhật ảnh đại diện" style={{ color: "#ffffff" }}>
                <Camera size={16} />
              </Link>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-black tracking-[-0.04em] text-[#151d18]">{displayName}</h2>
                <span className="rounded-full bg-[#fff3c4] px-2.5 py-1 text-[10px] font-black uppercase text-[#755b00]">{metrics.tierName}</span>
              </div>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#3e4941]">“{bio}”</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#007a3d] px-4 text-sm font-black text-white" href="/settings">
                  <Edit3 size={16} />
                  Chỉnh sửa hồ sơ
                </Link>
                <ProfileShareButton displayName={displayName} points={points} co2KgLabel={metrics.co2KgLabel} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#edf6ed] p-5">
            <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
              <span>{metrics.nextRank ? "Tiến trình lên hạng tiếp theo" : "Thành viên hạng cao nhất"}</span>
              <Trophy className="text-[#755b00]" size={18} />
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[#007a3d]" style={{ width: `${metrics.progress}%` }} />
            </div>
            <p className="mt-2 text-right text-xs font-bold text-[#3e4941]">
              {points.toLocaleString("vi-VN")} / {nextRankLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard Icon={WalletCards} label="Tổng điểm tích lũy" unit="pts" value={points.toLocaleString("vi-VN")} />
        <StatCard Icon={Trees} label="Lượt đóng góp xanh" unit="lượt" value={metrics.contributionCount.toLocaleString("vi-VN")} />
        <StatCard Icon={BarChart3} label="CO2 giảm thiểu" unit="kg" value={metrics.co2KgLabel} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#151d18]">Biểu đồ tác động cá nhân</h2>
            <span className="rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-black text-[#3e4941]">6 tháng gần nhất</span>
          </div>
          <div className="flex h-56 items-end gap-4">
            {metrics.chart.map((point) => (
              <div className="flex h-full flex-1 flex-col justify-end gap-2" key={point.label}>
                <div className="rounded-t-2xl bg-[#d8f5df]" style={{ height: `${Math.max(point.height, 8)}%` }}>
                  <div className="rounded-t-2xl bg-[#007a3d]" style={{ height: point.approvedCount > 0 ? "55%" : "0%" }} />
                </div>
                <span className="text-center text-xs font-bold text-[#6e7a70]">{point.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-6 text-xs font-bold text-[#3e4941]">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#007a3d]" /> Lượt đã duyệt
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#d8f5df]" /> Tổng lượt theo tháng
            </span>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
          <h2 className="text-lg font-black text-[#151d18]">Huy hiệu gần đây</h2>
          <div className="mt-5 space-y-3">
            {metrics.achievements.length > 0 ? (
              metrics.achievements.map((badge) => {
                const Icon = achievementIcons[badge.kind];
                return (
              <div className="flex gap-3 rounded-2xl bg-[#edf6ed] p-4" key={badge.title}>
                <span className={`grid size-11 shrink-0 place-items-center rounded-full ${achievementTone[badge.tone]}`}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-black text-[#151d18]">{badge.title}</p>
                  <p className="mt-1 text-xs font-semibold text-[#6e7a70]">{badge.body}</p>
                </div>
              </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-[#edf6ed] p-4">
                <p className="font-black text-[#151d18]">Chưa có huy hiệu</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#6e7a70]">Quét QR, gửi ảnh hợp lệ và đổi nhóm Đóng góp để mở khóa huy hiệu thật.</p>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
        <h2 className="text-lg font-black text-[#151d18]">Thông tin tài khoản</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { Icon: Mail, label: "Địa chỉ Email", value: email },
            { Icon: Phone, label: "Số điện thoại", value: phone },
            { Icon: Award, label: "Họ và tên", value: displayName },
            { Icon: MapPin, label: "Khu vực / Nhóm", value: location },
          ].map((item) => (
            <div className="flex gap-3 rounded-2xl bg-[#edf6ed] p-4" key={item.label}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#007a3d]">
                <item.Icon size={18} />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6e7a70]">{item.label}</p>
                <p className="mt-1 font-bold text-[#151d18]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
