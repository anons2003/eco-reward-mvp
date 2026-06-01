import Link from "next/link";
import { Ban, ChevronLeft, ChevronRight, Eye, Filter, Search, ShieldAlert, TrendingUp, UserPlus, Users, WalletCards, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const userRows = [
  {
    id: "seatech-9821",
    code: "#SEA-9821",
    name: "Nguyễn Văn An",
    district: "Quận 1, TP. HCM",
    submissions: 142,
    points: 12450,
    trust: "Cao",
    status: "Hoạt động",
    tone: "high",
  },
  {
    id: "seatech-4321",
    code: "#SEA-4321",
    name: "Trần Thị Minh",
    district: "Quận 7, TP. HCM",
    submissions: 89,
    points: 8200,
    trust: "Trung bình",
    status: "Hoạt động",
    tone: "medium",
  },
  {
    id: "seatech-1209",
    code: "#SEA-1209",
    name: "Lê Hoàng Nam",
    district: "TP. Thủ Đức",
    submissions: 12,
    points: 450,
    trust: "Thấp",
    status: "Đã chặn",
    tone: "low",
  },
  {
    id: "seatech-5522",
    code: "#SEA-5522",
    name: "Phạm Quỳnh Hoa",
    district: "Quận Bình Thạnh",
    submissions: 256,
    points: 24100,
    trust: "Cao",
    status: "Hoạt động",
    tone: "high",
  },
];

const kpis = [
  { label: "Tổng người dùng", value: "12,842", note: "+12% tháng này", Icon: Users, tone: "green" },
  { label: "Người dùng mới", value: "452", note: "Mục tiêu: 500", Icon: UserPlus, tone: "blue" },
  { label: "Người dùng rủi ro", value: "28", note: "Cần kiểm tra ngay", Icon: ShieldAlert, tone: "red" },
  { label: "Tổng điểm đã cấp", value: "1.2M", note: "Quy đổi: 120tr", Icon: WalletCards, tone: "amber" },
] as const;

export default function AdminUsersPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý người dùng</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và quản lý cộng đồng tái chế SeaTech.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e9e8e7] px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e4e2e1]" type="button">
            <Filter size={17} />
            Lọc dữ liệu
          </button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2d9cdb] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(45,156,219,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
            <UserPlus size={17} />
            Thêm người dùng
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#bbcbbb]/40 bg-white/80 shadow-[0_14px_38px_rgba(45,156,219,0.08)] backdrop-blur-md" data-admin-reveal>
        <div className="grid gap-4 border-b border-[#bbcbbb]/45 bg-[#f5f3f2]/40 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Tìm kiếm</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
                <input className="h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" placeholder="Tìm kiếm người dùng..." type="search" />
              </span>
            </label>
            <FilterSelect label="Khu vực" options={["Tất cả quận/huyện", "Quận 1", "Quận 7", "TP. Thủ Đức"]} />
            <FilterSelect label="Độ uy tín" options={["Tất cả mức độ", "Cao", "Trung bình", "Thấp"]} />
          </div>
          <p className="text-sm font-semibold text-[#3d4a3e]">
            Hiển thị <span className="font-black text-[#1b1c1b]">1 - 10</span> trong số <span className="font-black text-[#1b1c1b]">12,842</span> người dùng
          </p>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f5f3f2]/70">
                {["Người dùng", "Khu vực", "Lượt gửi", "Tổng điểm", "Độ uy tín", "Trạng thái", "Hành động"].map((heading) => (
                  <th className="border-b border-[#bbcbbb]/45 px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/35">
              {userRows.map((user) => (
                <tr className={`group transition hover:bg-[#f5f3f2]/70 ${user.tone === "low" ? "opacity-70" : ""}`} key={user.id}>
                  <td className="px-6 py-4">
                    <UserIdentity name={user.name} code={user.code} tone={user.tone} />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1b1c1b]">{user.district}</td>
                  <td className="px-6 py-4 text-sm font-black text-[#1b1c1b]">{user.submissions}</td>
                  <td className="px-6 py-4 text-sm font-black text-[#2ecc71]">{user.points.toLocaleString("vi-VN")}</td>
                  <td className="px-6 py-4">
                    <TrustPill tone={user.tone} label={user.trust} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill blocked={user.status === "Đã chặn"} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link className="grid size-9 place-items-center rounded-lg text-[#2d9cdb] transition hover:bg-[#2d9cdb]/10 active:scale-90" href={`/admin/users/${user.id}`} title="Xem chi tiết">
                        <Eye size={18} />
                      </Link>
                      <button className={`grid size-9 place-items-center rounded-lg transition active:scale-90 ${user.status === "Đã chặn" ? "text-[#2ecc71] hover:bg-[#2ecc71]/10" : "text-[#e74c3c] hover:bg-[#e74c3c]/10"}`} title={user.status === "Đã chặn" ? "Mở chặn" : "Chặn người dùng"} type="button">
                        <Ban size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {userRows.map((user) => (
            <Link className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)] transition active:scale-[0.99]" href={`/admin/users/${user.id}`} key={user.id}>
              <div className="flex items-start justify-between gap-3">
                <UserIdentity name={user.name} code={user.code} tone={user.tone} />
                <StatusPill blocked={user.status === "Đã chặn"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-bold text-[#6c7b6d]">
                <span>
                  Lượt gửi
                  <strong className="block text-base text-[#1b1c1b]">{user.submissions}</strong>
                </span>
                <span>
                  Điểm
                  <strong className="block text-base text-[#2ecc71]">{user.points.toLocaleString("vi-VN")}</strong>
                </span>
                <span>
                  Uy tín
                  <strong className="block text-base text-[#1b1c1b]">{user.trust}</strong>
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#3d4a3e]">{user.district}</p>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#bbcbbb]/45 bg-[#f5f3f2]/40 px-5 py-4">
          <button className="inline-flex items-center gap-2 text-sm font-black text-[#6c7b6d] disabled:opacity-50" disabled type="button">
            <ChevronLeft size={17} />
            Trước
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map((page) => (
              <button className={`grid size-8 place-items-center rounded-lg text-sm font-black ${page === 1 ? "bg-[#2ecc71] text-white" : "text-[#3d4a3e] hover:bg-white"}`} key={page} type="button">
                {page}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 text-sm font-black text-[#6c7b6d]" type="button">
            Tiếp
            <ChevronRight size={17} />
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-8 overflow-hidden rounded-[32px] border border-[#58bcfd]/20 bg-[#58bcfd]/10 p-8 md:grid-cols-2 md:items-center" data-admin-reveal>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-[#2c3e50]">Sức mạnh từ sự kết nối</h2>
          <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-[#3d4a3e]">Mỗi người dùng trong hệ thống là một đại sứ môi trường. Nhóm uy tín cao đang chiếm phần lớn cộng đồng SeaTech.</p>
          <div className="mt-6 flex gap-8">
            <ImpactMetric value="8.4 Tấn" label="Rác thải đã thu gom" />
            <ImpactMetric value="15.2k" label="Cây xanh được bảo vệ" />
          </div>
        </div>
        <div className="relative min-h-60 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_35%_35%,rgba(46,204,113,0.32),transparent_28%),linear-gradient(135deg,#e8f5ff,#edf6ed)] shadow-2xl transition duration-700 hover:rotate-0 md:rotate-2">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
          <Users className="absolute right-8 top-8 text-[#006d37]/18" size={150} />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-white/88 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-black text-[#006d37]">65% uy tín cao</p>
            <p className="mt-1 text-xs font-semibold text-[#3d4a3e]">Cộng đồng minh bạch hơn mỗi tuần</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <select className="h-11 rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function KpiCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "green" | "blue" | "red" | "amber" }) {
  const toneClass = {
    green: "border-l-[#2ecc71] bg-[#2ecc71]/10 text-[#006d37]",
    blue: "border-l-[#2d9cdb] bg-[#2d9cdb]/10 text-[#006492]",
    red: "border-l-[#e74c3c] bg-[#ffdad6]/35 text-[#ba1a1a]",
    amber: "border-l-[#f39c12] bg-[#ffe084]/35 text-[#735c00]",
  }[tone];

  return (
    <article className="flex items-center justify-between rounded-2xl border border-white/60 border-l-4 bg-white/82 p-6 shadow-[0_12px_34px_rgba(45,156,219,0.08)] backdrop-blur-md" data-admin-reveal>
      <div>
        <p className="text-sm font-black text-[#3d4a3e]">{label}</p>
        <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#1b1c1b]">{value}</h2>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-black text-current">
          <TrendingUp size={14} />
          {note}
        </p>
      </div>
      <span className={`grid size-14 place-items-center rounded-full border-l-4 ${toneClass}`}>
        <Icon size={26} />
      </span>
    </article>
  );
}

function UserIdentity({ name, code, tone }: { name: string; code: string; tone: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-black ${tone === "low" ? "border-[#e74c3c]/15 bg-[#ffdad6]/35 text-[#ba1a1a] grayscale" : "border-[#2ecc71]/15 bg-[#6bfe9c]/20 text-[#006d37]"}`}>
        {name.slice(0, 1)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-[#1b1c1b]">{name}</span>
        <span className="block text-xs font-semibold text-[#6c7b6d]">{code}</span>
      </span>
    </span>
  );
}

function TrustPill({ tone, label }: { tone: string; label: string }) {
  const className = {
    high: "bg-[#2ecc71]/18 text-[#1e8449]",
    medium: "bg-[#58bcfd]/16 text-[#006492]",
    low: "bg-[#ffdad6]/50 text-[#ba1a1a]",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatusPill({ blocked }: { blocked: boolean }) {
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${blocked ? "bg-[#ffdad6]/55 text-[#ba1a1a]" : "bg-[#2ecc71]/12 text-[#2ecc71]"}`}>{blocked ? "Đã chặn" : "Hoạt động"}</span>;
}

function ImpactMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-black tracking-[-0.04em] text-[#2ecc71]">{value}</p>
      <p className="text-xs font-black text-[#3d4a3e]">{label}</p>
    </div>
  );
}
