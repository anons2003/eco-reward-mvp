import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit, Eye, Filter, Plus, QrCode, RefreshCw, Search, Trash2, Wrench, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";
import { seaTechService } from "@/application/services/seatech-service";

const operations = [
  {
    code: "BIN-HCM-042",
    name: "SeaBin - Diamond Plaza",
    location: "34 Lê Duẩn, Quận 1, TP.HCM",
    status: "Hoạt động",
    capacity: 95,
    uses: 1248,
    state: "full",
  },
  {
    code: "BIN-HCM-015",
    name: "SeaBin - CV Tao Đàn",
    location: "Cổng chính Trương Định, Quận 1",
    status: "Bảo trì",
    capacity: 12,
    uses: 3502,
    state: "maintenance",
  },
  {
    code: "BIN-TD-088",
    name: "SeaBin - Làng Đại Học",
    location: "Khu C-D ĐHQG, Thủ Đức",
    status: "Hoạt động",
    capacity: 45,
    uses: 856,
    state: "normal",
  },
  {
    code: "BIN-BT-022",
    name: "SeaBin - Landmark 81",
    location: "Công viên Vinhomes, Bình Thạnh",
    status: "Hoạt động",
    capacity: 68,
    uses: 5112,
    state: "normal",
  },
  {
    code: "BIN-Q3-009",
    name: "SeaBin - Hồ Con Rùa",
    location: "Vòng xoay Công trường Quốc tế, Q3",
    status: "Ngưng hoạt động",
    capacity: null,
    uses: 451,
    state: "offline",
  },
];

const statCards = [
  { label: "Tổng số thùng", value: "42", note: "+2 tuần này", Icon: Trash2, tone: "blue" },
  { label: "Đang hoạt động", value: "38", note: "90% hoạt động", Icon: Eye, tone: "green" },
  { label: "Cần bảo trì", value: "3", note: "Ưu tiên thấp", Icon: Wrench, tone: "amber" },
  { label: "Đầy rác", value: "1", note: "Cần thu gom", Icon: Filter, tone: "red" },
] as const;

