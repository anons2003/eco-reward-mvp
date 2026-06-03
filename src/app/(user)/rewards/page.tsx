import Link from "next/link";
import { ArrowRight, ChevronRight, History, Leaf, Lock, Search, Sparkles, Ticket, WalletCards } from "lucide-react";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { Database } from "@/infrastructure/supabase/database.types";

type RewardRow = Database["public"]["Tables"]["reward_items"]["Row"];

const categories = ["Tất cả", "Voucher", "Quà tặng", "Đóng góp", "Dịch vụ"] as const;
type RewardCategoryFilter = (typeof categories)[number];

const categoryStyles: Record<RewardRow["category"], string> = {
  Voucher: "bg-[#e3f2ff] text-[#006496]",
  "Quà tặng": "bg-[#d8f5df] text-[#006a3d]",
  "Đóng góp": "bg-[#fff3c4] text-[#755b00]",
  "Dịch vụ": "bg-[#f1e8ff] text-[#6741a1]",
};

function normalizeSearch(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0]?.trim() ?? "" : value?.trim() ?? "";
}

function normalizeCategory(value: string | string[] | undefined): RewardCategoryFilter {
  const category = normalizeSearch(value);
  return categories.includes(category as RewardCategoryFilter) ? (category as RewardCategoryFilter) : "Tất cả";
}

