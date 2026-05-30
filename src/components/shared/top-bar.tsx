import Link from "next/link";
import { Leaf, LogOut } from "lucide-react";

export function TopBar({ admin = false }: { admin?: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#d7dcdf] bg-[#fbf9f8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={admin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 font-bold text-[#006492]">
          <Leaf size={22} />
          Eco-Reward
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-[#3f4850]">
          {admin ? (
            <>
              <Link href="/admin/submissions">Lượt gửi</Link>
              <Link href="/admin/bins">Thùng rác</Link>
            </>
          ) : (
            <>
              <Link href="/wallet">Ví điểm</Link>
              <Link href="/rewards">Đổi thưởng</Link>
            </>
          )}
          <form action="/api/auth/logout" method="post">
            <button className="btn-secondary" type="submit" aria-label="Đăng xuất">
              <LogOut size={16} />
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