export default function AdminBinsPage() {
  const bins = seaTechService.listBins();

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý Thùng rác</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và vận hành mạng lưới thùng rác thông minh SeaTech.</p>
        </div>
        <button className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#2ecc71] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(46,204,113,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
          <Plus size={18} />
          Thêm thùng mới
        </button>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid-flow-dense grid gap-4 lg:grid-cols-12" data-admin-reveal>
        <div className="rounded-2xl border border-[#bbcbbb]/45 bg-white/80 p-4 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-8">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
              <input className="h-11 w-full rounded-xl border border-[#bbcbbb]/60 bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20" placeholder="Tìm kiếm mã thùng, tên hoặc địa điểm..." type="search" />
            </label>
            <FilterSelect label="Trạng thái" options={["Tất cả", "Hoạt động", "Bảo trì", "Ngưng hoạt động"]} />
            <FilterSelect label="Khu vực" options={["Tất cả Quận/Huyện", "Quận 1", "Bình Thạnh", "Thủ Đức"]} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#bbcbbb]/45 bg-white/80 p-4 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-4">
          <span className="text-sm font-semibold text-[#3d4a3e]">Demo store: {bins.length} thùng seed</span>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-black text-[#006d37] transition hover:bg-[#006d37]/8" type="button">
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-[#bbcbbb]/30 bg-[#f5f3f2]">
              <tr>
                {["Mã thùng", "Tên & địa điểm", "Trạng thái", "Dung lượng", "Lượt dùng", "Hành động"].map((heading) => (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {operations.map((bin) => (
                <tr className="transition hover:bg-[#2ecc71]/5" key={bin.code}>
                  <td className="px-6 py-5 font-mono text-sm font-black text-[#006492]">{bin.code}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-[#2c3e50]">{bin.name}</p>
                    <p className="mt-1 text-xs font-semibold text-[#3d4a3e]">{bin.location}</p>
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill state={bin.state} label={bin.status} />
                  </td>
                  <td className="px-6 py-5">
                    <CapacityBar value={bin.capacity} />
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-[#1b1c1b]">{bin.uses.toLocaleString("vi-VN")}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link className="grid size-9 place-items-center rounded-lg text-[#3d4a3e] transition hover:bg-[#e9e8e7]" href={`/admin/bins/${bin.code.toLowerCase()}`} title="Chi tiết">
                        <Eye size={18} />
                      </Link>
                      <button className="grid size-9 place-items-center rounded-lg text-[#3d4a3e] transition hover:bg-[#e9e8e7]" title="Tải QR" type="button">
                        <QrCode size={18} />
                      </button>
                      <button className="grid size-9 place-items-center rounded-lg text-[#3d4a3e] transition hover:bg-[#e9e8e7]" title="Chỉnh sửa" type="button">
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {operations.map((bin) => (
            <Link className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)] transition active:scale-[0.99]" href={`/admin/bins/${bin.code.toLowerCase()}`} key={bin.code}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-black text-[#006492]">{bin.code}</p>
                  <h2 className="mt-1 text-base font-black text-[#2c3e50]">{bin.name}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#3d4a3e]">{bin.location}</p>
                </div>
                <StatusPill state={bin.state} label={bin.status} />
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
                <CapacityBar value={bin.capacity} />
                <span className="text-sm font-black text-[#1b1c1b]">{bin.uses.toLocaleString("vi-VN")} lượt</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/30 bg-[#f5f3f2] px-6 py-4 md:flex-row">
          <p className="text-sm font-semibold text-[#3d4a3e]">Hiển thị 1 - 10 trên tổng số 42 thùng rác</p>
          <div className="flex gap-2">
            <button className="grid size-10 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#3d4a3e]" type="button">
              <ChevronLeft size={17} />
            </button>
            {[1, 2, 3].map((page) => (
              <button className={`grid size-10 place-items-center rounded-lg text-sm font-black ${page === 1 ? "bg-[#006d37] text-white" : "text-[#3d4a3e] hover:bg-white"}`} key={page} type="button">
                {page}
              </button>
            ))}
            <button className="grid size-10 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#3d4a3e]" type="button">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</span>
      <select className="h-11 rounded-xl border border-[#bbcbbb]/60 bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "blue" | "green" | "amber" | "red" }) {
  const toneClass = {
    blue: "bg-[#006492]/10 text-[#006492]",
    green: "bg-[#2ecc71]/10 text-[#2ecc71]",
    amber: "bg-[#f39c12]/10 text-[#f39c12]",
    red: "bg-[#e74c3c]/10 text-[#e74c3c]",
  }[tone];

  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
      <div className="mb-4 flex items-start justify-between">
        <span className={`grid size-12 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={22} />
        </span>
        <span className={`text-xs font-black ${toneClass.split(" ")[1]}`}>{note}</span>
      </div>
      <p className="text-sm font-black text-[#3d4a3e]">{label}</p>
      <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
    </article>
  );
}

function StatusPill({ state, label }: { state: string; label: string }) {
  const className = {
    full: "bg-[#2ecc71]/10 text-[#2ecc71]",
    normal: "bg-[#2ecc71]/10 text-[#2ecc71]",
    maintenance: "bg-[#f39c12]/12 text-[#f39c12]",
    offline: "bg-[#e4e2e1] text-[#3d4a3e]",
  }[state];

  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${className}`}>
      <span className="size-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

function CapacityBar({ value }: { value: number | null }) {
  const color = value === null ? "bg-[#dbdad9]" : value > 85 ? "bg-[#e74c3c]" : value > 60 ? "bg-[#2d9cdb]" : "bg-[#2ecc71]";

  return (
    <div className="min-w-[120px]">
      <div className="mb-1 text-xs font-black text-[#3d4a3e]">{value === null ? "--" : `${value}%`}</div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e9e8e7]">
        <div data-admin-bar className={`h-full rounded-full ${color}`} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}
