import { CalendarDays, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Package, Plus, SlidersHorizontal } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const managedRewards = [
  {
    partner: "Starbucks Vietnam",
    title: "Voucher Cà phê Miễn phí",
    points: 500,
    stock: 125,
    expires: "31/12/2024",
    status: "Đang mở",
    action: "Chỉnh sửa",
    tone: "open",
  },
  {
    partner: "Nike Official",
    title: "Giày Chạy Bộ Pegasus 40",
    points: 2500,
    stock: 0,
    expires: "Hết hạn",
    status: "Hết hàng",
    action: "Nhập thêm hàng",
    tone: "empty",
  },
  {
    partner: "Grab Rewards",
    title: "Mã giảm giá GrabCar 50k",
    points: 1200,
    stock: null,
    expires: "Chưa thiết lập",
    status: "Nháp",
    action: "Xuất bản",
    tone: "draft",
  },
  {
    partner: "Thế Giới Di Động",
    title: "Voucher Phụ Kiện Công Nghệ",
    points: 15000,
    stock: 45,
    expires: "15/09/2024",
    status: "Đang mở",
    action: "Chỉnh sửa",
    tone: "open",
  },
];

const filters = ["Tất cả (24)", "Ẩm thực", "Mua sắm", "Giải trí", "Di chuyển"];

export default function AdminRewardsPage() {
  const totalStock = managedRewards.reduce((sum, reward) => sum + (reward.stock ?? 0), 0);
  const activeRewards = managedRewards.filter((reward) => reward.tone === "open").length;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý Quà tặng & Voucher</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#6c7b6d]">Theo dõi tồn kho, trạng thái xuất bản và hạn dùng phần thưởng cho cộng đồng SeaTech.</p>
        </div>
        <button className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#2ecc71] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(46,204,113,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
          <Plus size={18} />
          Thêm phần thưởng mới
        </button>
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

        <div className="grid grid-cols-2 gap-4 lg:col-span-4" data-admin-reveal>
          <SummaryTile label="Đang mở" value={activeRewards.toString()} />
          <SummaryTile label="Tồn kho" value={totalStock.toLocaleString("vi-VN")} />
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#bbcbbb]/40 bg-white/70 p-4 backdrop-blur-md lg:col-span-12" data-admin-reveal>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#6c7b6d]">
            <Filter size={16} />
            Lọc nâng cao
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#6c7b6d]">
            <SlidersHorizontal size={16} />
            Sắp xếp: Mới nhất
          </span>
          <span className="ml-auto hidden text-sm font-semibold text-[#6c7b6d] md:block">Hiển thị 1 - 4 trong tổng số 24 phần thưởng</span>
        </div>
      </section>

      <section className="grid-flow-dense grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {managedRewards.map((reward) => (
          <RewardAdminCard key={reward.title} reward={reward} />
        ))}
      </section>

      <section className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/45 py-6 md:flex-row" data-admin-reveal>
        <p className="text-sm font-semibold text-[#6c7b6d]">
          Hiển thị <span className="font-black text-[#1b1c1b]">1 - 4</span> trong tổng số <span className="font-black text-[#1b1c1b]">24</span> phần thưởng
        </p>
        <div className="flex items-center gap-2">
          <button className="grid size-10 place-items-center rounded-full border border-[#bbcbbb] text-[#3d4a3e] transition hover:bg-white" type="button">
            <ChevronLeft size={18} />
          </button>
          {[1, 2, 3].map((page) => (
            <button className={`grid size-10 place-items-center rounded-full text-sm font-black ${page === 1 ? "bg-[#006d37] text-white" : "border border-[#bbcbbb] text-[#3d4a3e] hover:bg-white"}`} key={page} type="button">
              {page}
            </button>
          ))}
          <button className="grid size-10 place-items-center rounded-full border border-[#bbcbbb] text-[#3d4a3e] transition hover:bg-white" type="button">
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

function RewardAdminCard({ reward }: { reward: (typeof managedRewards)[number] }) {
  const statusClass = {
    open: "bg-[#2ecc71] text-[#005027]",
    empty: "bg-[#ffdad6] text-[#ba1a1a]",
    draft: "bg-[#e4e2e1] text-[#3d4a3e]",
  }[reward.tone];
  const primaryAction = reward.tone === "draft";

  return (
    <article className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_14px_38px_rgba(45,156,219,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(45,156,219,0.12)] ${reward.tone === "empty" ? "opacity-80" : ""}`} data-admin-reveal>
      <div className="relative grid h-48 place-items-center overflow-hidden bg-[#efedec]">
        <div className={`absolute inset-0 ${reward.tone === "empty" ? "bg-[linear-gradient(135deg,#f5f3f2,#ffdad6)]" : reward.tone === "draft" ? "bg-[linear-gradient(135deg,#efedec,#e8f5ff)]" : "bg-[radial-gradient(circle_at_30%_25%,rgba(46,204,113,0.28),transparent_34%),linear-gradient(135deg,#edf6ed,#e8f5ff)]"}`} />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
        <span className="relative grid size-16 place-items-center rounded-2xl bg-white/88 text-[#006d37] shadow-[0_14px_32px_rgba(0,109,55,0.12)] transition-transform duration-500 group-hover:scale-105">
          <Package size={32} />
        </span>
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black ${statusClass}`}>{reward.status}</span>
        <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1 text-sm font-black text-[#006d37] backdrop-blur-sm">{reward.points.toLocaleString("vi-VN")} Pts</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#2d9cdb]">{reward.partner}</p>
        <h2 className="mt-1 line-clamp-1 text-base font-black text-[#2c3e50]">{reward.title}</h2>

        <div className="my-6 flex-1 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold text-[#3d4a3e]">
            <span className="inline-flex items-center gap-2">
              <Package size={17} />
              Tồn kho
            </span>
            <span className={reward.stock === 0 ? "font-black text-[#ba1a1a]" : "font-black text-[#1b1c1b]"}>{reward.stock ?? "--"}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-[#3d4a3e]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} />
              Hạn dùng
            </span>
            <span>{reward.expires}</span>
          </div>
        </div>

        <div className="flex gap-2 border-t border-[#bbcbbb]/35 pt-4">
          <button className={`min-h-10 flex-1 rounded-xl text-sm font-black transition ${primaryAction ? "bg-[#006d37] text-white hover:brightness-110" : "bg-[#e9e8e7] text-[#3d4a3e] hover:bg-[#e4e2e1]"}`} type="button">
            {reward.action}
          </button>
          <button className="grid size-10 place-items-center rounded-xl bg-[#e9e8e7] text-[#3d4a3e] transition hover:bg-[#ffdad6] hover:text-[#ba1a1a]" type="button" aria-label="Thêm tuỳ chọn">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
