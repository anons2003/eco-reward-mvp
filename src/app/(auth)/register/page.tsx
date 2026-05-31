import Link from "next/link";
import { ArrowRight, Leaf, Mail, ShieldCheck, UserRound } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="eco-shell flex min-h-screen items-center justify-center px-4 py-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#e6e7ef] bg-white/78 shadow-[0_28px_90px_rgba(21,21,21,0.10)] backdrop-blur-xl lg:grid-cols-[0.9fr_1fr]">
        <div className="border-r border-[#e6e7ef] bg-[#fbfbff] p-8 sm:p-10">
          <Link className="flex w-fit items-center gap-2 text-xl font-black text-[#151515]" href="/">
            <span className="grid size-12 place-items-center rounded-2xl border border-[#e6e7ef] bg-white">
              <Leaf size={26} />
            </span>
            Eco-Reward
          </Link>
          <h1 className="mt-10 text-5xl font-black leading-[1.05] tracking-[-0.03em] text-[#151515]">Tạo tài khoản xanh cho hành trình phân loại rác.</h1>
          <p className="mt-5 leading-7 text-[#5f6472]">Tạo hồ sơ để theo dõi điểm xanh, lịch sử phân loại và các phần thưởng bạn có thể đổi.</p>
          <div className="mt-8 rounded-2xl border border-[#e6e7ef] bg-white p-5">
            <ShieldCheck className="text-[#151515]" />
            <p className="mt-3 font-black">Bảo vệ tài khoản của bạn</p>
            <p className="mt-1 text-sm leading-6 text-[#5f6472]">Thông tin đăng nhập giúp giữ điểm thưởng, lịch sử hoạt động và lượt đổi quà luôn gắn với đúng chủ tài khoản.</p>
          </div>
        </div>
        <div className="p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5f6472]">Đăng ký</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[#151515]">Bắt đầu với Eco-Reward</h2>
          <form className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-[#5f6472]" htmlFor="name">
              Họ và tên
              <span className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
                <input className="input pl-12" id="name" placeholder="Nguyễn Văn Xanh" type="text" />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#5f6472]" htmlFor="email">
              Email
              <span className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={18} />
                <input className="input pl-12" id="email" placeholder="eco-hero@example.com" type="email" />
              </span>
            </label>
            <Link className="btn-primary mt-2 w-full" href="/login">
              Tiếp tục đăng nhập
              <ArrowRight size={18} />
            </Link>
          </form>
          <p className="mt-8 text-center text-sm text-[#5f6472]">
            Đã có tài khoản?{" "}
            <Link className="font-black text-[#151515]" href="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
