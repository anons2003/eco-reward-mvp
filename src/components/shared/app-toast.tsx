"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastTone = "error" | "success";

type ToastMessage = {
  body: string;
  tone: ToastTone;
};

function messageForRoute(pathname: string, params: URLSearchParams): ToastMessage | null {
  const error = params.get("error");

  if (pathname === "/login") {
    if (params.get("registered") === "check_email") return { tone: "success", body: "Tài khoản đã được tạo. Kiểm tra email để xác nhận trước khi đăng nhập." };
    if (params.get("reset") === "success") return { tone: "success", body: "Mật khẩu đã được cập nhật. Đăng nhập lại để tiếp tục." };
    if (error === "email_not_confirmed") return { tone: "error", body: "Vui lòng xác thực email trước khi đăng nhập." };
    if (error === "invalid_credentials" || error === "missing_credentials" || error === "oauth_failed") return { tone: "error", body: "Không đăng nhập được. Kiểm tra email, mật khẩu hoặc thử lại với Google." };
  }

  if (pathname === "/admin/login" && (error === "invalid_credentials" || error === "missing_credentials")) {
    return { tone: "error", body: "Không thể đăng nhập. Kiểm tra email và mật khẩu quản trị." };
  }

  if (pathname === "/register") {
    if (error === "missing_fields") return { tone: "error", body: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." };
    if (error === "weak_password") return { tone: "error", body: "Mật khẩu cần có ít nhất 8 ký tự." };
    if (error === "register_failed") return { tone: "error", body: "Không thể tạo tài khoản. Email có thể đã được dùng hoặc cấu hình xác thực chưa sẵn sàng." };
  }

  if (pathname === "/forgot-password") {
    if (params.get("sent") === "1") return { tone: "success", body: "Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục đã được gửi." };
    if (error === "missing_email") return { tone: "error", body: "Vui lòng nhập email cần khôi phục." };
    if (error === "reset_failed") return { tone: "error", body: "Chưa gửi được email khôi phục. Kiểm tra SMTP/rate limit Supabase hoặc thử lại sau." };
    if (error === "email_rate_limited") return { tone: "error", body: "Đã vượt giới hạn gửi email khôi phục của Supabase. Vui lòng chờ rồi thử lại hoặc cấu hình SMTP riêng trong Supabase." };
  }

  if (pathname === "/verify-email") {
    if (params.get("sent") === "1") return { tone: "success", body: "Email xác thực đã được gửi. Kiểm tra hộp thư đến hoặc thư rác." };
    if (error === "email_not_confirmed") return { tone: "error", body: "Tài khoản này chưa xác thực email. Hãy mở email xác thực hoặc gửi lại liên kết." };
    if (error === "missing_email") return { tone: "error", body: "Nhập email đã đăng ký để gửi lại liên kết xác thực." };
    if (error === "resend_failed") return { tone: "error", body: "Chưa thể gửi lại email xác thực. Vui lòng thử lại sau." };
  }

  if (pathname === "/verify-recovery") {
    if (params.get("sent") === "1") return { tone: "success", body: "Mã khôi phục đã được gửi. Kiểm tra hộp thư đến hoặc thư rác." };
    if (error === "missing_fields") return { tone: "error", body: "Vui lòng nhập email và mã xác thực." };
    if (error === "invalid_code") return { tone: "error", body: "Mã xác thực không đúng hoặc đã hết hạn." };
  }

  if (pathname === "/reset-password") {
    if (error === "weak_password") return { tone: "error", body: "Mật khẩu mới cần có ít nhất 8 ký tự." };
    if (error === "password_mismatch") return { tone: "error", body: "Hai lần nhập mật khẩu không khớp." };
    if (error === "reset_failed") return { tone: "error", body: "Không thể cập nhật mật khẩu. Liên kết có thể đã hết hạn, hãy gửi lại yêu cầu khôi phục." };
  }

  if (pathname === "/settings") {
    const profile = params.get("profile");
    if (profile === "success") return { tone: "success", body: "Hồ sơ cá nhân đã được cập nhật." };
    if (profile === "missing_name") return { tone: "error", body: "Vui lòng nhập họ và tên." };
    if (profile === "update_failed") return { tone: "error", body: "Chưa thể cập nhật hồ sơ. Vui lòng thử lại." };

    const avatar = params.get("avatar");
    if (avatar === "success") return { tone: "success", body: "Ảnh đại diện đã được cập nhật." };
    if (avatar === "missing_file") return { tone: "error", body: "Vui lòng chọn ảnh đại diện." };
    if (avatar === "invalid_type") return { tone: "error", body: "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP." };
    if (avatar === "file_too_large") return { tone: "error", body: "Ảnh đại diện tối đa 2 MB." };
    if (avatar === "storage_failed") return { tone: "error", body: "Chưa thể tải ảnh đại diện lên S3. Kiểm tra cấu hình AWS/Vercel env." };
    if (avatar === "profile_update_failed") return { tone: "error", body: "Ảnh đã tải lên nhưng chưa cập nhật được hồ sơ. Vui lòng thử lại." };
    if (avatar === "upload_failed") return { tone: "error", body: "Chưa thể tải ảnh đại diện lên S3. Vui lòng thử lại." };

    const password = params.get("password");
    if (password === "success") return { tone: "success", body: "Mật khẩu đã được cập nhật." };
    if (password === "missing_fields") return { tone: "error", body: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." };
    if (password === "weak_password") return { tone: "error", body: "Mật khẩu mới cần có ít nhất 8 ký tự." };
    if (password === "password_mismatch") return { tone: "error", body: "Hai lần nhập mật khẩu mới không khớp." };
    if (password === "current_invalid") return { tone: "error", body: "Mật khẩu hiện tại không đúng." };
    if (password === "unauthorized") return { tone: "error", body: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại." };
    if (password === "update_failed") return { tone: "error", body: "Chưa thể cập nhật mật khẩu. Vui lòng thử lại." };
  }

  return null;
}

export function AppToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const search = searchParams.toString();
  const toastKey = `${pathname}?${search}`;

  const toast = useMemo(() => messageForRoute(pathname, new URLSearchParams(search)), [pathname, search]);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setDismissedKey(toastKey), 5600);
    return () => window.clearTimeout(timeout);
  }, [toast, toastKey]);

  if (!toast || dismissedKey === toastKey) return null;

  const Icon = toast.tone === "success" ? CheckCircle2 : AlertCircle;
  const toneClass =
    toast.tone === "success"
      ? "border-[#9fd7b0] bg-[#f3fcf3] text-[#006a3d] shadow-[0_18px_40px_rgba(0,106,61,0.16)]"
      : "border-[#ffb4ab] bg-[#fff7f6] text-[#8c1d18] shadow-[0_18px_40px_rgba(140,29,24,0.12)]";

  return (
    <div className="fixed right-4 top-4 z-[100] w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-6" role={toast.tone === "error" ? "alert" : "status"} aria-live={toast.tone === "error" ? "assertive" : "polite"}>
      <div className={`flex items-start gap-3 rounded-[22px] border p-4 backdrop-blur ${toneClass}`}>
        <Icon className="mt-0.5 shrink-0" size={20} />
        <p className="min-w-0 flex-1 text-sm font-black leading-6">{toast.body}</p>
        <button className="grid size-8 shrink-0 place-items-center rounded-full transition hover:bg-black/5" type="button" aria-label="Đóng thông báo" onClick={() => setDismissedKey(toastKey)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
