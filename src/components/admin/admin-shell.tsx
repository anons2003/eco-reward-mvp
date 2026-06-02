"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Bell, ChevronDown, ClipboardList, FileText, Gift, HelpCircle, History, Home, Leaf, LogOut, Menu, Search, Settings, ShieldAlert, Trash2, Users, X, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/shared/user-avatar";

type NavItem = { href: string; label: string; Icon: LucideIcon; match: string };

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Điều hành",
    items: [
      { href: "/admin/dashboard", label: "Tổng quan", Icon: Home, match: "/admin/dashboard" },
      { href: "/admin/reports", label: "Báo cáo", Icon: BarChart3, match: "/admin/reports" },
    ],
  },
  {
    label: "Kiểm duyệt",
    items: [
      { href: "/admin/submissions", label: "Lượt gửi", Icon: FileText, match: "/admin/submissions" },
      { href: "/admin/submissions/review", label: "Hàng chờ", Icon: ClipboardList, match: "/admin/submissions/review" },
      { href: "/admin/fraud-alerts", label: "Cảnh báo", Icon: ShieldAlert, match: "/admin/fraud-alerts" },
    ],
  },
  {
    label: "Tài sản",
    items: [
      { href: "/admin/bins", label: "Thùng rác", Icon: Trash2, match: "/admin/bins" },
    ],
  },
  {
    label: "Quà tặng",
    items: [
      { href: "/admin/rewards", label: "Danh mục quà", Icon: Gift, match: "/admin/rewards" },
      { href: "/admin/rewards/history", label: "Lịch sử đổi", Icon: History, match: "/admin/rewards/history" },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { href: "/admin/users", label: "Người dùng", Icon: Users, match: "/admin/users" },
      { href: "/admin/points", label: "Cấu hình điểm", Icon: Settings, match: "/admin/points" },
      { href: "/admin/settings", label: "Hệ thống", Icon: Settings, match: "/admin/settings" },
      { href: "/admin/audit-logs", label: "Nhật ký", Icon: ClipboardList, match: "/admin/audit-logs" },
    ],
  },
];

const mobileItems = [
  { href: "/admin/dashboard", label: "Tổng", Icon: Home, match: "/admin/dashboard" },
  { href: "/admin/users", label: "Users", Icon: Users, match: "/admin/users" },
  { href: "/admin/bins", label: "Thùng", Icon: Trash2, match: "/admin/bins" },
  { href: "/admin/rewards", label: "Quà", Icon: Gift, match: "/admin/rewards" },
  { href: "/admin/settings", label: "Thêm", Icon: Menu, match: "/admin/settings" },
];

function isActive(pathname: string, match: string) {
  if (match === "/admin/submissions") {
    return pathname === match || (pathname.startsWith(`${match}/`) && !pathname.startsWith("/admin/submissions/review"));
  }

  if (match === "/admin/rewards") {
    return pathname === match;
  }

  return pathname === match || pathname.startsWith(`${match}/`);
}

