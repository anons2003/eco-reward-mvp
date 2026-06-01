import Link from "next/link";
import { ArrowRight, Bell, FileText, Leaf, Lock, Mail, RadioTower, ShieldCheck, UserCog, type LucideIcon } from "lucide-react";
import { FieldHelper } from "@/components/auth/auth-shell";
import { PendingSubmitButton } from "@/components/shared/loading-ui";

const gatewayMetrics = [
  { label: "Chờ kiểm duyệt", value: "24", detail: "hàng chờ", Icon: FileText, tone: "green" },
  { label: "Cảnh báo gian lận", value: "05", detail: "cần xử lý", Icon: Bell, tone: "red" },
  { label: "Sức khỏe hệ thống", value: "98%", detail: "AI xác thực", Icon: RadioTower, tone: "blue" },
  { label: "Nhật ký thao tác", value: "1.2k", detail: "thao tác", Icon: UserCog, tone: "amber" },
] as const;

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "/admin/dashboard";

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#fbf9f8] text-[#1b1c1b] [background-image:radial-gradient(#d8ded8_0.5px,transparent_0.5px)] [background-size:24px_24px]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-3xl border border-[#d9e5da] bg-white shadow-[0_18px_58px_rgba(21,29,24,0.08)] lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative hidden min-h-[560px] overflow-hidden border-r border-[#d9e5da] bg-[#fbf9f8] p-7 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(46,204,113,0.16),transparent_32%),radial-gradient(circle_at_86%_20%,rgba(45,156,219,0.12),transparent_30%)]" />
            <div className="relative z-10 flex h-full flex-col">
              <Link className="flex w-fit items-center gap-3 text-sm font-black text-[#1b1c1b]" href="/">
                <span className="grid size-10 place-items-center rounded-full bg-[#006d37] text-white">
                  <Leaf size={20} fill="currentColor" />
                </span>
                <span>
                  <span className="block leading-tight">SeaTech</span>
                  <span className="block text-xs font-semibold leading-tight text-[#6e7a70]">Cổng quản trị</span>
                </span>
              </Link>

              <div className="mt-10 max-w-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#006d37]">Vận hành bảo mật</p>
                <h1 className="mt-3 text-4xl font-black leading-[1.04] tracking-[-0.05em] text-[#2c3e50] lg:text-[42px]">Đăng nhập để vận hành hệ thống SeaTech.</h1>
                <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-[#3d4a3e]">Cổng quản trị dành cho kiểm duyệt lượt gửi, cảnh báo gian lận, cấu hình điểm và nhật ký thao tác.</p>
              </div>

              <div className="mt-8 grid-flow-dense grid grid-cols-2 gap-3">
                {gatewayMetrics.map((metric) => (
                  <GatewayMetricCard key={metric.label} {...metric} />
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#bbcbbb]/35 bg-white/82 p-4 text-sm font-black text-[#2c3e50] shadow-[0_10px_28px_rgba(45,156,219,0.06)] backdrop-blur">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="text-[#006d37]" size={17} />
                  Phân quyền theo vai trò
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2ecc71]/12 px-3 py-1 text-xs text-[#006d37]">
                  <span className="size-2 rounded-full bg-current" />
                  Trực tuyến
                </span>
              </div>
            </div>
          </aside>

          <section className="flex min-h-[600px] items-center px-6 py-8 sm:px-10 lg:px-16">
            <div className="w-full">
              <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
                <Link className="flex items-center gap-3" href="/">
                  <span className="grid size-10 place-items-center rounded-full bg-[#006d37] text-white">
                    <Leaf size={20} fill="currentColor" />
                  </span>
                  <span className="text-lg font-black tracking-[-0.03em] text-[#006d37]">SeaTech Admin</span>
                </Link>
                <span className="rounded-full bg-[#2ecc71]/12 px-3 py-1 text-xs font-black text-[#006d37]">Bảo mật</span>
              </div>

              <div className="mb-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#006d37]/8 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#006d37]">
                  <ShieldCheck size={14} />
                  Truy cập admin
                </div>
                <h2 className="text-4xl font-black leading-tight tracking-[-0.05em] text-[#151d18] sm:text-5xl">Vào bảng điều khiển</h2>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-[#5d6a60] sm:text-base">Dùng tài khoản quản trị để xử lý dữ liệu vận hành và ghi nhận phiên vào nhật ký thao tác.</p>
              </div>

              <form action="/api/auth/login" className="grid gap-4" method="post">
                <input name="next" type="hidden" value={next.startsWith("/admin") ? next : "/admin/dashboard"} />

                <AdminLoginField
                  autoComplete="email"
                  helper="Chỉ tài khoản có vai trò admin được truy cập khu vực này."
                  icon={Mail}
                  id="admin-email"
                  label="Email quản trị"
                  name="email"
                  placeholder="admin@seatech.app"
                  type="email"
                />

                <label className="block text-sm font-black text-[#151d18]" htmlFor="admin-password">
                  <span className="flex items-center justify-between gap-3">
                    Mật khẩu
                    <Link className="text-sm font-black text-[#006d37] underline-offset-4 hover:underline" href="/forgot-password">
                      Quên mật khẩu?
                    </Link>
                  </span>
                  <span className="relative mt-2 block">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
                    <input
                      aria-describedby="admin-password-helper"
                      autoComplete="current-password"
                      className="min-h-12 w-full rounded-xl border border-[#d9e5da] bg-[#fbf9f8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/18"
                      id="admin-password"
                      name="password"
                      required
                      type="password"
                    />
                  </span>
                  <FieldHelper id="admin-password-helper">Phiên quản trị sẽ được kiểm tra theo role trong hồ sơ.</FieldHelper>
                </label>

                <PendingSubmitButton className="mt-2 flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#006d37] px-5 py-4 font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:bg-[#005d34] active:scale-[0.99] disabled:cursor-wait disabled:opacity-80" pendingLabel="Đang đăng nhập..." type="submit">
                  Vào bảng điều khiển
                  <ArrowRight size={18} />
                </PendingSubmitButton>
              </form>

              <div className="mt-6 rounded-2xl border border-[#bbcbbb]/35 bg-[#fbf9f8] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#006d37]/10 text-[#006d37]">
                    <ShieldCheck size={17} />
                  </span>
                  <p className="text-sm font-semibold leading-6 text-[#3d4a3e]">Mỗi phiên đăng nhập admin được kiểm tra vai trò và ghi nhận để phục vụ truy vết bảo mật.</p>
                </div>
              </div>

              <p className="mt-7 text-center text-sm font-semibold text-[#5d6a60]">
                Bạn là người dùng?{" "}
                <Link className="font-black text-[#006d37] underline-offset-4 hover:underline" href="/login">
                  Về đăng nhập người dùng
                </Link>
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function GatewayMetricCard({ label, value, detail, Icon, tone }: { label: string; value: string; detail: string; Icon: LucideIcon; tone: "green" | "red" | "blue" | "amber" }) {
  const toneClass = {
    green: "bg-[#006d37]/10 text-[#006d37]",
    red: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
  }[tone];

  return (
    <article className="group rounded-2xl border border-[#bbcbbb]/30 bg-white/86 p-4 shadow-[0_10px_28px_rgba(45,156,219,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(45,156,219,0.10)]">
      <div className="mb-4 flex items-center justify-between">
        <span className={`grid size-9 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={18} />
        </span>
        <span className="text-xs font-black text-[#6c7b6d]">{detail}</span>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
      <h3 className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#2c3e50]">{value}</h3>
    </article>
  );
}

function AdminLoginField({
  id,
  label,
  helper,
  icon: Icon,
  ...inputProps
}: {
  id: string;
  label: string;
  helper: string;
  icon: LucideIcon;
  name: string;
  placeholder?: string;
  type: "email" | "text";
  autoComplete: string;
}) {
  return (
    <label className="block text-sm font-black text-[#151d18]" htmlFor={id}>
      {label}
      <span className="relative mt-2 block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
        <input
          aria-describedby={`${id}-helper`}
          className="min-h-12 w-full rounded-xl border border-[#d9e5da] bg-[#fbf9f8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/18"
          id={id}
          required
          {...inputProps}
        />
      </span>
      <FieldHelper id={`${id}-helper`}>{helper}</FieldHelper>
    </label>
  );
}
