import { Bell, Bot, CheckCircle2, Clock, Mail, MessageSquare, RefreshCw, RotateCcw, Save, ShieldCheck, Smartphone, Sparkles, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const notificationRows = [
  { label: "Nhắc thưởng thành công", checked: true },
  { label: "Nhắc nhở chiến dịch mới", checked: true },
  { label: "Trạm đầy rác (>80%)", checked: true },
  { label: "Cảnh báo nhiệt độ cao", checked: false },
];

export default function AdminSettingsPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Cấu hình hệ thống</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Quản lý các quy tắc vận hành, ngưỡng AI và thông báo hệ thống SeaTech.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bbcbbb]/60 bg-white px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#efedec]" type="button">
            <RotateCcw size={17} />
            Hủy thay đổi
          </button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0b1f18] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(11,31,24,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
            <Save size={17} />
            Lưu cấu hình
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <article className="relative overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white p-7 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <div className="absolute right-0 top-0 size-44 rounded-bl-full bg-[#2d9cdb]/8" />
            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#2d9cdb]/10 text-[#006492]">
                  <RefreshCw size={21} />
                </span>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-[#2c3e50]">Quy tắc Phiên QR</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <NumberControl label="Thời gian hết hạn (phút)" value="60" helper="Tự động hủy session QR sau thời gian này." />
                <NumberControl label="Bán kính xác thực GPS (m)" value="50" helper="Khoảng cách tối đa cho phép quanh vị trí thùng." />
              </div>
              <div className="mt-6 rounded-2xl bg-[#f5f3f2] p-4">
                <ToggleRow title="Xác thực 2 lớp (GPS + QR)" description="Yêu cầu cả mã QR và GPS khớp trước khi phát thưởng." active />
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-7 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#f39c12]/12 text-[#735c00]">
                <Bell size={21} />
              </span>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#2c3e50]">Cài đặt Thông báo</h2>
            </div>
            <div className="grid gap-7 lg:grid-cols-[1fr_1fr_220px]">
              <div>
                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.12em] text-[#6c7b6d]">Người dùng</h3>
                <div className="grid gap-3">
                  {notificationRows.slice(0, 2).map((row) => (
                    <CheckboxLine key={row.label} {...row} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.12em] text-[#6c7b6d]">Hệ thống & Trạm</h3>
                <div className="grid gap-3">
                  {notificationRows.slice(2).map((row) => (
                    <CheckboxLine key={row.label} {...row} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-sm font-black text-[#2c3e50]">Kênh thông báo</h3>
                <div className="grid grid-cols-3 gap-2">
                  <ChannelButton label="Email" Icon={Mail} />
                  <ChannelButton label="Push" Icon={Smartphone} active />
                  <ChannelButton label="SMS" Icon={MessageSquare} />
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <article className="relative overflow-hidden rounded-3xl bg-[#006d37] p-7 text-white shadow-[0_18px_44px_rgba(0,109,55,0.22)]" data-admin-reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/14">
                <Bot size={22} />
              </span>
              <h2 className="text-2xl font-black tracking-[-0.04em]">Ngưỡng AI</h2>
            </div>
            <p className="text-sm font-semibold leading-6 text-white/82">Điều chỉnh độ chính xác của mô hình nhận diện rác thải tự động.</p>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-white/70">Độ tin cậy tối thiểu</span>
              <span className="text-2xl font-black">85%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div data-admin-bar className="h-full rounded-full bg-[#2ecc71]" style={{ width: "72%" }} />
            </div>
            <div className="mt-6 rounded-2xl border border-white/16 bg-white/12 p-4">
              <div className="flex items-center gap-2 text-sm font-black">
                <CheckCircle2 size={17} />
                Chế độ AI Verified
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-white/75">Tự động duyệt những lượt gửi có độ tin cậy cao và GPS khớp.</p>
            </div>
            <Sparkles className="absolute -right-8 -top-8 text-white/8" size={180} />
          </article>

          <article className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#006d37]/10 text-[#006d37]">
                <Clock size={22} />
              </span>
              <div>
                <p className="text-sm font-black text-[#2c3e50]">Admin Center</p>
                <p className="text-xs font-semibold text-[#6c7b6d]">v2.4.0 Stable</p>
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-[#2ecc71] py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(46,204,113,0.18)]" type="button">Tạo chiến dịch</button>
          </article>
        </aside>
      </section>

      <section className="grid-flow-dense grid gap-6 rounded-3xl border border-[#bbcbbb]/25 bg-white p-8 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:grid-cols-[1fr_280px]" data-admin-reveal>
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-black tracking-[-0.04em] text-[#006d37]">Tầm nhìn Bền vững</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#3d4a3e]">Mọi cấu hình bạn thực hiện hôm nay đều góp phần tối ưu hành trình tái chế cho hàng ngàn người dùng trong tương lai.</p>
          <div className="mt-8 grid max-w-sm grid-cols-2 gap-6">
            <Kpi value="98%" label="Độ chính xác AI" tone="green" />
            <Kpi value="2.4s" label="Tốc độ phản hồi" tone="blue" />
          </div>
        </div>
        <div className="relative min-h-64 overflow-hidden rounded-2xl bg-[#0b1f18]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_38%,rgba(46,204,113,0.36),transparent_28%),linear-gradient(135deg,#0b1f18,#006d37)] opacity-95" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
          <Sparkles className="absolute right-7 top-7 text-white/20" size={142} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f18]/60 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-xl bg-white px-4 py-3 text-xs font-black text-[#0b1f18] shadow-lg">Cấu hình nhất quán tạo niềm tin xanh.</div>
        </div>
      </section>

      <button className="fixed bottom-8 right-8 z-50 hidden size-14 place-items-center rounded-full bg-[#2ecc71] text-white shadow-[0_18px_40px_rgba(46,204,113,0.28)] transition hover:scale-110 active:scale-95 lg:grid" type="button" aria-label="Đồng bộ cấu hình">
        <RefreshCw size={24} />
      </button>
    </div>
  );
}

function NumberControl({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#3d4a3e]">{label}</span>
      <input className="h-12 rounded-xl border-0 bg-[#f5f3f2] px-4 text-sm font-black text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/30" defaultValue={value} type="number" />
      <span className="text-xs font-semibold leading-5 text-[#6c7b6d]">{helper}</span>
    </label>
  );
}

function ToggleRow({ title, description, active }: { title: string; description: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-black text-[#2c3e50]">{title}</h3>
        <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{description}</p>
      </div>
      <span className={`relative h-6 w-11 rounded-full transition ${active ? "bg-[#2ecc71]" : "bg-[#bbcbbb]"}`}>
        <span className={`absolute top-1 size-4 rounded-full bg-white transition ${active ? "left-6" : "left-1"}`} />
      </span>
    </div>
  );
}

function CheckboxLine({ label, checked }: { label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold text-[#3d4a3e]">
      <span className={`grid size-5 place-items-center rounded border ${checked ? "border-[#2ecc71] bg-[#2ecc71] text-white" : "border-[#bbcbbb] bg-white"}`}>
        {checked ? <CheckCircle2 size={13} /> : null}
      </span>
      {label}
    </label>
  );
}

function ChannelButton({ label, Icon, active }: { label: string; Icon: LucideIcon; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-black transition ${active ? "border-[#2d9cdb] text-[#006492]" : "border-[#e4e2e1] text-[#6c7b6d] hover:border-[#2d9cdb]"}`} type="button">
      <Icon size={17} />
      {label}
    </button>
  );
}

function Kpi({ value, label, tone }: { value: string; label: string; tone: "green" | "blue" }) {
  return (
    <div>
      <p className={`text-4xl font-black tracking-[-0.05em] ${tone === "green" ? "text-[#006d37]" : "text-[#2d9cdb]"}`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
    </div>
  );
}
