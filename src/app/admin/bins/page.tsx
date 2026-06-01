/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit, Eye, Filter, MapPin, QrCode, Search, Trash2, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicBinManagementActions } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Database["public"]["Tables"]["bins"]["Row"];

const binColumns = "id,name,qr_code,location_name,lat,lng,active";

function qrImageUrl(qrCode: string, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&data=${encodeURIComponent(qrCode)}`;
}

export default async function AdminBinsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bins").select(binColumns).order("name", { ascending: true });
  const bins = (data ?? []) as BinRow[];
  const activeBins = bins.filter((bin) => bin.active).length;
  const inactiveBins = bins.length - activeBins;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Quản lý Thùng rác</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Tạo thùng, quản lý mã QR và bật/tắt thùng cho luồng quét của người dùng.</p>
        </div>
        <DynamicBinManagementActions />
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-3">
        <StatCard label="Tổng số thùng" value={bins.length.toLocaleString("vi-VN")} note="Dữ liệu DB" Icon={Trash2} tone="blue" />
        <StatCard label="Đang hoạt động" value={activeBins.toLocaleString("vi-VN")} note="Cho phép quét" Icon={Eye} tone="green" />
        <StatCard label="Đã ẩn" value={inactiveBins.toLocaleString("vi-VN")} note="Không nhận scan" Icon={Filter} tone="amber" />
      </section>

      <section className="grid-flow-dense grid gap-4 lg:grid-cols-12" data-admin-reveal>
        <div className="rounded-2xl border border-[#bbcbbb]/45 bg-white/80 p-4 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-8">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
            <input className="h-11 w-full rounded-xl border border-[#bbcbbb]/60 bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20" placeholder="Tìm kiếm mã thùng, tên hoặc địa điểm..." type="search" />
          </label>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#bbcbbb]/45 bg-white/80 p-4 shadow-[0_12px_34px_rgba(45,156,219,0.06)] backdrop-blur-md lg:col-span-4">
          <span className="text-sm font-semibold text-[#3d4a3e]">Hiển thị {bins.length.toLocaleString("vi-VN")} thùng</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-black text-[#006d37]">
            <QrCode size={14} />
            QR sẵn sàng
          </span>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/35 p-5 text-sm font-black text-[#ba1a1a]" data-admin-reveal>
          Không thể tải danh sách thùng rác.
        </section>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-[#bbcbbb]/30 bg-[#f5f3f2]">
              <tr>
                {["QR", "Mã thùng", "Tên & địa điểm", "Trạng thái", "Tọa độ", "Hành động"].map((heading) => (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {bins.map((bin) => (
                <tr className="transition hover:bg-[#2ecc71]/5" key={bin.id}>
                  <td className="px-6 py-5">
                    <img alt={`QR ${bin.qr_code}`} className="size-16 rounded-xl border border-[#bbcbbb]/35 bg-white p-1" src={qrImageUrl(bin.qr_code, 96)} />
                  </td>
                  <td className="px-6 py-5 font-mono text-sm font-black text-[#006492]">{bin.qr_code}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-[#2c3e50]">{bin.name}</p>
                    <p className="mt-1 text-xs font-semibold text-[#3d4a3e]">{bin.location_name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <StatusPill active={bin.active} />
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-[#3d4a3e]">
                    {bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <Link className="grid size-9 place-items-center rounded-lg text-[#3d4a3e] transition hover:bg-[#e9e8e7]" href={`/admin/bins/${bin.id}`} title="Chi tiết">
                        <Eye size={18} />
                      </Link>
                      <a className="grid size-9 place-items-center rounded-lg text-[#3d4a3e] transition hover:bg-[#e9e8e7]" href={qrImageUrl(bin.qr_code, 512)} target="_blank" rel="noreferrer" title="Tải QR">
                        <QrCode size={18} />
                      </a>
                      <DynamicBinManagementActions bin={bin} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {bins.map((bin) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={bin.id}>
              <div className="flex items-start gap-3">
                <img alt={`QR ${bin.qr_code}`} className="size-20 shrink-0 rounded-xl border border-[#bbcbbb]/35 bg-white p-1" src={qrImageUrl(bin.qr_code, 120)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-black text-[#006492]">{bin.qr_code}</p>
                      <h2 className="mt-1 text-base font-black text-[#2c3e50]">{bin.name}</h2>
                    </div>
                    <StatusPill active={bin.active} />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#3d4a3e]">{bin.location_name}</p>
                  <p className="mt-1 text-xs font-bold text-[#6c7b6d]">{bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#bbcbbb]/25 pt-3">
                <Link className="text-sm font-black text-[#006d37]" href={`/admin/bins/${bin.id}`}>
                  Xem chi tiết
                </Link>
                <div className="flex items-center gap-1">
                  <a className="grid size-9 place-items-center rounded-lg text-[#3d4a3e] transition hover:bg-[#e9e8e7]" href={qrImageUrl(bin.qr_code, 512)} target="_blank" rel="noreferrer" title="Tải QR">
                    <QrCode size={18} />
                  </a>
                  <DynamicBinManagementActions bin={bin} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/30 bg-[#f5f3f2] px-6 py-4 md:flex-row">
          <p className="text-sm font-semibold text-[#3d4a3e]">Hiển thị {bins.length.toLocaleString("vi-VN")} thùng rác</p>
          <div className="flex gap-2">
            <button className="grid size-10 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#3d4a3e] disabled:opacity-45" type="button" disabled>
              <ChevronLeft size={17} />
            </button>
            <button className="grid size-10 place-items-center rounded-lg bg-[#006d37] text-sm font-black text-white" type="button">1</button>
            <button className="grid size-10 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#3d4a3e] disabled:opacity-45" type="button" disabled>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "blue" | "green" | "amber" }) {
  const toneClass = {
    blue: "bg-[#006492]/10 text-[#006492]",
    green: "bg-[#2ecc71]/10 text-[#2ecc71]",
    amber: "bg-[#f39c12]/10 text-[#f39c12]",
  }[tone];

  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
      <div className="mb-4 flex items-start justify-between">
        <span className={`grid size-12 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={22} />
        </span>
        <span className={`text-xs font-black ${toneClass.split(" ")[1]}`}>{note}</span>
      </div>
      <p className="text-sm font-black text-[#3d4a3e]">{label}</p>
      <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
    </article>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${active ? "bg-[#2ecc71]/10 text-[#2ecc71]" : "bg-[#e4e2e1] text-[#3d4a3e]"}`}>
      <span className="size-2 rounded-full bg-current" />
      {active ? "Hoạt động" : "Đã ẩn"}
    </span>
  );
}
