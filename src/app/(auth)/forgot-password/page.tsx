import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { AuthNotice, AuthShell, AuthValuePill, FieldHelper } from "@/components/auth/auth-shell";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  const missingEmail = params.error === "missing_email";
  const resetFailed = params.error === "reset_failed";
  const sent = params.sent === "1";

  return (
    <AuthShell
      eyebrow="Khôi phục tài khoản"
      title="Đặt lại mật khẩu"
      body="Nhập email đã đăng ký để nhận hướng dẫn khôi phục quyền truy cập vào ví điểm xanh."
      sideTitle="Không mất lịch sử phân loại của bạn."
      sideBody="Sau khi xác minh email, bạn có thể đăng nhập lại và tiếp tục theo dõi điểm thưởng, lịch sử gửi rác và phần thưởng."
    >
      {sent ? <AuthNotice tone="success">Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục đã được gửi.</AuthNotice> : null}
      {missingEmail ? <AuthNotice>Vui lòng nhập email cần khôi phục.</AuthNotice> : null}
      {resetFailed ? <AuthNotice>Chưa gửi được email khôi phục. Kiểm tra SMTP/rate limit Supabase hoặc thử lại sau.</AuthNotice> : null}

      <form action="/api/auth/forgot-password" className="grid gap-4" method="post">
        <label className="block text-sm font-black text-[#151d18]" htmlFor="email">
          Email
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="reset-email-helper"
              autoComplete="email"
              className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </span>
          <FieldHelper id="reset-email-helper">Chúng tôi sẽ gửi hướng dẫn khôi phục vào email này.</FieldHelper>
        </label>

        <div className="rounded-[24px] border border-[#d9e5da] bg-[#f3fcf3] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#007a3d]">
              <KeyRound size={19} />
            </span>
            <div>
              <p className="font-black text-[#151d18]">Xác minh email</p>
              <p className="mt-1 text-sm font-semibold text-[#5d6a60]">Liên kết đặt lại mật khẩu có thời hạn để bảo vệ tài khoản.</p>
            </div>
          </div>
          <div className="mt-4">
            <AuthValuePill>Điểm và lịch sử được giữ nguyên</AuthValuePill>
          </div>
        </div>

        <button className="focus-ring mt-2 flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 py-4 font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
          Gửi hướng dẫn
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
