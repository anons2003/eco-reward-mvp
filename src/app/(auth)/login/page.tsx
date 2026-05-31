import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { AuthDivider, AuthNotice, AuthShell, FieldHelper } from "@/components/auth/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "";
  const hasError = params.error === "invalid_credentials" || params.error === "missing_credentials" || params.error === "oauth_failed";

  return (
    <AuthShell eyebrow="Đăng nhập" title="Chào mừng trở lại" body="Vào tài khoản để quét mã, gửi ảnh phân loại và theo dõi điểm xanh của bạn.">
      {hasError ? <AuthNotice>Không đăng nhập được. Kiểm tra email, mật khẩu hoặc thử lại với Google.</AuthNotice> : null}

      <div className="grid gap-4">
        <form action="/api/auth/google" method="get">
          <input name="next" type="hidden" value={next || "/dashboard"} />
          <button className="focus-ring flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#007a3d] px-5 py-4 text-base font-black text-white shadow-[0_14px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.99]" type="submit">
            <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black text-[#007a3d]">G</span>
            Đăng nhập với Google
          </button>
        </form>

        <AuthDivider />

        <form action="/api/auth/login" className="grid gap-4" method="post">
          <input name="next" type="hidden" value={next || "/dashboard"} />
          <label className="block text-sm font-black text-[#151d18]" htmlFor="email">
            Email
            <span className="relative mt-2 block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
              <input
                aria-describedby="email-helper"
                autoComplete="email"
                className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </span>
            <FieldHelper id="email-helper">Dùng email đã đăng ký với EcoReward.</FieldHelper>
          </label>

          <label className="block text-sm font-black text-[#151d18]" htmlFor="password">
            <span className="flex items-center justify-between gap-3">
              Mật khẩu
              <Link className="text-sm font-black text-[#007a3d] underline-offset-4 hover:underline" href="/forgot-password">
                Quên mật khẩu?
              </Link>
            </span>
            <span className="relative mt-2 block">
              <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={18} />
              <input
                aria-describedby="password-helper"
                autoComplete="current-password"
                className="min-h-14 w-full rounded-[18px] border border-[#d9e5da] bg-[#f9fff8] px-4 py-3 pl-12 font-bold text-[#151d18] outline-none transition placeholder:text-[#8b978e] focus:border-[#007a3d] focus:ring-4 focus:ring-[#007a3d]/15"
                id="password"
                name="password"
                required
                type="password"
              />
            </span>
            <FieldHelper id="password-helper">Mật khẩu tối thiểu 8 ký tự.</FieldHelper>
          </label>

          <button className="focus-ring flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#d9e5da] bg-white px-5 py-4 font-black text-[#151d18] transition hover:border-[#007a3d] hover:bg-[#edf6ed] active:scale-[0.99]" type="submit">
            Đăng nhập
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm font-semibold text-[#5d6a60]">
        Chưa có tài khoản?{" "}
        <Link className="font-black text-[#007a3d] underline-offset-4 hover:underline" href="/register">
          Đăng ký
        </Link>
      </p>
    </AuthShell>
  );
}
