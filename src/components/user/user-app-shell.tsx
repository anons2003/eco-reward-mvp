"use client";

import Link from "next/link";
import { Bell, ChevronDown, Gift, HelpCircle, History, Home, Leaf, LogOut, QrCode, Search, Settings, User, Wallet, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/shared/user-avatar";

const sidebarItems: Array<{ href: string; label: string; Icon: LucideIcon; match?: string }> = [
  { href: "/dashboard", label: "Dashboard", Icon: Home, match: "/dashboard" },
  { href: "/wallet", label: "Ví điểm", Icon: Wallet, match: "/wallet" },
  { href: "/rewards", label: "Đổi thưởng", Icon: Gift, match: "/rewards" },
  { href: "/history", label: "Lịch sử", Icon: History, match: "/history" },
  { href: "/dashboard#impact", label: "Tác động", Icon: Leaf, match: "/dashboard#impact" },
  { href: "/profile", label: "Tài khoản", Icon: User, match: "/profile" },
];

const mobileItems: Array<{ href: string; label: string; Icon: LucideIcon; match: string }> = [
  { href: "/dashboard", label: "Trang chủ", Icon: Home, match: "/dashboard" },
  { href: "/wallet", label: "Ví điểm", Icon: Wallet, match: "/wallet" },
  { href: "/rewards", label: "Đổi thưởng", Icon: Gift, match: "/rewards" },
  { href: "/profile", label: "Tôi", Icon: User, match: "/profile" },
];

function isActivePath(pathname: string, match: string) {
  if (match.includes("#")) {
    return false;
  }
  return pathname === match || pathname.startsWith(`${match}/`);
}

function SidebarLink({ href, label, Icon, active }: { href: string; label: string; Icon: LucideIcon; active: boolean }) {
  return (
    <Link
      className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
        active ? "bg-[#8ff8b6] text-[#00391f]" : "text-[#3e4941] hover:bg-[#e7f0e7] hover:text-[#006a3d]"
      }`}
      href={href}
    >
      <Icon size={17} />
      <span>{label}</span>
    </Link>
  );
}

export function UserAppShell({
  children,
  displayName,
  avatarUrl,
  points,
}: {
  children: React.ReactNode;
  displayName: string;
  avatarUrl?: string | null;
  points: number;
}) {
  const pathname = usePathname();
  const firstName = displayName.split(" ")[0] || "Bạn";

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#f3fcf3] text-[#151d18] [background-image:radial-gradient(#bdcabe_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[#d9e5da] bg-[#edf6ed] px-3 py-4 lg:flex">
          <div className="px-3 py-2">
            <Link className="block" href="/dashboard">
              <h1 className="text-2xl font-black tracking-[-0.04em] text-[#007a3d]">SeaTech</h1>
              <p className="mt-1 text-xs font-semibold text-[#6e7a70]">Vibrant SeaTech</p>
            </Link>
          </div>

          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <SidebarLink active={isActivePath(pathname, item.match ?? item.href)} href={item.href} Icon={item.Icon} key={item.label} label={item.label} />
            ))}
          </nav>

          <div className="mt-auto space-y-1 pt-6">
            <div className="space-y-1">
              <Link className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#3e4941] transition hover:bg-[#e7f0e7]" href="/settings">
                <Settings size={16} />
                Cài đặt
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-[#ba1a1a] transition hover:bg-[#ffdad6]/40" type="submit">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1">
          <header className="sticky top-0 z-40 hidden h-16 items-center justify-between bg-[#f3fcf3]/90 px-8 backdrop-blur-md md:flex">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={17} />
              <input
                className="h-10 w-72 rounded-full border-0 bg-[#e7f0e7] px-4 pl-10 text-sm font-semibold text-[#151d18] outline-none placeholder:text-[#6e7a70] focus:ring-2 focus:ring-[#007a3d]/20"
                placeholder="Tìm kiếm phần thưởng..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-5">
              <button aria-label="Thông báo" className="grid size-10 place-items-center rounded-full text-[#3e4941] transition hover:bg-[#e7f0e7]" type="button">
                <Bell size={19} />
              </button>
              <button aria-label="Trợ giúp" className="grid size-10 place-items-center rounded-full text-[#3e4941] transition hover:bg-[#e7f0e7]" type="button">
                <HelpCircle size={19} />
              </button>
              <div className="h-6 w-px bg-[#bdcabe]" />
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-black leading-none">{displayName}</p>
                  <p className="mt-1 text-xs font-semibold text-[#6e7a70]">Thành viên Bạc • {points.toLocaleString("vi-VN")} pts</p>
                </div>
                <UserAvatar className="ring-0" name={displayName} size="md" src={avatarUrl} />
              </div>
            </div>
          </header>

          <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-[#f3fcf3]/95 px-4 backdrop-blur md:hidden">
            <Link className="text-sm font-black tracking-[-0.03em] text-[#007a3d]" href="/dashboard">
              SeaTech
            </Link>
            <div className="flex items-center gap-2">
              <button aria-label="Thông báo" className="grid size-9 place-items-center rounded-full transition hover:bg-[#e7f0e7]" type="button">
                <Bell className="text-[#3e4941]" size={19} />
              </button>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full py-1 pl-1 pr-2 outline-none transition hover:bg-[#e7f0e7] focus-visible:ring-2 focus-visible:ring-[#007a3d]/25 [&::-webkit-details-marker]:hidden">
                  <UserAvatar className="ring-white" name={firstName} size="sm" src={avatarUrl} />
                  <ChevronDown className="text-[#3e4941] transition group-open:rotate-180" size={14} />
                  <span className="sr-only">Mở menu tài khoản</span>
                </summary>
                <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-[26px] border border-[#d9e5da] bg-white shadow-[0_22px_60px_rgba(7,27,18,0.18)]">
                  <div className="bg-[#f3fcf3] p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar className="ring-white" name={displayName} size="md" src={avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#071b12]">{displayName}</p>
                        <p className="mt-1 text-xs font-bold text-[#5d6a60]">{points.toLocaleString("vi-VN")} điểm xanh</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-1 p-2">
                    <Link className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-black text-[#071b12] transition hover:bg-[#edf6ed]" href="/profile">
                      <User size={17} />
                      Hồ sơ cá nhân
                    </Link>
                    <Link className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-black text-[#071b12] transition hover:bg-[#edf6ed]" href="/settings">
                      <Settings size={17} />
                      Cài đặt tài khoản
                    </Link>
                    <form action="/api/auth/logout" method="post">
                      <button className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-black text-[#ba1a1a] transition hover:bg-[#ffdad6]/45" type="submit">
                        <LogOut size={17} />
                        Đăng xuất
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pb-28 pt-4 md:space-y-8 md:px-8 md:pb-10 md:pt-6">{children}</div>

          <Link
            aria-label="Quét QR rác"
            className="fixed bottom-6 right-6 z-50 hidden size-16 place-items-center rounded-[24px] bg-[#007a3d] text-white shadow-[0_16px_34px_rgba(0,106,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#006a35] active:scale-95 lg:grid"
            href="/scan"
            title="Quét QR rác"
          >
            <QrCode size={32} />
          </Link>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 z-50 grid h-20 w-full grid-cols-5 items-center gap-1 rounded-t-3xl border-t border-[#bdcabe]/40 bg-white px-2 shadow-[0_-8px_28px_rgba(21,29,24,0.10)] md:hidden">
        {mobileItems.slice(0, 2).map((item) => {
          const active = isActivePath(pathname, item.match);
          const Icon = item.Icon;
          return (
            <Link className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-bold ${active ? "bg-[#d8f5df] text-[#007a3d]" : "text-[#3e4941]"}`} href={item.href} key={item.href}>
              <Icon size={19} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <Link className="-mt-10 mx-auto grid size-16 place-items-center rounded-full bg-[#007a3d] text-white shadow-[0_12px_30px_rgba(0,106,61,0.32)] active:scale-95" href="/scan" aria-label="Quét mã">
          <QrCode size={28} />
        </Link>
        {mobileItems.slice(2).map((item) => {
          const active = isActivePath(pathname, item.match);
          const Icon = item.Icon;
          return (
            <Link className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-bold ${active ? "bg-[#d8f5df] text-[#007a3d]" : "text-[#3e4941]"}`} href={item.href} key={item.href}>
              <Icon size={19} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
