import Link from "next/link";
import { ArrowLeft, Bolt, CheckCircle2, Download, Edit, ExternalLink, History, Info, MapPin, QrCode, RadioTower, Settings, Trash2, Wrench } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const weeklyBars = [12, 18, 25, 30, 15, 20, 10];
const activityRows = [
  ["Hôm nay, 10:24 AM", "Gửi rác", "Gửi 0.4kg Nhựa (Chai PET)", "Lê Minh Tuấn", "AI Đã xác thực", "green"],
  ["Hôm nay, 08:15 AM", "Thu gom", "Làm trống thùng (Capacity reset)", "NV. Nguyễn Văn A", "Hoàn tất", "blue"],
  ["Hôm qua, 05:42 PM", "Cảnh báo", "Dung lượng vượt ngưỡng 80%", "Hệ thống", "Đã thông báo", "amber"],
  ["14/05/2024, 09:00 AM", "Bảo trì", "Vệ sinh cảm biến & thay pin solar", "Kỹ thuật viên 04", "Đã kiểm định", "neutral"],
] as const;

export default async function AdminBinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const code = id.toUpperCase().replaceAll("-", "-");

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between" data-admin-reveal>
        <div>
          <Link className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[#6c7b6d] transition hover:text-[#006d37]" href="/admin/bins">
            <ArrowLeft size={17} />
            Quản lý thùng rác
          </Link>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Thông tin chi tiết: {code}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#2ecc71]/12 px-3 py-1 text-xs font-black text-[#005027]">
              <CheckCircle2 size={15} />
              Hoạt động tốt
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#58bcfd]/16 px-3 py-1 text-xs font-black text-[#004a6d]">
              <MapPin size={15} />
              Quận 1, TP.HCM
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton label="Chỉnh sửa" Icon={Edit} tone="white" />
          <ActionButton label="Bảo trì" Icon={Wrench} tone="amber" />
          <ActionButton label="Xóa" Icon={Trash2} tone="red" />
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <div className="grid gap-6 lg:col-span-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#3d4a3e]">
                <RadioTower className="text-[#006d37]" size={18} />
                Trạng thái hiện tại
              </h2>
              <span className="text-xs font-semibold italic text-[#6c7b6d]">Cập nhật 2 phút trước</span>
            </div>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm font-black">
                  <span>Dung lượng rác</span>
                  <span className="text-[#ba1a1a]">85%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#efedec]">
                  <div data-admin-bar className="h-full rounded-full bg-gradient-to-r from-[#2d9cdb] to-[#2ecc71]" style={{ width: "85%" }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-[#6c7b6d]">Sắp đầy, cần thu gom sớm</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MiniStatus label="Kết nối" value="Ổn định (5G)" Icon={RadioTower} />
                <MiniStatus label="Pin/Năng lượng" value="92% Solar" Icon={Bolt} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <h2 className="mb-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#3d4a3e]">
              <Info className="text-[#006d37]" size={18} />
              Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              <InfoRow label="Mã thùng" value={code} />
              <InfoRow label="Tên hiển thị" value="Thùng rác Bưu điện TP" />
              <InfoRow label="Ngày lắp đặt" value="12/05/2023" />
              <div className="pt-2">
                <span className="mb-2 block text-xs font-semibold text-[#6c7b6d]">Loại rác hỗ trợ</span>
                <div className="flex flex-wrap gap-2">
                  {["Nhựa", "Kim loại", "Giấy"].map((type) => (
                    <span className="rounded-lg bg-[#efedec] px-3 py-1 text-xs font-black text-[#3d4a3e]" key={type}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:col-span-2" data-admin-reveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Hiệu suất tuần qua</p>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#1b1c1b]">248 lượt gửi</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#6c7b6d]">Tổng rác thu gom</p>
                <p className="text-3xl font-black tracking-[-0.04em] text-[#006d37]">42.5 kg</p>
              </div>
            </div>
            <div className="flex h-48 items-end justify-between gap-4 px-4">
              {weeklyBars.map((value, index) => (
                <div className="group relative flex flex-1 items-end" key={index}>
                  <span data-admin-bar className="w-full rounded-t-lg bg-[#006d37]" style={{ height: `${Math.max(18, value * 5)}%`, opacity: 0.18 + index * 0.11 }} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between px-4 text-xs font-black text-[#6c7b6d]">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </article>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <article className="overflow-hidden rounded-2xl border border-[#bbcbbb]/30 bg-white shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <div className="relative h-48 bg-[radial-gradient(circle_at_48%_46%,rgba(46,204,113,0.34),transparent_12%),linear-gradient(135deg,#e8f5ff_0%,#edf6ed_56%,#fbf9f8_100%)]">
              <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(0,109,55,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#006d37] text-white shadow-[0_0_0_12px_rgba(0,109,55,0.16)]">
                <MapPin size={22} fill="currentColor" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c1b]/34 to-transparent" />
              <button className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-xs font-black text-[#006d37] backdrop-blur transition hover:bg-white" type="button">
                <ExternalLink size={15} />
                Mở Maps
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-black text-[#1b1c1b]">Vị trí: 02 Công xã Paris, Phường Bến Nghé, Quận 1</p>
              <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">Gần cổng chính Bưu điện thành phố</p>
            </div>
          </article>

          <article className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 text-center shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <h2 className="mb-4 text-left text-sm font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Mã QR của thùng</h2>
            <div className="mx-auto mb-4 grid size-48 place-items-center rounded-xl border-4 border-[#006d37]/10 bg-[#fbf9f8] p-4">
              <QrCode size={132} strokeWidth={1.8} className="text-[#006d37]" />
            </div>
            <p className="mb-6 text-xs font-semibold text-[#6c7b6d]">Mã định danh duy nhất cho việc quét tại trạm</p>
            <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#006d37] text-sm font-black text-white transition hover:scale-[1.02] active:scale-[0.98]" type="button">
              <Download size={17} />
              Tải xuống QR
            </button>
          </article>
        </aside>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#bbcbbb]/30 bg-white shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
        <div className="flex items-center justify-between border-b border-[#bbcbbb]/25 p-6">
          <h2 className="inline-flex items-center gap-3 text-2xl font-black tracking-[-0.03em] text-[#2c3e50]">
            <History className="text-[#006d37]" size={24} />
            Lịch sử hoạt động gần đây
          </h2>
          <button className="text-sm font-black text-[#006d37]" type="button">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fbf9f8]">
              <tr>
                {["Thời gian", "Hành động", "Chi tiết", "Người dùng/NV", "Trạng thái"].map((heading) => (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {activityRows.map(([time, action, detail, actor, status, tone]) => (
                <tr className="transition hover:bg-[#fbf9f8]" key={`${time}-${action}`}>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1b1c1b]">{time}</td>
                  <td className="px-6 py-4"><ActivityPill label={action} tone={tone} /></td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1b1c1b]">{detail}</td>
                  <td className="px-6 py-4 text-sm font-black text-[#1b1c1b]">{actor}</td>
                  <td className="px-6 py-4 text-sm font-black text-[#3d4a3e]">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button className="fixed bottom-8 right-8 z-50 hidden size-16 place-items-center rounded-full bg-[#006d37] text-white shadow-[0_18px_40px_rgba(0,109,55,0.24)] transition hover:scale-110 active:scale-95 lg:grid" type="button" aria-label="Hỗ trợ kỹ thuật">
        <Settings size={28} />
      </button>
    </div>
  );
}

function ActionButton({ label, Icon, tone }: { label: string; Icon: typeof Edit; tone: "white" | "amber" | "red" }) {
  const className = {
    white: "border border-[#bbcbbb] bg-white text-[#1b1c1b] hover:bg-[#f5f3f2]",
    amber: "bg-[#f39c12] text-white hover:scale-[1.03]",
    red: "bg-[#ba1a1a] text-white hover:scale-[1.03]",
  }[tone];

  return (
    <button className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-black shadow-sm transition active:scale-[0.98] ${className}`} type="button">
      <Icon size={17} />
      {label}
    </button>
  );
}

function MiniStatus({ label, value, Icon }: { label: string; value: string; Icon: typeof RadioTower }) {
  return (
    <div className="rounded-xl bg-[#fbf9f8] p-3">
      <p className="text-xs font-semibold text-[#6c7b6d]">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm font-black text-[#006d37]">
        <Icon size={17} />
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#bbcbbb]/25 py-2">
      <span className="text-sm font-semibold text-[#6c7b6d]">{label}</span>
      <span className="text-right text-sm font-black text-[#1b1c1b]">{value}</span>
    </div>
  );
}

function ActivityPill({ label, tone }: { label: string; tone: string }) {
  const className = {
    green: "bg-[#2ecc71]/12 text-[#1e8449]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
    neutral: "bg-[#e4e2e1] text-[#3d4a3e]",
  }[tone];

  return <span className={`rounded px-2 py-1 text-xs font-black ${className}`}>{label}</span>;
}
