import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { AuthNotice, AuthShell, AuthValuePill, FieldHelper } from "@/components/auth/auth-shell";

function safePath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string; sent?: string; error?: string }> }) {
  const params = await searchParams;
  const email = params.email?.trim().toLowerCase() ?? "";
  const next = safePath(params.next);
  const sent = params.sent === "1";
  const message =
    params.error === "email_not_confirmed"
      ? "Tài khoản này chưa xác thực email. Hãy mở email xác thực hoặc gửi lại liên kết."
      : params.error === "missing_email"
        ? "Nhập email đã đăng ký để gửi lại liên kết xác thực."
        : params.error === "resend_failed"
          ? "Chưa thể gửi lại email xác thực. Vui lòng thử lại sau."
          : null;

  return (
    <AuthShell
      eyebrow="Xác thực email"
      title="Kiểm tra hộp thư"
      body="Bạn cần xác thực email trước khi đăng nhập và sử dụng ví điểm EcoReward."
      sideTitle="Một bước cuối để bảo vệ tài khoản."
      sideBody="Liên kết xác thực giúp đảm bảo điểm thưởng, lịch sử gửi rác và hồ sơ cá nhân thuộc đúng người dùng."
    >
      {sent ? <AuthNotice tone="success">Email xác thực đã được gửi. Kiểm tra hộp thư đến hoặc thư rác.</AuthNotice> : null}
      {message ? <AuthNotice>{message}</AuthNotice> : null}

      <div className="rounded-[24px] border border-[#d9e5da] bg-[#f3fcf3] p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#007a3d]">
            <CheckCircle2 size={19} />
          </span>
          <div>
            <p className="font-black text-[#151d18]">Mở email xác thực</p>
            <p className="mt-1 text-sm font-semibold text-[#5d6a60]">{email ? `Đã gửi tới ${maskEmail(email)}.` : "Nhập email bên dưới để gửi lại liên kết."}</p>
          </div>
        </div>
        <div className="mt-4">
          <AuthValuePill>Sau xác thực, bạn sẽ được chuyển về trang cần truy cập</AuthValuePill>
        </div>
      </div>

      <form action="/api/auth/resend-verification" className="mt-5 grid gap-4" method="post">
        <input name="next" type="hidden" value={next} />
        <label className="block text-sm font-black text-[#151d18]" htmlFor="email">
          Email đăng ký
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
            <input
              aria-describedby="verification-email-helper"
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
          <FieldHelper id="verification-email-helper">Dùng đúng email đã nhập khi đăng ký.</FieldHelper>
        </label>

        <button className="focus-ring flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 py-4 font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
          Gửi lại email xác thực
          <RefreshCw size={18} />
        </button>
      </form>

      <Link className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-black text-[#007a3d] transition hover:bg-[#edf6ed]" href="/login">
        <ArrowLeft size={17} />
        Quay lại đăng nhập
      </Link>
    </AuthShell>
  );
}
