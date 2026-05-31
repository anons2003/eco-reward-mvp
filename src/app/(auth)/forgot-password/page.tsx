import Link from "next/link";
import { ArrowRight, KeyRound, Leaf, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="eco-shell flex min-h-screen items-center justify-center px-4 py-6">
      <section className="w-full max-w-xl rounded-[32px] border border-[#e6e7ef] bg-white/78 p-8 shadow-[0_28px_90px_rgba(21,21,21,0.10)] backdrop-blur-xl sm:p-10">
        <Link className="flex w-fit items-center gap-2 text-xl font-black text-[#151515]" href="/">
          <span className="grid size-12 place-items-center rounded-2xl border border-[#e6e7ef] bg-white">
            <Leaf size={26} />
          </span>
          Eco-Reward
        </Link>
        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5f6472]">Khôi phục tài khoản</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.03em] text-[#151515]">Quên mật khẩu</h1>
          <p className="mt-3 leading-7 text-[#5f6472]">Nhập email đã đăng ký để nhận mã xác minh và đặt lại mật khẩu.</p>
        </div>
        <form className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-[#5f6472]" htmlFor="email">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
              <input className="input pl-12" id="email" placeholder="eco-hero@example.com" type="email" />
            </span>
          </label>
          <div className="rounded-2xl border border-[#e6e7ef] bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e8fbff] text-[#00687a]">
                <KeyRound size={18} />
              </span>
              <div>
                <p className="font-black">Mã xác minh</p>
                <p className="text-sm text-[#5f6472]">Mã sẽ được gửi đến email của bạn.</p>
              </div>
            </div>
          </div>
          <Link className="btn-primary w-full" href="/login">
            Quay lại đăng nhập
            <ArrowRight size={18} />
          </Link>
        </form>
      </section>
    </main>
  );
}
