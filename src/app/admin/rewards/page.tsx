import { CalendarDays, ChevronLeft, ChevronRight, Filter, Package, SlidersHorizontal } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";
import { RewardManagementActions } from "@/components/admin/reward-management-actions";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type RewardRow = Database["public"]["Tables"]["reward_items"]["Row"];

const rewardColumns = "id,title,description,points_required,stock,active,category,partner,image_url,expires_at,created_at";
const filters = ["Tất cả", "Đang mở", "Đã ẩn", "Hết hàng"];

export default async function AdminRewardsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("reward_items").select(rewardColumns).order("created_at", { ascending: false });
  const rewards = (data ?? []) as RewardRow[];
  const totalStock = rewards.reduce((sum, reward) => sum + reward.stock, 0);
  const activeRewards = rewards.filter((reward) => reward.active).length;
  const emptyRewards = rewards.filter((reward) => reward.stock <= 0).length;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý Quà tặng & Voucher</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#6c7b6d]">Theo dõi tồn kho, trạng thái xuất bản và hạn dùng phần thưởng cho cộng đồng SeaTech.</p>
        </div>
        <RewardManagementActions />
      </section>

      <section className="grid-flow-dense grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#bbcbbb]/50 bg-white/80 p-4 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-8" data-admin-reveal>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {filters.map((filter, index) => (
              <button
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-black transition ${
                  index === 0 ? "bg-[#006d37] text-white" : "bg-[#e9e8e7] text-[#3d4a3e] hover:bg-[#e4e2e1]"
                }`}
                key={filter}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 lg:col-span-4" data-admin-reveal>
          <SummaryTile label="Đang mở" value={activeRewards.toString()} />
          <SummaryTile label="Hết hàng" value={emptyRewards.toString()} />
          <SummaryTile label="Tồn kho" value={totalStock.toLocaleString("vi-VN")} />
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#bbcbbb]/40 bg-white/70 p-4 backdrop-blur-md lg:col-span-12" data-admin-reveal>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#6c7b6d]">
            <Filter size={16} />
            Dữ liệu Supabase
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#6c7b6d]">
            <SlidersHorizontal size={16} />
            Sắp xếp: Mới nhất
          </span>
          <span className="ml-auto hidden text-sm font-semibold text-[#6c7b6d] md:block">Hiển thị {rewards.length.toLocaleString("vi-VN")} phần thưởng</span>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/35 p-5 text-sm font-black text-[#ba1a1a]" data-admin-reveal>
          Không thể tải danh sách phần thưởng.
        </section>
      ) : null}

      <section className="grid-flow-dense grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {rewards.map((reward) => (
          <RewardAdminCard key={reward.id} reward={reward} />
        ))}
      </section>

      {rewards.length === 0 ? (
        <section className="rounded-2xl border border-[#bbcbbb]/40 bg-white/80 p-10 text-center shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
          <p className="text-lg font-black text-[#1b1c1b]">Chưa có phần thưởng.</p>
          <p className="mt-2 text-sm font-semibold text-[#6c7b6d]">Tạo phần thưởng đầu tiên để người dùng có thể đổi điểm.</p>
        </section>
      ) : null}

      <section className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/45 py-6 md:flex-row" data-admin-reveal>
        <p className="text-sm font-semibold text-[#6c7b6d]">
          Hiển thị <span className="font-black text-[#1b1c1b]">{rewards.length.toLocaleString("vi-VN")}</span> phần thưởng
        </p>
        <div className="flex items-center gap-2">
          <button className="grid size-10 place-items-center rounded-full border border-[#bbcbbb] text-[#3d4a3e] transition hover:bg-white disabled:opacity-45" type="button" disabled>
            <ChevronLeft size={18} />
          </button>
          <span className="grid size-10 place-items-center rounded-full bg-[#006d37] text-sm font-black text-white">1</span>
          <button className="grid size-10 place-items-center rounded-full border border-[#bbcbbb] text-[#3d4a3e] transition hover:bg-white disabled:opacity-45" type="button" disabled>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#bbcbbb]/50 bg-white/85 p-4 shadow-[0_12px_34px_rgba(45,156,219,0.05)] backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#006d37]">{value}</p>
    </div>
  );
}

function RewardAdminCard({ reward }: { reward: RewardRow }) {
  const tone = reward.stock <= 0 ? "empty" : reward.active ? "open" : "draft";
  const statusClass = {
    open: "bg-[#2ecc71] text-[#005027]",
    empty: "bg-[#ffdad6] text-[#ba1a1a]",
    draft: "bg-[#e4e2e1] text-[#3d4a3e]",
  }[tone];
  const status = reward.stock <= 0 ? "Hết hàng" : reward.active ? "Đang mở" : "Đã ẩn";
  const expires = reward.expires_at ? new Date(reward.expires_at).toLocaleDateString("vi-VN") : "Chưa thiết lập";

  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_14px_38px_rgba(45,156,219,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(45,156,219,0.12)] ${tone === "empty" ? "opacity-80" : ""}`} data-admin-reveal>
      <div className="relative grid h-44 place-items-center overflow-hidden bg-[#efedec]">
        {reward.image_url ? (
          <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${reward.image_url})` }} />
        ) : (
          <>
            <div className={`absolute inset-0 ${tone === "empty" ? "bg-[linear-gradient(135deg,#f5f3f2,#ffdad6)]" : tone === "draft" ? "bg-[linear-gradient(135deg,#efedec,#e8f5ff)]" : "bg-[radial-gradient(circle_at_30%_25%,rgba(46,204,113,0.28),transparent_34%),linear-gradient(135deg,#edf6ed,#e8f5ff)]"}`} />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
            <span className="relative grid size-16 place-items-center rounded-2xl bg-white/88 text-[#006d37] shadow-[0_14px_32px_rgba(0,109,55,0.12)] transition-transform duration-500 group-hover:scale-105">
              <Package size={32} />
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={`min-w-0 truncate rounded-full px-3 py-1 text-xs font-black ${statusClass}`}>{status}</span>
          <span className="shrink-0 rounded-lg bg-[#edf6ed] px-3 py-1 text-sm font-black text-[#006d37]">{reward.points_required.toLocaleString("vi-VN")} Pts</span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#2d9cdb]">{reward.partner}</p>
        <h2 className="mt-1 line-clamp-1 text-base font-black text-[#2c3e50]">{reward.title}</h2>
        <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#6c7b6d]">{reward.description}</p>

        <div className="my-6 flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold text-[#3d4a3e]">
            <span className="inline-flex items-center gap-2">
              <Package size={17} />
              Tồn kho
            </span>
            <span className={reward.stock === 0 ? "font-black text-[#ba1a1a]" : "font-black text-[#1b1c1b]"}>{reward.stock.toLocaleString("vi-VN")}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-[#3d4a3e]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} />
              Hạn dùng
            </span>
            <span>{expires}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#bbcbbb]/35 pt-4">
          <span className="rounded-full bg-[#e9e8e7] px-3 py-1 text-xs font-black text-[#3d4a3e]">{reward.category}</span>
          <RewardManagementActions reward={reward} />
        </div>
      </div>
    </article>
  );
}
