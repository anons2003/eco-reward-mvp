import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { AuthShell, FieldHelper } from "@/components/auth/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Khôi phục mật khẩu"
      title="Tạo mật khẩu mới"
      body="Nhập mật khẩu mới cho tài khoản EcoReward sau khi email khôi phục đã được xác minh."
      sideTitle="Bảo vệ ví điểm xanh của bạn."
      sideBody="Sau khi đổi mật khẩu, phiên khôi phục sẽ được đăng xuất và bạn đăng nhập lại bằng mật khẩu mới."
    >
      <form action="/api/auth/reset-password" className="grid gap-4" method="post">
        <label className="block text-sm font-black text-[#151d18]" htmlFor="password">
          Mật khẩu mới
          <span className="relative mt-2 block">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="new-password-helper"
              autoComplete="new-password"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </span>
          <FieldHelper id="new-password-helper">Dùng ít nhất 8 ký tự.</FieldHelper>
        </label>

        <label className="block text-sm font-black text-[#151d18]" htmlFor="confirmPassword">
          Nhập lại mật khẩu
          <span className="relative mt-2 block">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="confirm-password-helper"
              autoComplete="new-password"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
          </span>
          <FieldHelper id="confirm-password-helper">Nhập lại để tránh sai sót khi đổi mật khẩu.</FieldHelper>
        </label>

        <button className="focus-ring mt-2 flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 py-4 font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
          Cập nhật mật khẩu
          <ArrowRight size={18} />
        </button>
      </form>

      <Link className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-black text-[#007a3d] transition hover:bg-[#edf6ed]" href="/login">
        <ArrowLeft size={17} />
        Quay lại đăng nhập
      </Link>
    </AuthShell>
  );
}
