import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Leaf, Lock, Mail, Recycle, ShieldCheck } from "lucide-react";

const adminIllustration =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDS2fsh23-MQ7FkX4REUxb918sAW8vD17HpqPydkNsXwlW5B8REDObfCtxo-xDwZ3dMwO2kR_0guiBgMmg9vE0WU3h9_wnndpMtJTnq6CT3gZc-p1-Pz2wEyVZ4EDntT9LSAiSc6Znc_TYT_GApQZNxhn1dng7KqbDA70I1r0RJcE_kO-yKxATi1HCzDf4xDUojBKtk4hqVeH7bQ3FG-mZWRMAYHmFAw0eZQV3h_FjAYSiC5wfJ_b5Vd6NO5wUyP0LVCCGEuraF9GAJ";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "/admin/dashboard";
  const hasError = params.error === "invalid_credentials" || params.error === "missing_credentials";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf9f8] px-6 py-8 text-[#1b1c1b]">
      <div className="pointer-events-none absolute -left-[10%] -top-[15%] size-[42vw] rounded-full bg-[#2ECC71]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[15%] -right-[8%] size-[36vw] rounded-full bg-[#2D9CDB]/15 blur-[110px]" />

      <section className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[420px_1fr]">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <Link className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-white text-[#2ECC71] shadow-sm" href="/">
              <Recycle size={34} />
            </Link>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-[#2C3E50]">Eco-Reward Admin</h1>
            <p className="mt-2 text-sm font-semibold text-[#3d4a3e]/70">Cổng giám sát vận hành</p>
          </div>

          <div className="rounded-xl border border-[#bbcbbb]/30 bg-white/85 p-8 shadow-[0_18px_70px_rgba(45,156,219,0.10)] backdrop-blur-xl sm:p-12">
            {hasError ? (
              <p className="mb-5 rounded-lg bg-[#ffdad6] px-4 py-3 text-sm font-bold text-[#93000a]">Không thể đăng nhập. Kiểm tra email và mật khẩu quản trị.</p>
            ) : null}

            <form action="/api/auth/login" className="space-y-5" method="post">
              <input type="hidden" name="next" value={next.startsWith("/admin") ? next : "/admin/dashboard"} />

              <label className="block space-y-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#3d4a3e]" htmlFor="admin-email">
                Email quản trị
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={19} />
                  <input
                    className="min-h-12 w-full rounded-lg border border-[#bbcbbb]/60 bg-[#fbf9f8] px-4 py-3.5 pl-12 text-base font-semibold text-[#1b1c1b] outline-none transition focus:border-[#2D9CDB] focus:ring-4 focus:ring-[#2D9CDB]/15"
                    defaultValue="anons2003+eco-admin@gmail.com"
                    id="admin-email"
                    name="email"
                    required
                    type="email"
                  />
                </span>
              </label>

              <label className="block space-y-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#3d4a3e]" htmlFor="admin-password">
                <span className="flex items-center justify-between gap-4">
                  Mật khẩu
                  <Link className="normal-case tracking-normal text-[#2D9CDB] hover:text-[#006492]" href="/forgot-password">
                    Quên mật khẩu?
                  </Link>
                </span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={19} />
                  <input
                    className="min-h-12 w-full rounded-lg border border-[#bbcbbb]/60 bg-[#fbf9f8] px-4 py-3.5 pl-12 pr-12 text-base font-semibold text-[#1b1c1b] outline-none transition focus:border-[#2D9CDB] focus:ring-4 focus:ring-[#2D9CDB]/15"
                    defaultValue="EcoReward123!"
                    id="admin-password"
                    name="password"
                    required
                    type="password"
                  />
                  <Eye className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={19} />
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-[#3d4a3e]" htmlFor="remember-admin">
                <input className="size-5 rounded-md border-2 border-[#bbcbbb] text-[#2ECC71]" id="remember-admin" type="checkbox" />
                Ghi nhớ đăng nhập
              </label>

              <button className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#006d37] px-5 py-4 font-extrabold text-white shadow-[0_16px_36px_rgba(0,109,55,0.20)] transition hover:scale-[1.01] hover:bg-[#005027]" type="submit" style={{ color: "#ffffff" }}>
                Vào bảng điều khiển
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bbcbbb]/40 bg-[#f5f3f2] px-3 py-1 text-xs font-semibold text-[#3d4a3e]">
              <ShieldCheck className="text-[#1E8449]" size={16} />
              Phiên quản trị được bảo vệ
            </div>
          </div>
        </div>

        <div className="hidden lg:flex">
          <div className="relative aspect-square w-full max-w-lg">
            <Image alt="Bảng giám sát môi trường Eco-Reward" className="size-full object-contain drop-shadow-2xl" height={760} priority src={adminIllustration} width={760} />
          </div>
        </div>
      </section>
    </main>
  );
}
