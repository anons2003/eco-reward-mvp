import { BarChart3, ChevronLeft, ChevronRight, Edit, Grid2X2, List, MapPin, Navigation, Plus, Recycle, School, Store, Trees, Warehouse } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const locations = [
  {
    name: "Công viên Tao Đàn",
    address: "55C Nguyễn Thị Minh Khai",
    district: "Quận 1",
    bins: 8,
    submissions: 1240,
    status: "Hoạt động",
    Icon: Trees,
    tone: "green",
  },
  {
    name: "Chung cư Vinhomes Central Park",
    address: "208 Nguyễn Hữu Cảnh",
    district: "Quận Bình Thạnh",
    bins: 15,
    submissions: 3850,
    status: "Hoạt động",
    Icon: Warehouse,
    tone: "green",
  },
  {
    name: "Siêu thị Co.opmart Lý Thường Kiệt",
    address: "497 Lý Thường Kiệt",
    district: "Quận 10",
    bins: 4,
    submissions: 920,
    status: "Tạm dừng",
    Icon: Store,
    tone: "amber",
  },
  {
    name: "Đại học Bách Khoa TP.HCM",
    address: "268 Lý Thường Kiệt",
    district: "Quận 10",
    bins: 12,
    submissions: 5102,
    status: "Hoạt động",
    Icon: School,
    tone: "green",
  },
];

