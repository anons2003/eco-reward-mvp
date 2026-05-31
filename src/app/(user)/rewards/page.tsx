import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  History,
  Leaf,
  Lock,
  Sparkles,
  Ticket,
  WalletCards,
} from "lucide-react";
import { ecoRewardService } from "@/application/services/eco-reward-service";
import { rewardCatalog, type RewardCatalogItem } from "@/components/user/rewards-catalog";

const categories = ["Tất cả", "Voucher", "Quà tặng", "Đóng góp", "Dịch vụ"];

const categoryStyles: Record<RewardCatalogItem["category"], string> = {
  Voucher: "bg-[#e3f2ff] text-[#006496]",
  "Quà tặng": "bg-[#d8f5df] text-[#006a3d]",
  "Đóng góp": "bg-[#fff3c4] text-[#755b00]",
  "Dịch vụ": "bg-[#f1e8ff] text-[#6741a1]",
};

function RewardCard({ item, points }: { item: RewardCatalogItem; points: number }) {
  const canRedeem = points >= item.points;

  return (
    <article className="group overflow-hidden rounded-[32px] border border-[#d7e2d8] bg-white shadow-[0_10px_30px_rgba(21,29,24,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(21,29,24,0.12)]">
      <Link className="block focus:outline-none focus:ring-4 focus:ring-[#b7e8c0]" href={`/rewards/${item.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9f5ea]">
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${item.image})` }}
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black uppercase text-[#151d18] shadow-sm backdrop-blur">
            {item.badge ?? item.category}
          </div>
          <div className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-black uppercase shadow-sm ${categoryStyles[item.category]}`}>
            {item.category}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-h-[56px] text-xl font-black leading-7 text-[#151d18]">{item.title}</h2>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#f3fcf3] text-[#007a3d] ring-1 ring-[#d7e2d8]">
              {canRedeem ? <Ticket size={19} /> : <Lock size={18} />}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#4c5a50]">{item.description}</p>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#d7e2d8] bg-[#f7fbf7] px-4 py-3">
            <div>
              <p className="text-[11px] font-black uppercase text-[#647066]">Cần đổi</p>
              <p className="text-lg font-black text-[#151d18]">{item.points.toLocaleString("vi-VN")} pts</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black uppercase text-[#647066]">Còn lại</p>
              <p className="text-lg font-black text-[#151d18]">{item.stock}</p>
            </div>
          </div>
          <div
            className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
              canRedeem ? "bg-[#007a3d] text-white group-hover:bg-[#006a3d]" : "bg-[#e7f0e7] text-[#3e4941]"
            }`}
          >
            {canRedeem ? "Đổi ngay" : "Chưa đủ điểm"}
            {canRedeem ? <ArrowRight size={18} /> : <ChevronRight size={18} />}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function RewardsPage() {
  const user = ecoRewardService.getDemoUser("user");
  const affordableCount = rewardCatalog.filter((reward) => user.points >= reward.points).length;

  return (
    <div className="space-y-6">
      <section>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#007a3d]">Đổi thưởng</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#151d18] md:text-5xl">Phần thưởng xanh</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#4c5a50]">
            Sử dụng EcoPoint để nhận ưu đãi từ đối tác, đổi quà thân thiện môi trường hoặc đóng góp cho các chiến dịch xanh.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] bg-[#007a3d] p-5 text-white shadow-[0_18px_46px_rgba(0,122,61,0.22)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase text-white">
                <WalletCards size={16} />
                Ví điểm Eco
              </div>
              <p className="mt-5 text-5xl font-black tracking-[-0.05em] md:mt-6 md:text-6xl">{user.points.toLocaleString("vi-VN")} pts</p>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/85">
                Bạn có thể đổi ngay {affordableCount} phần thưởng. Tiếp tục phân loại rác để mở khóa thêm voucher và quà tặng mới.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#006a3d] transition hover:bg-[#f3fcf3]"
                href="/history"
                style={{ color: "#006a3d" }}
              >
                <History size={18} />
                Xem lịch sử
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/12 px-5 text-sm font-black text-white ring-1 ring-white/25 transition hover:bg-white/18"
                href="/scan"
              >
                <Sparkles size={18} />
                Tích điểm
              </Link>
            </div>
          </div>

          <div className="hidden min-w-[240px] grid-cols-2 gap-3 rounded-[28px] bg-white/12 p-3 ring-1 ring-white/20 sm:grid">
            <div className="rounded-2xl bg-white/12 p-4">
              <Leaf size={18} />
              <p className="mt-3 text-2xl font-black">{rewardCatalog.length}</p>
              <p className="text-xs font-bold text-white/75">Phần thưởng</p>
            </div>
            <div className="rounded-2xl bg-white/12 p-4">
              <Ticket size={18} />
              <p className="mt-3 text-2xl font-black">{affordableCount}</p>
              <p className="text-xs font-bold text-white/75">Có thể đổi</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category, index) => (
          <button
            className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-black transition ${
              index === 0
                ? "bg-[#151d18] text-white shadow-[0_10px_24px_rgba(21,29,24,0.14)]"
                : "bg-white text-[#3e4941] ring-1 ring-[#d7e2d8] hover:bg-[#f3fcf3]"
            }`}
            key={category}
            type="button"
          >
            {category}
          </button>
        ))}
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rewardCatalog.map((reward) => (
          <RewardCard item={reward} key={reward.id} points={user.points} />
        ))}
      </section>
    </div>
  );
}