function rewardsHref(category: RewardCategoryFilter, query: string) {
  const params = new URLSearchParams();
  if (category !== "Tất cả") params.set("category", category);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/rewards?${search}` : "/rewards";
}

function RewardCard({ item, points }: { item: RewardRow; points: number }) {
  const canRedeem = points >= item.points_required && item.stock > 0;

  return (
    <article className="group overflow-hidden rounded-[32px] border border-[#d7e2d8] bg-white shadow-[0_10px_30px_rgba(21,29,24,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(21,29,24,0.12)]">
      <Link className="block focus:outline-none focus:ring-4 focus:ring-[#b7e8c0]" href={`/rewards/${item.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e9f5ea]">
          {item.image_url ? <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${item.image_url})` }} /> : null}
          <div className={`absolute inset-0 ${item.image_url ? "opacity-25" : ""} bg-[radial-gradient(circle_at_35%_30%,rgba(46,204,113,0.30),transparent_32%),linear-gradient(135deg,#d8f5df,#e3f2ff)]`} />
          <Leaf className="absolute bottom-5 right-5 text-[#007a3d]/20" size={118} />
          <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black uppercase text-[#151d18] shadow-sm backdrop-blur">
            {item.partner}
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
              <p className="text-lg font-black text-[#151d18]">{item.points_required.toLocaleString("vi-VN")} pts</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black uppercase text-[#647066]">Còn lại</p>
              <p className="text-lg font-black text-[#151d18]">{item.stock.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <span
            className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
              canRedeem ? "bg-[#007a3d] text-white group-hover:bg-[#006a3d]" : "bg-[#e7f0e7] text-[#3e4941]"
            }`}
          >
            {canRedeem ? "Xem và đổi" : item.stock <= 0 ? "Hết hàng" : "Xem điều kiện"}
            {canRedeem ? <ArrowRight size={18} /> : <ChevronRight size={18} />}
          </span>
        </div>
      </Link>
    </article>
  );
}

export default async function RewardsPage({ searchParams }: { searchParams: Promise<{ category?: string | string[]; q?: string | string[] }> }) {
  const params = await searchParams;
  const selectedCategory = normalizeCategory(params.category);
  const searchQuery = normalizeSearch(params.q);
  const { points } = await getUserShell();
  const supabase = await getSupabaseServerClient();
  let query = supabase.from("reward_items").select("id,title,description,points_required,stock,active,category,partner,image_url,expires_at,created_at").eq("active", true);

  if (selectedCategory !== "Tất cả") {
    query = query.eq("category", selectedCategory);
  }

  if (searchQuery) {
    const escapedSearch = searchQuery.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,partner.ilike.%${escapedSearch}%`);
  }

  const { data } = await query.order("points_required", { ascending: true });
  const rewards = (data ?? []) as RewardRow[];
  const affordableCount = rewards.filter((reward) => points >= reward.points_required && reward.stock > 0).length;

  return (
    <div className="space-y-6">
      <section>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#007a3d]">Đổi thưởng</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#151d18] md:text-5xl">Phần thưởng xanh</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#4c5a50]">
            Sử dụng điểm SeaTech để nhận ưu đãi từ đối tác, đổi quà thân thiện môi trường hoặc đóng góp cho các chiến dịch xanh.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] bg-[#007a3d] p-5 text-white shadow-[0_18px_46px_rgba(0,122,61,0.22)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase text-white">
                <WalletCards size={16} />
                Ví điểm SeaTech
              </div>
              <p className="mt-5 text-5xl font-black tracking-[-0.05em] md:mt-6 md:text-6xl">{points.toLocaleString("vi-VN")} pts</p>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/85">
                Bạn có thể đổi ngay {affordableCount} phần thưởng. Tiếp tục phân loại rác để mở khóa thêm voucher và quà tặng mới.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-[#006a3d] transition hover:bg-[#f3fcf3]" href="/wallet" style={{ color: "#006a3d" }}>
                <History size={18} />
                Xem ví điểm
              </Link>
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/12 px-5 text-sm font-black text-white ring-1 ring-white/25 transition hover:bg-white/18" href="/scan">
                <Sparkles size={18} />
                Tích điểm
              </Link>
            </div>
          </div>

          <div className="hidden min-w-[240px] grid-cols-2 gap-3 rounded-[28px] bg-white/12 p-3 ring-1 ring-white/20 sm:grid">
            <div className="rounded-2xl bg-white/12 p-4">
              <Leaf size={18} />
              <p className="mt-3 text-2xl font-black">{rewards.length}</p>
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

      <section className="rounded-[30px] border border-[#d7e2d8] bg-white/90 p-3 shadow-[0_14px_34px_rgba(21,29,24,0.07)] backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[minmax(320px,1fr)_auto] lg:items-center">
          <form action="/rewards" className="relative">
            {selectedCategory !== "Tất cả" ? <input name="category" type="hidden" value={selectedCategory} /> : null}
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5d6a60]" size={20} />
            <input
              className="min-h-14 w-full rounded-[22px] border border-[#c9d8ca] bg-[#f7fbf7] px-5 pl-12 pr-28 text-base font-bold text-[#151d18] outline-none placeholder:text-[#7c887f] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/12"
              defaultValue={searchQuery}
              name="q"
              placeholder="Tìm theo tên ưu đãi, đối tác hoặc mô tả"
              type="search"
            />
            <button className="absolute right-2 top-1/2 hidden min-h-10 -translate-y-1/2 rounded-[18px] bg-[#007a3d] px-4 text-sm font-black text-white transition hover:bg-[#006a35] sm:inline-flex sm:items-center" type="submit">
              Tìm
            </button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end lg:pb-0">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-12 shrink-0 items-center justify-center rounded-[22px] px-5 text-sm font-black transition ${
                    active
                      ? "bg-[#007a3d] text-white shadow-[0_12px_26px_rgba(0,106,61,0.22)]"
                      : "bg-white text-[#26332a] ring-1 ring-[#d7e2d8] hover:bg-[#f3fcf3] hover:text-[#006a3d]"
                  }`}
                  href={rewardsHref(category, searchQuery)}
                  key={category}
                  style={active ? { color: "#ffffff" } : undefined}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </div>

        {searchQuery || selectedCategory !== "Tất cả" ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[22px] bg-[#f3fcf3] px-4 py-3 text-sm font-bold text-[#4c5a50]">
            <span>
              Tìm thấy <strong className="text-[#007a3d]">{rewards.length.toLocaleString("vi-VN")}</strong> phần thưởng
              {searchQuery ? ` cho "${searchQuery}"` : ""}.
            </span>
            <Link className="inline-flex min-h-9 items-center rounded-full bg-white px-4 text-[#007a3d] ring-1 ring-[#d7e2d8] transition hover:bg-[#edf6ed]" href="/rewards">
              Xóa bộ lọc
            </Link>
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rewards.map((reward) => (
          <RewardCard item={reward} key={reward.id} points={points} />
        ))}
      </section>

      {rewards.length === 0 ? (
        <section className="rounded-[32px] border border-[#d7e2d8] bg-white p-10 text-center shadow-[0_10px_30px_rgba(21,29,24,0.07)]">
          <p className="text-lg font-black text-[#151d18]">{searchQuery || selectedCategory !== "Tất cả" ? "Không có phần thưởng phù hợp." : "Chưa có phần thưởng đang mở."}</p>
          <p className="mt-2 text-sm font-semibold text-[#4c5a50]">
            {searchQuery || selectedCategory !== "Tất cả" ? "Thử đổi từ khóa hoặc xóa bộ lọc để xem toàn bộ ưu đãi." : "Quay lại sau khi admin phát hành voucher mới."}
          </p>
        </section>
      ) : null}
    </div>
  );
}
