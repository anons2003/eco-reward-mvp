import Link from "next/link";
import { Bell, Camera, Globe2, LockKeyhole, LogOut, Mail, MapPin, Save, Shield, UserRound } from "lucide-react";
import { PendingSubmitButton } from "@/components/shared/loading-ui";
import { AvatarUploadForm } from "@/components/user/avatar-upload-form";
import { getUserShell } from "@/infrastructure/auth/session";

function Toggle({ enabled = true }: { enabled?: boolean }) {
  return (
    <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-[#007a3d]" : "bg-[#bdcabe]"}`}>
      <span className={`size-5 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
    </span>
  );
}

function SettingRow({ Icon, title, body, enabled = true }: { Icon: typeof Bell; title: string; body: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#bdcabe]/40 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <p className="font-black text-[#151d18]">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#6e7a70]">{body}</p>
        </div>
      </div>
      <Toggle enabled={enabled} />
    </div>
  );
}

export default async function SettingsPage() {
  const { avatarUrl, displayName, user } = await getUserShell();
  const email = user.email ?? "minh.nguyen@email.com";

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a3d]">Cài đặt</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#151d18] md:text-5xl">Cài đặt hệ thống</h1>
        </div>
        <div className="hidden gap-3 md:flex">
          <Link className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-black text-[#151d18] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]" href="/profile">
            Hủy bỏ
          </Link>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white transition hover:bg-[#006a3d]" type="button">
            <Save size={17} />
            Lưu thay đổi
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-6 text-center shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
          <AvatarUploadForm avatarUrl={avatarUrl} displayName={displayName} />
          <h2 className="mt-4 text-xl font-black text-[#151d18]">{displayName}</h2>
          <p className="mt-1 text-sm font-semibold text-[#6e7a70]">{email}</p>
          <span className="mt-4 inline-flex rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black uppercase text-[#007a3d]">Thành viên Bạch kim</span>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <UserRound className="text-[#007a3d]" size={19} />
              <h2 className="text-lg font-black text-[#151d18]">Thiết lập tài khoản</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
                Họ và tên
                <input className="h-11 rounded-full border border-[#bdcabe] bg-[#edf6ed] px-4 text-sm font-semibold normal-case tracking-normal text-[#151d18] outline-none focus:border-[#007a3d]" defaultValue={displayName} />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
                Số điện thoại
                <input className="h-11 rounded-full border border-[#bdcabe] bg-[#edf6ed] px-4 text-sm font-semibold normal-case tracking-normal text-[#151d18] outline-none focus:border-[#007a3d]" defaultValue="090 123 4567" />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941] md:col-span-2">
                Email
                <input className="h-11 rounded-full border border-[#bdcabe] bg-[#edf6ed] px-4 text-sm font-semibold normal-case tracking-normal text-[#151d18] outline-none focus:border-[#007a3d]" defaultValue={email} />
              </label>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <LockKeyhole className="text-[#007a3d]" size={19} />
              <h2 className="text-lg font-black text-[#151d18]">Thay đổi mật khẩu</h2>
            </div>
            <form action="/api/auth/change-password" className="grid gap-4 md:grid-cols-2" method="post">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941] md:col-span-2">
                Mật khẩu hiện tại
                <input
                  autoComplete="current-password"
                  className="h-11 rounded-full border border-[#bdcabe] bg-[#edf6ed] px-4 text-sm font-semibold normal-case tracking-normal text-[#151d18] outline-none focus:border-[#007a3d]"
                  name="currentPassword"
                  required
                  type="password"
                />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
                Mật khẩu mới
                <input
                  autoComplete="new-password"
                  className="h-11 rounded-full border border-[#bdcabe] bg-[#edf6ed] px-4 text-sm font-semibold normal-case tracking-normal text-[#151d18] outline-none focus:border-[#007a3d]"
                  minLength={8}
                  name="password"
                  required
                  type="password"
                />
              </label>
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3e4941]">
                Nhập lại mật khẩu mới
                <input
                  autoComplete="new-password"
                  className="h-11 rounded-full border border-[#bdcabe] bg-[#edf6ed] px-4 text-sm font-semibold normal-case tracking-normal text-[#151d18] outline-none focus:border-[#007a3d]"
                  minLength={8}
                  name="confirmPassword"
                  required
                  type="password"
                />
              </label>
              <div className="md:col-span-2">
                <PendingSubmitButton className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white transition hover:bg-[#006a3d] disabled:cursor-wait disabled:opacity-80" pendingLabel="Đang cập nhật..." type="submit">
                  <Save size={17} />
                  Cập nhật mật khẩu
                </PendingSubmitButton>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white px-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:px-6">
            <div className="flex items-center gap-2 pt-5">
              <Bell className="text-[#007a3d]" size={19} />
              <h2 className="text-lg font-black text-[#151d18]">Thông báo</h2>
            </div>
            <SettingRow Icon={Bell} title="Thông báo đẩy" body="Nhận cập nhật tức thời về hoạt động xanh và điểm thưởng." />
            <SettingRow Icon={Mail} title="Báo cáo Email hàng tuần" body="Tóm tắt hoạt động EcoReward và thành tích của bạn." enabled={false} />
          </section>

          <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white px-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:px-6">
            <div className="flex items-center gap-2 pt-5">
              <Shield className="text-[#007a3d]" size={19} />
              <h2 className="text-lg font-black text-[#151d18]">Quyền riêng tư</h2>
            </div>
            <SettingRow Icon={MapPin} title="Truy cập vị trí" body="Giúp tìm kiếm các trạm thu gom rác tái chế gần bạn nhất." />
            <SettingRow Icon={Camera} title="Quyền truy cập Camera" body="Sử dụng để quét mã QR và ghi nhận phần thưởng." />
          </section>

          <section className="rounded-[2rem] border border-[#bdcabe]/60 bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)] md:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d]">
                <Globe2 size={19} />
              </span>
              <div>
                <p className="font-black text-[#151d18]">Ngôn ngữ</p>
                <p className="mt-1 text-sm font-semibold text-[#6e7a70]">Tiếng Việt (Việt Nam)</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:hidden">
        <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-white text-sm font-black text-[#151d18] ring-1 ring-[#bdcabe]" href="/profile">
          Hủy bỏ
        </Link>
        <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#007a3d] text-sm font-black text-white" type="button">
          Lưu thay đổi
        </button>
      </section>

      <form action="/api/auth/logout" method="post" className="md:hidden">
        <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-3xl bg-[#ffdad6] text-sm font-black text-[#93000a]" type="submit">
          <LogOut size={17} />
          Đăng xuất
        </button>
      </form>
    </>
  );
}