export function AdminShell({
  children,
  displayName,
  avatarUrl,
}: {
  children: React.ReactNode;
  displayName: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1b] [background-image:radial-gradient(#d8ded8_0.5px,transparent_0.5px)] [background-size:24px_24px]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] bg-[#fbf9f8]/96">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[#d9e5da] bg-white px-4 py-6 lg:flex">
          <Link className="flex items-center gap-3 px-2" href="/admin/dashboard">
            <span className="grid size-10 place-items-center rounded-full bg-[#006d37] text-white">
              <Leaf size={20} fill="currentColor" />
            </span>
            <span>
              <span className="block text-sm font-black leading-tight text-[#1b1c1b]">SeaTech</span>
              <span className="block text-xs font-semibold leading-tight text-[#6e7a70]">Bảng quản trị</span>
            </span>
          </Link>

          <nav className="mt-7 space-y-2">
            {navGroups.map((group) => {
              const groupActive = group.items.some((item) => isActive(pathname, item.match));

              return (
                <details className="group rounded-2xl" open={groupActive} key={group.label}>
                  <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#6e7a70] outline-none transition hover:bg-[#efedec] focus-visible:ring-2 focus-visible:ring-[#006d37]/20 [&::-webkit-details-marker]:hidden">
                    <span>{group.label}</span>
                    <ChevronDown className="shrink-0 transition group-open:rotate-180" size={15} />
                  </summary>
                  <div className="mt-1 space-y-1 pl-2">
                  {group.items.map(({ href, label, Icon, match }) => {
                    const active = isActive(pathname, match);

                    return (
                      <Link
                        className={`flex min-h-9 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${
                          active ? "bg-[#2ecc71] text-[#00391f]" : "text-[#3e4941] hover:bg-[#efedec] hover:text-[#006d37]"
                        }`}
                        href={href}
                        key={label}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                  </div>
                </details>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[#d9e5da] pt-4">
            <div className="flex items-center gap-3 rounded-2xl p-2">
              <UserAvatar className="ring-0" name={displayName} size="md" src={avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#1b1c1b]">{displayName}</p>
                <p className="text-xs font-semibold text-[#6e7a70]">Quản trị cấp cao</p>
              </div>
              <form action="/api/auth/logout" method="post">
                <button aria-label="Đăng xuất" className="grid size-9 place-items-center rounded-full text-[#ba1a1a] transition hover:bg-[#ffdad6]/50" type="submit">
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-[#d9e5da] bg-white/92 px-8 backdrop-blur-md lg:flex">
            <div className="relative w-full max-w-[460px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={17} />
              <input className="h-10 w-full rounded-full border-0 bg-[#efedec] px-4 pl-11 text-sm font-semibold text-[#1b1c1b] outline-none placeholder:text-[#8a938c] focus:ring-2 focus:ring-[#006d37]/20" placeholder="Tìm dữ liệu, người dùng hoặc cảnh báo..." type="search" />
            </div>
            <div className="flex items-center gap-3">
              <button aria-label="Thông báo" className="relative grid size-10 place-items-center rounded-full text-[#3e4941] transition hover:bg-[#efedec]" type="button">
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-[#ba1a1a]" />
              </button>
              <button aria-label="Trợ giúp" className="grid size-10 place-items-center rounded-full text-[#3e4941] transition hover:bg-[#efedec]" type="button">
                <HelpCircle size={18} />
              </button>
            </div>
          </header>

          <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-[#fbf9f8]/95 px-4 backdrop-blur lg:hidden">
            <div className="flex items-center gap-2">
              <button aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"} className="grid size-10 place-items-center rounded-full text-[#006d37] transition active:scale-95" type="button" onClick={() => setMobileMenuOpen((open) => !open)}>
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link className="text-xl font-black tracking-[-0.03em] text-[#006d37]" href="/admin/dashboard">
                SeaTech Admin
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Tìm kiếm" className="grid size-10 place-items-center rounded-full text-[#006d37]" type="button">
                <Search size={20} />
              </button>
              <UserAvatar className="ring-2 ring-[#09864f]" name={displayName} size="md" src={avatarUrl} />
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1100px] px-4 pb-28 pt-4 lg:px-8 lg:pb-12 lg:pt-7">{children}</main>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-x-3 top-16 z-50 max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-[28px] border border-[#d9e5da] bg-white p-3 shadow-[0_22px_70px_rgba(21,29,24,0.18)] lg:hidden">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6e7a70]">Điều hướng nhanh</p>
            <button className="grid size-9 place-items-center rounded-full text-[#3e4941] transition hover:bg-[#efedec]" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Đóng menu">
              <X size={18} />
            </button>
          </div>
          <nav className="grid gap-3">
            {navGroups.map((group) => (
              <div className="rounded-2xl bg-[#fbf9f8] p-2" key={group.label}>
                <p className="px-2 pb-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#6e7a70]">{group.label}</p>
                <div className="grid gap-1">
                  {group.items.map(({ href, label, Icon, match }) => {
                    const active = isActive(pathname, match);

                    return (
                      <Link
                        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-black transition ${active ? "bg-[#09864f] text-white" : "text-[#1b1c1b] hover:bg-white"}`}
                        href={href}
                        key={label}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={17} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 z-50 grid h-[84px] w-full grid-cols-5 items-center gap-1 rounded-t-[28px] border-t border-[#d9e5da] bg-white px-2 shadow-[0_-8px_28px_rgba(21,29,24,0.08)] lg:hidden">
        {mobileItems.map(({ href, label, Icon, match }) => {
          const active = isActive(pathname, match);

          return (
            <Link
              className={`flex min-w-0 flex-col items-center justify-center rounded-full px-2 py-2 text-[11px] font-black transition active:scale-95 ${
                active ? "bg-[#09864f] text-white" : "text-[#3e4941] hover:bg-[#efedec]"
              }`}
              href={href}
              key={label}
            >
              <Icon size={19} />
              <span className="mt-0.5 max-w-full whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
