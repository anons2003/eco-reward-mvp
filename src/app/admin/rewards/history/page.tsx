import { Download, Filter } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicRewardRedemptionActions } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";

type RedemptionRow = {
  id: string;
  points_spent: number;
  status: string;
  redemption_code: string;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  reward_items: { title: string } | null;
};

export default async function AdminRewardHistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reward_redemptions")
    .select("id,points_spent,status,redemption_code,created_at,profiles(full_name,email),reward_items(title)")
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = (data ?? []) as unknown as RedemptionRow[];
  const totalRedeemed = rows.reduce((sum, row) => sum + row.points_spent, 0);

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Lịch sử đổi thưởng</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Quản lý và theo dõi các giao dịch quà tặng từ cộng đồng SeaTech.</p>
        </div>
        <button className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#006d37] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
          <Download size={18} />
          Xuất báo cáo CSV
        </button>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 rounded-2xl border border-[#bbcbbb]/45 bg-white/75 p-5 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-8" data-admin-reveal>
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(150px,170px)_minmax(150px,170px)_44px] xl:items-end">
            <label className="grid min-w-0 gap-2 md:col-span-2 xl:col-span-1">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Khoảng thời gian</span>
              <span className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                <input className="h-11 min-w-0 rounded-xl border border-[#bbcbbb] bg-[#fbf9f8] px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" type="date" />
                <span className="hidden text-sm font-semibold text-[#6c7b6d] sm:inline">đến</span>
                <input className="h-11 min-w-0 rounded-xl border border-[#bbcbbb] bg-[#fbf9f8] px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20" type="date" />
              </span>
            </label>
            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Trạng thái</span>
              <select className="h-11 min-w-0 rounded-xl border border-[#bbcbbb] bg-[#fbf9f8] px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20">
                <option>Tất cả trạng thái</option>
                <option>issued</option>
                <option>used</option>
                <option>cancelled</option>
              </select>
            </label>
            <label className="grid min-w-0 gap-2">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Loại phần thưởng</span>
              <select className="h-11 min-w-0 rounded-xl border border-[#bbcbbb] bg-[#fbf9f8] px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20">
                <option>Tất cả loại</option>
                <option>Voucher</option>
                <option>Quà tặng</option>
                <option>Đóng góp</option>
              </select>
            </label>
            <button className="grid size-11 place-items-center self-end rounded-xl bg-[#e9e8e7] text-[#006d37] transition hover:bg-[#006d37] hover:text-white" type="button" aria-label="Lọc">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#bbcbbb]/45 bg-white/75 p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-4" data-admin-reveal>
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Tổng điểm đã đổi</p>
            <h2 className="mt-2 text-5xl font-black leading-none tracking-[-0.06em] text-[#006d37]">{totalRedeemed.toLocaleString("vi-VN")}</h2>
            <p className="mt-2 text-sm font-bold text-[#2ecc71]">{rows.length.toLocaleString("vi-VN")} giao dịch</p>
          </div>
          <div className="absolute -bottom-10 -right-6 size-36 rounded-full bg-[#2ecc71]/10" />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#bbcbbb]/30 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#bbcbbb]/35 bg-[#f5f3f2]">
                {["Thời gian", "Người dùng", "Phần thưởng", "Điểm đã trừ", "Mã voucher", "Trạng thái", "Hành động"].map((heading) => (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {rows.map((row) => (
                <tr className="transition hover:scale-[0.997] hover:bg-[#f5f3f2]/70" key={row.id}>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-[#1b1c1b]">{new Date(row.created_at).toLocaleDateString("vi-VN")}</div>
                    <div className="text-xs font-semibold text-[#6c7b6d]">{new Date(row.created_at).toLocaleTimeString("vi-VN")}</div>
                  </td>
                  <td className="px-6 py-5">
                    <UserCell name={row.profiles?.full_name ?? "Người dùng"} email={row.profiles?.email ?? "Không rõ email"} />
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-[#1b1c1b]">{row.reward_items?.title ?? "Phần thưởng"}</td>
                  <td className="px-6 py-5 text-sm font-black text-[#e74c3c]">- {row.points_spent.toLocaleString("vi-VN")} pts</td>
                  <td className="px-6 py-5">
                    <code className="rounded bg-[#fbf9f8] px-2 py-1 font-mono text-sm font-black text-[#006d37]">{row.redemption_code}</code>
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-6 py-5">
                    <DynamicRewardRedemptionActions redemptionId={row.id} status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {rows.map((row) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={row.id}>
              <div className="flex items-start justify-between gap-3">
                <UserCell name={row.profiles?.full_name ?? "Người dùng"} email={row.profiles?.email ?? "Không rõ email"} />
                <StatusPill status={row.status} />
              </div>
              <p className="mt-4 text-sm font-black text-[#1b1c1b]">{row.reward_items?.title ?? "Phần thưởng"}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-bold text-[#6c7b6d]">
                <span>{new Date(row.created_at).toLocaleString("vi-VN")}</span>
                <span className="text-right text-[#e74c3c]">- {row.points_spent.toLocaleString("vi-VN")} pts</span>
              </div>
              <div className="mt-3 rounded-xl bg-[#fbf9f8] px-3 py-2 font-mono text-xs font-black text-[#006d37]">{row.redemption_code}</div>
              <div className="mt-3">
                <DynamicRewardRedemptionActions redemptionId={row.id} status={row.status} />
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-base font-black text-[#1b1c1b]">Chưa có giao dịch đổi thưởng.</p>
            <p className="mt-2 text-sm font-semibold text-[#6c7b6d]">Các lượt đổi điểm của user sẽ xuất hiện tại đây.</p>
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/35 bg-[#f5f3f2]/45 px-6 py-4 md:flex-row">
          <span className="text-sm font-semibold text-[#3d4a3e]">Hiển thị {rows.length.toLocaleString("vi-VN")} giao dịch gần nhất</span>
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-lg bg-[#006d37] text-sm font-black text-white">1</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserCell({ name, email }: { name: string; email: string }) {
  const initials = name.slice(0, 1).toUpperCase();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#cae6ff] text-xs font-black text-[#001e2f]">{initials}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-[#1b1c1b]">{name}</span>
        <span className="block truncate text-xs font-semibold text-[#6c7b6d]">{email}</span>
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const className = status === "issued" ? "bg-[#2ecc71]/18 text-[#005027]" : status === "used" ? "bg-[#2d9cdb]/12 text-[#2d9cdb]" : "bg-[#ffdad6]/50 text-[#ba1a1a]";
  const label = status === "issued" ? "Đã phát hành" : status === "used" ? "Đã sử dụng" : status === "cancelled" ? "Đã hủy" : status;
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
