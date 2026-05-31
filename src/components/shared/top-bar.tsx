import Link from "next/link";
import { Gift, History, LayoutDashboard, Leaf, LogOut, QrCode, Trash2, Wallet } from "lucide-react";

export function TopBar({ admin = false }: { admin?: boolean }) {
  const userLinks = [
    ["/dashboard", "Tổng quan", LayoutDashboard],
    ["/scan", "Quét QR", QrCode],
    ["/wallet", "Ví điểm", Wallet],
    ["/rewards", "Đổi thưởng", Gift],
  ] as const;
  const adminLinks = [
    ["/admin/dashboard", "Tổng quan", LayoutDashboard],
    ["/admin/submissions", "Lượt gửi", History],
    ["/admin/bins", "Thùng rác", Trash2],
  ] as const;
  const links = admin ? adminLinks : userLinks;

  return (
    <header className="sticky top-0 z-20 border-b border-[#e6e7ef] bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={admin ? "/admin/dashboard" : "/dashboard"} className="flex shrink-0 items-center gap-2 font-black text-[#151515]">
          <span className="grid size-10 place-items-center rounded-xl border border-[#e6e7ef] bg-white">
            <Leaf size={22} />
          </span>
          <span className="hidden sm:inline">Eco-Reward</span>
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm font-bold text-[#5f6472]">
          {links.map(([href, label, Icon]) => (
            <Link className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 transition hover:bg-[#151515] hover:text-white" href={href} key={href}>
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
          <form action="/api/auth/logout" method="post">
            <button className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[#e6e7ef] bg-white px-3 text-[#151515] transition hover:border-[#151515] hover:bg-[#f4f5fb]" type="submit" aria-label="Đăng xuất">
              <LogOut size={16} />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
