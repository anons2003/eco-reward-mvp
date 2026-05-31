import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Leaf, Lock, Mail, QrCode, ShieldCheck, Sparkles } from "lucide-react";

const heroImage = "/eco-reward/hero-cleanup.png";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "";
  const hasError = params.error === "invalid_credentials" || params.error === "missing_credentials" || params.error === "oauth_failed";

  return (
    <main className="min-h-screen bg-[#f9f9fd] bg-[radial-gradient(#e6e7ef_1px,transparent_1px)] px-4 py-5 text-[#151515] [background-size:24px_24px] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-6xl items-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-[#e6e7ef] bg-white/78 shadow-[0_28px_90px_rgba(21,21,21,0.10)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[720px] flex-col justify-between overflow-hidden border-r border-[#e6e7ef] bg-[#fbfbff] p-10 lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(232,251,255,0.95),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(241,236,255,0.85),transparent_30%)]" />
            <div className="relative z-10 flex items-center justify-between">
              <Link className="flex w-fit items-center gap-2 text-xl font-black tracking-[-0.02em] text-[#151515]" href="/">
                <span className="grid size-12 place-items-center rounded-2xl border border-[#e6e7ef] bg-white">
                  <Leaf size={26} />
                </span>
                Eco-Reward
              </Link>
              <span className="rounded-full border border-[#e6e7ef] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5f6472]">
                Tích điểm xanh
              </span>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e6e7ef] bg-white px-4 py-2 text-sm font-black text-[#151515]">
                <Sparkles size={16} />
                Đăng nhập an toàn
              </div>
              <h1 className="mt-7 max-w-xl text-[56px] font-black leading-[60px] tracking-[-0.03em] text-[#151515]">
                Đăng nhập để biến hành động xanh thành điểm thưởng.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#5f6472]">
                Quét mã QR, chụp ảnh rác, nhận kết quả phân loại và theo dõi điểm xanh trong một luồng gọn.
              </p>
            </div>

            <div className="relative z-10 grid gap-5">
              <div className="overflow-hidden rounded-[28px] border border-[#e6e7ef] bg-white p-3 shadow-[0_16px_50px_rgba(21,21,21,0.08)]">
                <Image alt="Eco-Reward minh họa phân loại rác" className="h-56 w-full rounded-3xl object-cover" height={360} priority src={heroImage} width={640} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["QR hợp lệ", "Phiên 120 giây", QrCode],
                  ["Ảnh được xác minh", "Nhận diện vật phẩm", ShieldCheck],
                  ["Cộng điểm", "Ví và đổi quà", CheckCircle2],
                ].map(([title, body, Icon]) => (
                  <div className="rounded-2xl border border-[#e6e7ef] bg-white p-4" key={title as string}>
                    <Icon className="text-[#151515]" size={22} />
                    <p className="mt-3 font-black">{title as string}</p>
                    <p className="mt-1 text-sm leading-5 text-[#5f6472]">{body as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center px-6 py-8 sm:px-10 lg:px-14">
          <div className="w-full">
            <div className="mb-8">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <span className="grid size-12 place-items-center rounded-2xl border border-[#e6e7ef] bg-white text-[#151515]">
                  <Leaf size={26} />
                </span>
                <span className="text-xl font-black tracking-[-0.02em] text-[#151515]">Eco-Reward</span>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5f6472]">Đăng nhập</p>
              <h2 className="mt-3 text-[40px] font-black leading-[46px] tracking-[-0.03em] text-[#151515] sm:text-5xl sm:leading-[54px]">
                Chào mừng trở lại
              </h2>
              <p className="mt-3 leading-7 text-[#5f6472]">Dùng Google hoặc tài khoản đã đăng ký để tiếp tục phân loại rác và tích điểm xanh.</p>
            </div>

            {hasError ? (
              <p className="mb-5 rounded-2xl border border-[#ffd7d7] bg-[#fff7f7] p-4 text-sm font-bold text-[#b91c1c]">
                Không đăng nhập được. Kiểm tra tài khoản hoặc cấu hình OAuth.
              </p>
            ) : null}

            <div className="grid gap-4">
              <form action="/api/auth/google" method="get">
                <input type="hidden" name="next" value={next || "/dashboard"} />
                <button className="focus-ring flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#151515] px-5 py-4 text-base font-black text-white shadow-[0_14px_34px_rgba(21,21,21,0.18)] transition hover:bg-[#2a2a2a] active:scale-[0.99]" type="submit" style={{ color: "#ffffff" }}>
                  <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black text-[#151515]">G</span>
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
                    <input className="min-h-14 w-full rounded-2xl border border-[#e6e7ef] bg-white px-4 py-3 pl-12 font-bold text-[#151515] outline-none transition placeholder:text-[#9ca3af] focus:border-[#151515] focus:ring-4 focus:ring-[#151515]/10" id="email" name="email" type="email" defaultValue="anons2003+eco-user@gmail.com" required />
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-bold text-[#5f6472]" htmlFor="password">
                  <span className="flex items-center justify-between gap-3">
                    Mật khẩu
                    <Link className="text-[#151515] underline-offset-4 hover:underline" href="/forgot-password">
                      Quên mật khẩu?
                    </Link>
                  </span>
                  <span className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
                    <input className="min-h-14 w-full rounded-2xl border border-[#e6e7ef] bg-white px-4 py-3 pl-12 font-bold text-[#151515] outline-none transition placeholder:text-[#9ca3af] focus:border-[#151515] focus:ring-4 focus:ring-[#151515]/10" id="password" name="password" type="password" defaultValue="EcoReward123!" required />
                  </span>
                </label>
                <button className="focus-ring flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#e6e7ef] bg-white px-5 py-4 font-black text-[#151515] transition hover:border-[#151515] hover:bg-[#f4f5fb] active:scale-[0.99]" type="submit">
                  Đăng nhập
                  <ArrowRight size={18} />
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
      </div>
    </main>
  );
}