export default function AdminLocationsPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý Địa điểm</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và quản lý các điểm thu gom rác thải thông minh trên toàn hệ thống SeaTech.</p>
        </div>
        <button className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#2ecc71] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(46,204,113,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
          <Plus size={18} />
          Thêm địa điểm mới
        </button>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <article className="group relative min-h-[450px] overflow-hidden rounded-xl border border-[#bbcbbb]/30 bg-white shadow-[0_12px_34px_rgba(45,156,219,0.08)] lg:col-span-8" data-admin-reveal>
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <MapBadge color="bg-[#2ecc71]" label="24 Đang hoạt động" />
            <MapBadge color="bg-[#f39c12]" label="2 Cần bảo trì" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_44%,rgba(46,204,113,0.34),transparent_10%),radial-gradient(circle_at_58%_32%,rgba(243,156,18,0.34),transparent_9%),linear-gradient(135deg,#edf6ed_0%,#e8f5ff_48%,#fbf9f8_100%)] transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(0,109,55,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.14)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c1b]/18 to-transparent" />
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            {["+", "-", "◎"].map((control) => (
              <button className="grid size-10 place-items-center rounded-lg bg-white text-lg font-black text-[#1b1c1b] shadow-md transition hover:bg-[#fbf9f8]" key={control} type="button">
                {control}
              </button>
            ))}
          </div>
          <div className="absolute left-[28%] top-[44%] z-10 grid size-9 place-items-center rounded-full bg-[#2ecc71] text-white shadow-[0_0_0_10px_rgba(46,204,113,0.20)]">
            <MapPin size={18} fill="currentColor" />
          </div>
          <div className="absolute left-[58%] top-[32%] z-10 grid size-8 place-items-center rounded-full bg-[#f39c12] text-white shadow-[0_0_0_8px_rgba(243,156,18,0.18)]">
            <MapPin size={16} fill="currentColor" />
          </div>
        </article>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <MetricPanel tone="green" label="Tổng rác thu gom" value="4.2 tấn" note="+12%" Icon={Recycle} />
          <MetricPanel tone="blue" label="Mật độ bao phủ" value="78%" note="26 Điểm" Icon={Navigation} />
        </aside>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#bbcbbb]/30 bg-white shadow-[0_12px_34px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="flex flex-col gap-4 border-b border-[#bbcbbb]/30 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#bbcbbb]/50 bg-[#fbf9f8] px-4 text-sm font-black text-[#3d4a3e] transition hover:border-[#006d37]" type="button">
              <List size={18} />
              Tất cả Quận/Huyện
            </button>
            <button className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#bbcbbb]/50 bg-[#fbf9f8] px-4 text-sm font-black text-[#3d4a3e] transition hover:border-[#006d37]" type="button">
              <BarChart3 size={18} />
              Sắp xếp: Lượt gửi cao nhất
            </button>
          </div>
          <div className="flex w-fit rounded-lg bg-[#efedec] p-1">
            <button className="grid size-10 place-items-center rounded-md bg-white text-[#006d37] shadow-sm" type="button" aria-label="Danh sách">
              <List size={18} />
            </button>
            <button className="grid size-10 place-items-center rounded-md text-[#3d4a3e] transition hover:text-[#006d37]" type="button" aria-label="Lưới">
              <Grid2X2 size={18} />
            </button>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="border-b border-[#bbcbbb]/30 bg-[#fbf9f8]">
              <tr>
                {["Tên địa điểm", "Khu vực", "Số thùng", "Tổng lượt gửi", "Trạng thái", "Thao tác"].map((heading) => (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {locations.map((location) => (
                <LocationRow key={location.name} location={location} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {locations.map((location) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={location.name}>
              <div className="flex items-start gap-3">
                <LocationIcon Icon={location.Icon} tone={location.tone} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-black text-[#2c3e50]">{location.name}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{location.address}</p>
                </div>
                <StatusPill paused={location.status !== "Hoạt động"} label={location.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <SmallStat label="Khu vực" value={location.district} />
                <SmallStat label="Thùng" value={location.bins.toString().padStart(2, "0")} />
                <SmallStat label="Lượt gửi" value={location.submissions.toLocaleString("vi-VN")} />
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/30 p-5 md:flex-row">
          <p className="text-sm font-semibold text-[#6c7b6d]">Hiển thị 1 - 4 trên 26 địa điểm</p>
          <div className="flex items-center gap-2">
            <button className="grid size-8 place-items-center rounded-lg text-[#6c7b6d] opacity-50" disabled type="button">
              <ChevronLeft size={17} />
            </button>
            {[1, 2, 3].map((page) => (
              <button className={`grid size-8 place-items-center rounded-lg text-sm font-black ${page === 1 ? "bg-[#006d37] text-white" : "text-[#3d4a3e] hover:bg-[#fbf9f8]"}`} key={page} type="button">
                {page}
              </button>
            ))}
            <button className="grid size-8 place-items-center rounded-lg text-[#3d4a3e] hover:bg-[#fbf9f8]" type="button">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center gap-4 py-10 text-[#6c7b6d]" data-admin-reveal>
        <Recycle size={44} />
        <div className="h-10 w-px bg-[#bbcbbb]/40" />
        <p className="text-xl font-black italic tracking-[-0.04em]">Vì một Việt Nam Xanh hơn</p>
      </section>
    </div>
  );
}

function MapBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/82 px-4 py-2 text-xs font-black text-[#1b1c1b] shadow-sm backdrop-blur-md">
      <span className={`size-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function MetricPanel({ tone, label, value, note, Icon }: { tone: "green" | "blue"; label: string; value: string; note: string; Icon: typeof Recycle }) {
  const className = tone === "green" ? "border-[#006d37]/10 bg-[#006d37]/5 text-[#006d37]" : "border-[#006492]/10 bg-[#006492]/5 text-[#006492]";

  return (
    <article className={`flex min-h-[213px] flex-col justify-between rounded-xl border p-6 ${className}`} data-admin-reveal>
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-xl bg-white shadow-sm">
          <Icon size={24} />
        </span>
        <span className="text-sm font-black">{note}</span>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#3d4a3e]">{label}</p>
        <h2 className="mt-1 text-5xl font-black tracking-[-0.06em]">{value}</h2>
      </div>
    </article>
  );
}

function LocationRow({ location }: { location: (typeof locations)[number] }) {
  return (
    <tr className="transition hover:bg-[#fbf9f8]/70">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <LocationIcon Icon={location.Icon} tone={location.tone} />
          <div>
            <p className="text-sm font-black text-[#2c3e50]">{location.name}</p>
            <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{location.address}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-[#3d4a3e]">{location.district}</td>
      <td className="px-6 py-4 text-center">
        <span className="inline-grid size-8 place-items-center rounded-full border border-[#006d37]/20 bg-[#fbf9f8] text-sm font-black text-[#006d37]">{location.bins.toString().padStart(2, "0")}</span>
      </td>
      <td className="px-6 py-4 text-center text-sm font-black text-[#2c3e50]">{location.submissions.toLocaleString("vi-VN")}</td>
      <td className="px-6 py-4">
        <StatusPill paused={location.status !== "Hoạt động"} label={location.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button className="grid size-9 place-items-center rounded-lg text-[#2d9cdb] transition hover:bg-[#2d9cdb]/10" title="Xem danh sách thùng" type="button">
            <Trash2Like />
          </button>
          <button className="grid size-9 place-items-center rounded-lg text-[#006d37] transition hover:bg-[#006d37]/10" title="Chỉnh sửa" type="button">
            <Edit size={18} />
          </button>
          <button className="grid size-9 place-items-center rounded-lg text-[#006492] transition hover:bg-[#006492]/10" title="Xem báo cáo" type="button">
            <BarChart3 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Trash2Like() {
  return <MapPin size={18} />;
}

function LocationIcon({ Icon, tone }: { Icon: typeof Trees; tone: string }) {
  return (
    <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone === "amber" ? "bg-[#f39c12]/10 text-[#f39c12]" : "bg-[#006d37]/10 text-[#006d37]"}`}>
      <Icon size={19} />
    </span>
  );
}

function StatusPill({ paused, label }: { paused: boolean; label: string }) {
  return <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black ${paused ? "border-[#f39c12]/30 bg-[#f39c12]/18 text-[#574500]" : "border-[#2ecc71]/30 bg-[#2ecc71]/18 text-[#005027]"}`}>{label}</span>;
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl bg-[#fbf9f8] p-3">
      <span className="block text-[10px] font-black uppercase text-[#6c7b6d]">{label}</span>
      <span className="mt-1 block truncate text-sm font-black text-[#1b1c1b]">{value}</span>
    </span>
  );
}
