import Link from "next/link";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";
import { AuthShell, FieldHelper } from "@/components/auth/auth-shell";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return (
    <AuthShell
      eyebrow="Đăng ký"
      title="Tạo tài khoản xanh"
      body="Lưu điểm thưởng, lịch sử phân loại và các phần thưởng đổi được trong một hồ sơ cá nhân."
      sideTitle="Bắt đầu hành trình phân loại rác có thưởng."
      sideBody="Mỗi tài khoản giúp hệ thống ghi nhận đúng lượt gửi, điểm xanh và tác động môi trường của riêng bạn."
    >
      <form action="/api/auth/register" className="grid gap-4" method="post">
        <input name="next" type="hidden" value={next.startsWith("/") ? next : "/dashboard"} />
        <label className="block text-sm font-black text-[#151d18]" htmlFor="name">
          Họ và tên
          <span className="relative mt-2 block">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="name-helper"
              autoComplete="name"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="name"
              name="name"
              placeholder="Nguyễn Văn Xanh"
              required
              type="text"
            />
          </span>
          <FieldHelper id="name-helper">Tên này sẽ hiển thị trong hồ sơ và ví điểm.</FieldHelper>
        </label>

        <label className="block text-sm font-black text-[#151d18]" htmlFor="email">
          Email
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="register-email-helper"
              autoComplete="email"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </span>
          <FieldHelper id="register-email-helper">Email dùng để đăng nhập và nhận thông báo tài khoản.</FieldHelper>
        </label>

        <label className="block text-sm font-black text-[#151d18]" htmlFor="password">
          Mật khẩu
          <span className="relative mt-2 block">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="register-password-helper"
              autoComplete="new-password"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </span>
          <FieldHelper id="register-password-helper">Dùng ít nhất 8 ký tự để bảo vệ ví điểm.</FieldHelper>
        </label>

        <button className="focus-ring mt-2 flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 py-4 font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
          Tiếp tục
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-semibold text-[#5d6a60]">
        Đã có tài khoản?{" "}
        <Link className="font-black text-[#007a3d] underline-offset-4 hover:underline" href="/login">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
