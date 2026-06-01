import { ChevronLeft, ChevronRight, Copy, Filter, Lock, MapPin, RefreshCw, Radar, ShieldAlert, ShieldCheck, Timer, UserLock, Zap, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const metrics = [
  { label: "Cảnh báo mới", value: "24", note: "+12%", Icon: ShieldAlert, tone: "red" },
  { label: "Sai lệch vị trí", value: "15", note: "Scan xa", Icon: MapPin, tone: "blue" },
  { label: "Ảnh trùng lặp", value: "08", note: "Ảnh trùng", Icon: Copy, tone: "amber" },
  { label: "Spam lượt gửi", value: "01", note: "Nhanh", Icon: Zap, tone: "green" },
] as const;

const alerts = [
  { time: "Hôm nay, 14:25", date: "12/10/2023", handle: "sea_8812", name: "Nguyễn Văn A", issue: "Người dùng quét QR quá xa vị trí thùng", detail: "Khoảng cách: 2.5km so với tọa độ SeaBin #442", risk: "Cao", tone: "red", Icon: MapPin },
  { time: "Hôm nay, 13:10", date: "12/10/2023", handle: "seatech_09", name: "Trần Thị B", issue: "Ảnh rác bị trùng lặp với lượt gửi cũ", detail: "AI khớp 98.4% với lượt gửi #9901", risk: "Trung bình", tone: "amber", Icon: Copy },
  { time: "Hôm qua, 22:45", date: "11/10/2023", handle: "green_life_22", name: "Lê Văn C", issue: "Tài khoản gửi quá nhiều lượt trong thời gian ngắn", detail: "15 lượt gửi trong vòng 2 phút", risk: "Thấp", tone: "neutral", Icon: Timer },
] as const;

export default function AdminFraudAlertsPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Cảnh báo gian lận</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và xử lý các hành vi bất thường trong hệ thống SeaTech để đảm bảo tính minh bạch của chương trình.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#efedec] px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e4e2e1]" type="button">
            <Filter size={17} />
            Lọc dữ liệu
          </button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
            <RefreshCw size={17} />
            Cập nhật danh sách
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_16px_44px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="flex flex-col gap-4 border-b border-[#bbcbbb]/25 bg-[#fbf9f8] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-xl font-black tracking-[-0.03em] text-[#2c3e50]">Danh sách cảnh báo hiện tại</h2>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-black text-[#ba1a1a]">9 Cao</span>
            <span className="rounded-full bg-[#f39c12]/14 px-3 py-1 text-xs font-black text-[#735c00]">12 Trung bình</span>
            <span className="rounded-full bg-[#efedec] px-3 py-1 text-xs font-black text-[#6c7b6d]">3 Thấp</span>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="bg-[#f5f3f2]">
              <tr>
                {["Thời gian", "Người dùng / ID", "Loại hành vi bất thường", "Mức độ rủi ro", "Thao tác"].map((heading) => (
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e] ${heading === "Mức độ rủi ro" ? "text-center" : ""} ${heading === "Thao tác" ? "text-right" : ""}`} key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {alerts.map((alert) => (
                <tr className="group transition hover:bg-[#fbf9f8]" key={`${alert.handle}-${alert.time}`}>
                  <td className="px-6 py-6">
                    <p className="text-sm font-black text-[#1b1c1b]">{alert.time}</p>
                    <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{alert.date}</p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-[#0b1f18] text-xs font-black text-white">{alert.name.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-black text-[#006492]">{alert.handle}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#6c7b6d]">{alert.name}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-[#2c3e50]">{alert.issue}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6c7b6d]">
                        <alert.Icon size={14} />
                        {alert.detail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center"><RiskPill label={alert.risk} tone={alert.tone} /></td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                      <button className="rounded-lg px-3 py-1.5 text-xs font-black text-[#006d37] transition hover:bg-[#006d37]/10" type="button">Chi tiết</button>
                      <button className="inline-flex items-center gap-1 rounded-lg bg-[#ba1a1a] px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:brightness-110" type="button">
                        <Lock size={14} />
                        Khóa tài khoản tạm thời
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {alerts.map((alert) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={alert.handle}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#006492]">{alert.handle}</p>
                  <h2 className="mt-1 text-sm font-black text-[#2c3e50]">{alert.issue}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{alert.detail}</p>
                </div>
                <RiskPill label={alert.risk} tone={alert.tone} />
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/25 bg-[#fbf9f8] px-6 py-5 md:flex-row">
          <p className="text-xs font-semibold text-[#6c7b6d]">Hiển thị 3 trên 24 kết quả</p>
          <div className="flex items-center gap-2">
            <button className="grid size-8 place-items-center rounded-lg text-[#6c7b6d] opacity-50" disabled type="button"><ChevronLeft size={17} /></button>
            {[1, 2, 3].map((page) => (
              <button className={`grid size-8 place-items-center rounded text-sm font-black ${page === 1 ? "bg-[#006d37] text-white" : "text-[#3d4a3e] hover:bg-white"}`} key={page} type="button">{page}</button>
            ))}
            <button className="grid size-8 place-items-center rounded-lg text-[#3d4a3e] hover:bg-white" type="button"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-2" data-admin-reveal>
        <article className="relative overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white p-8 shadow-[0_12px_34px_rgba(45,156,219,0.06)]">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[#2c3e50]">Hệ thống AI đang giám sát</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#3d4a3e]">Mô hình AI liên tục phân tích hình ảnh, GPS và tốc độ gửi để ngăn chặn mọi hành vi trục lợi điểm thưởng.</p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[ShieldCheck, ShieldAlert, UserLock].map((Icon, index) => (
                  <span className={`grid size-10 place-items-center rounded-full border-2 border-white text-white ${index === 1 ? "bg-[#2d9cdb]" : "bg-[#006d37]"}`} key={index}>
                    <Icon size={19} />
                  </span>
                ))}
              </div>
              <span className="text-sm font-black text-[#1b1c1b]">Bảo vệ 24/7</span>
            </div>
          </div>
          <ShieldCheck className="absolute -right-8 -top-8 rotate-12 text-[#006d37]/10" size={220} />
        </article>

        <article className="rounded-3xl border border-[#006d37]/10 bg-[#006d37]/6 p-8 shadow-[0_12px_34px_rgba(45,156,219,0.06)]">
          <div className="flex flex-col gap-6 md:flex-row">
            <span className="relative grid size-32 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-xl">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(46,204,113,0.30),transparent_30%),linear-gradient(135deg,#e8f5ff,#edf6ed)]" />
              <span className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
              <Radar className="relative text-[#006d37]" size={54} />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.03em] text-[#006d37]">Bảo vệ hệ sinh thái</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#3d4a3e]">Mỗi cảnh báo được xử lý đúng cách giúp SeaTech duy trì giá trị cốt lõi: làm sạch môi trường một cách trung thực.</p>
              <button className="mt-5 text-sm font-black text-[#006d37]" type="button">Xem báo cáo tác động</button>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#ffdad6] text-[#ba1a1a]"><UserLock size={28} /></span>
            <div>
              <h2 className="text-xl font-black tracking-[-0.03em] text-[#2c3e50]">Xác nhận khóa tài khoản?</h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#6c7b6d]">Tài khoản sẽ bị tạm dừng hoạt động đổi thưởng và tích điểm trong 24h để phục vụ điều tra.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-[#efedec] px-5 py-3 text-sm font-black text-[#3d4a3e]" type="button">Hủy</button>
            <button className="rounded-full bg-[#ba1a1a] px-5 py-3 text-sm font-black text-white" type="button">Xác nhận khóa</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "red" | "blue" | "amber" | "green" }) {
  const className = {
    red: "bg-[#ffdad6] text-[#ba1a1a]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
    green: "bg-[#006d37]/10 text-[#006d37]",
  }[tone];

  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] transition hover:shadow-[0_16px_38px_rgba(45,156,219,0.10)]" data-admin-reveal>
      <div className="mb-4 flex items-start justify-between">
        <span className={`grid size-12 place-items-center rounded-xl ${className}`}>
          <Icon size={22} />
        </span>
        <span className={`text-xs font-black ${className.split(" ")[1]}`}>{note}</span>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
      <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
    </article>
  );
}

function RiskPill({ label, tone }: { label: string; tone: string }) {
  const className = {
    red: "bg-[#ba1a1a] text-white",
    amber: "bg-[#f39c12] text-white",
    neutral: "bg-[#e4e2e1] text-[#3d4a3e]",
  }[tone];
  return <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black ${className}`}>{label}</span>;
}
