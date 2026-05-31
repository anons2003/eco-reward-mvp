import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { AuthShell, FieldHelper } from "@/components/auth/auth-shell";

export default async function VerifyRecoveryPage({ searchParams }: { searchParams: Promise<{ email?: string; error?: string; sent?: string }> }) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase() ?? "";

  return (
    <AuthShell
      eyebrow="Xác minh mã"
      title="Nhập mã khôi phục"
      body="Nhập mã 8 số đã được gửi vào email của bạn để tiếp tục đặt mật khẩu mới."
      sideTitle="Xác minh trước khi đổi mật khẩu."
      sideBody="Mã OTP giúp đảm bảo chỉ chủ email mới có thể đặt lại mật khẩu và truy cập ví điểm xanh."
    >
      <form action="/api/auth/verify-recovery-otp" className="grid gap-4" method="post">
        <label className="block text-sm font-black text-[#151d18]" htmlFor="email">
          Email
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="verify-recovery-email-helper"
              autoComplete="email"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              defaultValue={email}
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </span>
          <FieldHelper id="verify-recovery-email-helper">Dùng đúng email vừa yêu cầu khôi phục mật khẩu.</FieldHelper>
        </label>

        <label className="block text-sm font-black text-[#151d18]" htmlFor="token">
          Mã OTP
          <span className="relative mt-2 block">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="verify-recovery-token-helper"
              autoComplete="one-time-code"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 text-center text-2xl font-black tracking-[0.32em] text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="token"
              inputMode="numeric"
              maxLength={8}
              minLength={8}
              name="token"
              pattern="[0-9]{8}"
              placeholder="00000000"
              required
              type="text"
            />
          </span>
          <FieldHelper id="verify-recovery-token-helper">Mã gồm 8 chữ số trong email khôi phục.</FieldHelper>
        </label>

        <button className="focus-ring mt-2 flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 py-4 font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
          Xác minh mã
          <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-black text-[#007a3d] transition hover:bg-[#edf6ed]" href="/forgot-password">
          <ArrowLeft size={17} />
          Gửi lại mã
        </Link>
        <Link className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-black text-[#5d6a60] transition hover:bg-[#edf6ed]" href="/login">
          Quay lại đăng nhập
        </Link>
      </div>
    </AuthShell>
  );
}
