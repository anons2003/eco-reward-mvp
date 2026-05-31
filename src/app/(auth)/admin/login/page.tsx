import Link from "next/link";
import { ArrowRight, BarChart3, Lock, Mail, Recycle, ShieldCheck, UsersRound } from "lucide-react";
import { FieldHelper } from "@/components/auth/auth-shell";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "/admin/dashboard";

  return (
    <main className="min-h-screen bg-[#f3fcf3] bg-[radial-gradient(#bdcabe_1px,transparent_1px)] px-4 py-5 text-[#151d18] [background-size:24px_24px] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-6xl items-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-[#d9e5da] bg-white/86 shadow-[0_28px_90px_rgba(21,29,24,0.10)] backdrop-blur-xl lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative hidden min-h-[620px] overflow-hidden border-r border-[#d9e5da] bg-[#142219] p-10 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(143,248,182,0.22),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(216,237,255,0.18),transparent_26%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <Link className="flex w-fit items-center gap-3 text-xl font-black tracking-[-0.03em] text-white" href="/">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#8ff8b6] text-[#00391f]">
                  <Recycle size={26} />
                </span>
                EcoReward Admin
              </Link>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#d8f5df] ring-1 ring-white/15">
                  <ShieldCheck size={16} />
                  Cổng quản trị
                </span>
                <h1 className="mt-7 max-w-lg text-[56px] font-black leading-[60px] tracking-[-0.05em]">Theo dõi lượt gửi và duyệt điểm xanh.</h1>
                <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-[#d8f5df]">Khu vực này dành cho đội vận hành kiểm tra submission, quản lý thùng rác và cấu hình điểm thưởng.</p>
              </div>

              <div className="grid gap-3">
                {[
                  { title: "Hàng chờ duyệt", body: "Theo dõi lượt gửi cần kiểm tra", Icon: BarChart3 },
                  { title: "Quản lý người dùng", body: "Phân quyền và lịch sử điểm", Icon: UsersRound },
                  { title: "An toàn phiên", body: "Chỉ tài khoản admin được vào", Icon: ShieldCheck },
                ].map(({ title, body, Icon }) => (
                  <div className="flex items-center gap-4 rounded-[22px] bg-white/10 p-4 ring-1 ring-white/12" key={title}>
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#8ff8b6] text-[#00391f]">
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 text-sm font-semibold text-[#c7dccb]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-[620px] items-center px-6 py-8 sm:px-10 lg:px-16">
            <div className="w-full">
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3 lg:hidden">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d] ring-1 ring-[#bdcabe]/50">
                    <Recycle size={26} />
                  </span>
                  <span className="text-xl font-black tracking-[-0.03em] text-[#007a3d]">EcoReward Admin</span>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Đăng nhập quản trị</p>
                <h1 className="mt-3 text-[40px] font-black leading-[46px] tracking-[-0.05em] text-[#151d18] sm:text-5xl sm:leading-[54px]">Vào bảng điều khiển</h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-[#5d6a60] sm:text-base">Dùng tài khoản quản trị để xử lý lượt gửi, điểm thưởng và thùng rác trong hệ thống.</p>
              </div>

              <form action="/api/auth/login" className="grid gap-4" method="post">
                <input name="next" type="hidden" value={next.startsWith("/admin") ? next : "/admin/dashboard"} />

                <label className="block text-sm font-black text-[#151d18]" htmlFor="admin-email">
                  Email quản trị
                  <span className="relative mt-2 block">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
                    <input
                      aria-describedby="admin-email-helper"
                      autoComplete="email"
                      className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
                      id="admin-email"
                      name="email"
                      placeholder="admin@example.com"
                      required
                      type="email"
                    />
                  </span>
                  <FieldHelper id="admin-email-helper">Chỉ tài khoản có vai trò admin được truy cập khu vực này.</FieldHelper>
                </label>

                <label className="block text-sm font-black text-[#151d18]" htmlFor="admin-password">
                  <span className="flex items-center justify-between gap-3">
                    Mật khẩu
                    <Link className="text-sm font-black text-[#007a3d] underline-offset-4 hover:underline" href="/forgot-password">
                      Quên mật khẩu?
                    </Link>
                  </span>
                  <span className="relative mt-2 block">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
                    <input
                      aria-describedby="admin-password-helper"
                      autoComplete="current-password"
                      className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
                      id="admin-password"
                      name="password"
                      required
                      type="password"
                    />
                  </span>
                  <FieldHelper id="admin-password-helper">Phiên quản trị sẽ được kiểm tra theo role trong hồ sơ.</FieldHelper>
                </label>

                <button className="focus-ring mt-2 flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 py-4 font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
                  Vào bảng điều khiển
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="mt-8 text-center text-sm font-semibold text-[#5d6a60]">
                Bạn là người dùng?{" "}
                <Link className="font-black text-[#007a3d] underline-offset-4 hover:underline" href="/login">
                  Về đăng nhập người dùng
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
