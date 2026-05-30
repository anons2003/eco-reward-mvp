import Link from "next/link";
import { ArrowRight, CheckCircle2, Leaf, Lock, Mail, QrCode, ShieldCheck, Sparkles } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "";
  const hasError = params.error === "invalid_credentials" || params.error === "missing_credentials" || params.error === "oauth_failed";

  return (
    <main className="eco-shell flex min-h-screen items-center justify-center px-4 py-6 text-[#151515] sm:px-6 lg:px-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#e6e7ef] bg-white shadow-[0_24px_80px_rgba(45,156,219,0.10)] lg:grid-cols-[1fr_0.92fr]">
        <div className="hidden min-h-[690px] flex-col justify-between bg-[#e8fbff] p-10 lg:flex">
          <Link className="flex w-fit items-center gap-2 text-xl font-black text-[#151515]" href="/">
            <span className="grid size-12 place-items-center rounded-2xl bg-white">
              <Leaf size={26} />
            </span>
            Eco-Reward
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#166534]">
              <Sparkles size={16} />
              Supabase Auth + Google OAuth
            </div>
            <h1 className="mt-7 max-w-xl text-5xl font-black leading-tight text-[#151515]">Làm cho hành tinh xanh hơn, qua từng phần thưởng.</h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#5f6472]">Đăng nhập để quét QR, gửi ảnh phân loại rác và theo dõi điểm xanh của bạn.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["QR hợp lệ", "Phiên 120 giây", QrCode],
              ["Kiểm duyệt", "Admin approve", ShieldCheck],
              ["Điểm xanh", "Ví và đổi quà", CheckCircle2],
            ].map(([title, body, Icon]) => (
              <div className="rounded-2xl bg-white p-4" key={title as string}>
                <Icon className="text-[#151515]" size={22} />
                <p className="mt-3 font-black">{title as string}</p>
                <p className="mt-1 text-sm leading-5 text-[#5f6472]">{body as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full">
            <div className="mb-8">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#f4f5fb] text-[#151515]">
                  <Leaf size={26} />
                </span>
                <span className="text-xl font-black text-[#151515]">Eco-Reward</span>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#151515]">Đăng nhập</p>
              <h2 className="mt-3 text-4xl font-black text-[#151515]">Chào mừng trở lại</h2>
              <p className="mt-2 leading-6 text-[#5f6472]">Dùng Google hoặc tài khoản demo để tiếp tục hành trình xanh.</p>
            </div>

            {hasError ? <p className="mb-5 rounded-2xl bg-[#fff0f0] p-4 text-sm font-bold text-[#B91C1C]">Không đăng nhập được. Kiểm tra tài khoản hoặc cấu hình OAuth.</p> : null}

            <div className="grid gap-4">
              <form action="/api/auth/google" method="get">
                <input type="hidden" name="next" value={next || "/dashboard"} />
                <button className="focus-ring flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e6e7ef] bg-white px-4 py-3 text-base font-black text-[#151515] transition hover:bg-[#151515]" type="submit">
                  <span className="grid size-7 place-items-center rounded-full bg-[#4285f4] text-sm font-black text-[#151515]">G</span>
                  Đăng nhập với Google
                </button>
              </form>

              <div className="flex items-center gap-3 text-xs font-bold uppercase text-[#9ca3af]">
                <span className="h-px flex-1 bg-[#e6e7ef]" />
                hoặc
                <span className="h-px flex-1 bg-[#e6e7ef]" />
              </div>

              <form action="/api/auth/login" className="grid gap-4" method="post">
                <input type="hidden" name="next" value={next || "/dashboard"} />
                <label className="grid gap-2 text-sm font-bold text-[#5f6472]" htmlFor="email">
                  Email
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
                    <input className="input pl-12" id="email" name="email" type="email" defaultValue="anons2003+eco-user@gmail.com" required />
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-bold text-[#5f6472]" htmlFor="password">
                  <span className="flex items-center justify-between gap-3">
                    Mật khẩu
                    <Link className="text-[#166534]" href="/forgot-password">
                      Quên mật khẩu?
                    </Link>
                  </span>
                  <span className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
                    <input className="input pl-12" id="password" name="password" type="password" defaultValue="EcoReward123!" required />
                  </span>
                </label>
                <button className="btn-primary min-h-12 w-full" type="submit">
                  Đăng nhập
                  <ArrowRight size={18} />
                </button>
              </form>

              <form action="/api/auth/login" method="post">
                <input type="hidden" name="email" value="anons2003+eco-admin@gmail.com" />
                <input type="hidden" name="password" value="EcoReward123!" />
                <input type="hidden" name="next" value="/admin/dashboard" />
                <button className="btn-secondary w-full" type="submit">
                  Vào admin dashboard
                </button>
              </form>
            </div>

            <p className="mt-8 text-center text-sm text-[#5f6472]">
              Chưa có tài khoản?{" "}
              <Link className="font-black text-[#151515]" href="/register">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
