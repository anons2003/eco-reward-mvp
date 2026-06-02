/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Download, ExternalLink, Info, MapPin, PackageCheck, RadioTower, Recycle, Signal, Trash2, Wrench } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicAdminMapLibreMap, DynamicBinManagementActions } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Database["public"]["Tables"]["bins"]["Row"];
type LocationRow = Database["public"]["Tables"]["locations"]["Row"];

const binColumns = "id,name,qr_code,location_name,location_id,lat,lng,active";

function qrImageUrl(qrCode: string, size = 320) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&data=${encodeURIComponent(qrCode)}`;
}

function mapsUrl(bin: BinRow) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bin.lat},${bin.lng}`)}`;
}

function statSeed(value: string) {
  return value.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function binStats(bin: BinRow) {
  const seed = statSeed(bin.qr_code);
  const capacity = bin.active ? 42 + (seed % 48) : 0;
  const submissions = 120 + (seed % 180);
  const weight = (18 + (seed % 420) / 10).toFixed(1);
  const battery = 72 + (seed % 24);

  return { battery, capacity, submissions, weight };
}

export default async function AdminBinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("bins").select(binColumns).eq("id", id).single();
  const { data: locationsData } = await supabase.from("locations").select("id,name,address,district,ward,lat,lng,active").eq("active", true).order("name", { ascending: true });
  const bin = data as BinRow | null;
  const locations = (locationsData ?? []) as LocationRow[];

  if (error || !bin) notFound();

  const stats = binStats(bin);
  const supportedWaste = ["Nhựa", "Kim loại", "Giấy"];
  const recentEvents = [
    { time: "Hôm nay, 10:24", action: "Gửi rác", detail: `Gửi 0.${(statSeed(bin.id) % 7) + 2}kg Nhựa`, actor: "Lê Minh Tuấn", status: "AI đã xác thực", tone: "green" },
    { time: "Hôm nay, 08:15", action: "Thu gom", detail: "Làm trống thùng", actor: "NV. Nguyễn Văn A", status: "Hoàn tất", tone: "blue" },
    { time: "Hôm qua, 17:40", action: "Kiểm tra", detail: "Đồng bộ QR và vị trí", actor: "SeaTech Ops", status: "Ổn định", tone: "neutral" },
  ];

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between" data-admin-reveal>
        <div className="min-w-0">
          <Link className="mb-5 inline-flex items-center gap-2 text-sm font-black text-[#1b1c1b] transition hover:text-[#006d37]" href="/admin/bins">
            <ArrowLeft size={17} />
            Quản lý thùng rác
          </Link>
          <h1 className="text-balance text-4xl font-black leading-[0.95] tracking-[-0.04em] text-[#2c3e50] lg:text-5xl">Thông tin chi tiết: {bin.qr_code}</h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge active={bin.active} />
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#d9eefb] px-3.5 text-xs font-black text-[#00557d]">
              <MapPin size={15} />
              {bin.location_name}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <DynamicBinManagementActions bin={bin} variant="toolbar" locations={locations} />
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff9f1a] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,159,26,0.22)] transition hover:-translate-y-0.5 active:translate-y-0" type="button">
            <Wrench size={17} />
            Bảo trì
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-[#d9e5da] bg-white p-6 shadow-[0_18px_48px_rgba(21,29,24,0.06)]" data-admin-reveal>
              <div className="mb-8 flex items-start justify-between gap-4">
                <h2 className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em] text-[#3d4a3e]">
                  <RadioTower className="text-[#006d37]" size={18} />
                  Trạng thái hiện tại
                </h2>
                <span className="text-right text-xs font-black italic text-[#6c7b6d]">Cập nhật 2 phút trước</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm font-black text-[#1b1c1b]">Dung lượng rác</span>
                  <span className={`text-lg font-black tabular-nums ${stats.capacity >= 80 ? "text-[#ba1a1a]" : "text-[#006d37]"}`}>{stats.capacity}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#e9e8e7]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#2d9cdb] via-[#2ecc71] to-[#2ecc71]" style={{ width: `${stats.capacity}%` }} />
                </div>
                <p className="text-sm font-semibold text-[#6c7b6d]">{stats.capacity >= 80 ? "Sắp đầy, cần thu gom sớm" : bin.active ? "Đang nhận lượt gửi ổn định" : "Đã ẩn khỏi luồng quét"}</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <TelemetryTile Icon={Signal} label="Kết nối" value={bin.active ? "Ổn định" : "Tạm ngừng"} note={bin.active ? "5G" : "Ẩn"} />
                <TelemetryTile Icon={PackageCheck} label="Pin/Năng lượng" value={`${stats.battery}% Solar`} />
              </div>
            </article>

            <article className="rounded-3xl border border-[#d9e5da] bg-white p-6 shadow-[0_18px_48px_rgba(21,29,24,0.06)]" data-admin-reveal>
              <h2 className="mb-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em] text-[#3d4a3e]">
                <Info className="text-[#006d37]" size={19} />
                Thông tin cơ bản
              </h2>
              <div className="space-y-0">
                <InfoRow label="Mã thùng" value={bin.qr_code} mono />
                <InfoRow label="Tên hiển thị" value={bin.name} />
                <InfoRow label="Ngày lắp đặt" value="01/06/2026" />
                <div className="flex items-start justify-between gap-4 border-b border-[#d9e5da] py-4 last:border-b-0">
                  <span className="text-sm font-black text-[#6c7b6d]">Loại rác hỗ trợ</span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {supportedWaste.map((item) => (
                      <span className="rounded-lg bg-[#e9e8e7] px-3 py-1 text-xs font-black text-[#3d4a3e]" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-3xl border border-[#d9e5da] bg-white p-6 shadow-[0_18px_48px_rgba(21,29,24,0.06)]" data-admin-reveal>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#3d4a3e]">Hiệu suất tuần qua</h2>
                <p className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#1b1c1b] tabular-nums">{stats.submissions} lượt gửi</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-black text-[#6c7b6d]">Tổng rác thu gom</p>
                <p className="mt-1 text-4xl font-black tracking-[-0.04em] text-[#006d37] tabular-nums">{stats.weight} kg</p>
              </div>
            </div>
            <div className="relative h-56 rounded-2xl bg-[linear-gradient(to_right,#edf3ed_1px,transparent_1px),linear-gradient(to_bottom,#edf3ed_1px,transparent_1px)] bg-[size:96px_56px]">
              <div className="absolute inset-x-6 bottom-12 top-8 flex items-end justify-between gap-3">
                {[38, 58, 46, 74, 62, stats.capacity, 54].map((value, index) => (
                  <span className="block w-full rounded-t-xl bg-gradient-to-t from-[#006d37] to-[#2ecc71]" key={`${value}-${index}`} style={{ height: `${Math.max(value, 16)}%` }} />
                ))}
              </div>
              <div className="absolute inset-x-6 bottom-4 flex justify-between text-xs font-black text-[#6c7b6d]">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </article>
        </div>

        <aside className="grid gap-6 xl:content-start">
          <article className="overflow-hidden rounded-3xl border border-[#d9e5da] bg-white shadow-[0_18px_48px_rgba(21,29,24,0.06)]" data-admin-reveal>
            <div className="relative">
              <DynamicAdminMapLibreMap
                heightClassName="h-56"
                center={[bin.lng, bin.lat]}
                zoom={15}
                markers={[{ id: bin.id, label: bin.name, description: bin.location_name, lat: bin.lat, lng: bin.lng, tone: bin.active ? "bin" : "inactive" }]}
              />
              <a className="absolute bottom-5 left-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#006d37] shadow-[0_10px_24px_rgba(21,29,24,0.12)]" href={mapsUrl(bin)} target="_blank" rel="noreferrer">
                <ExternalLink size={16} />
                Mở Maps
              </a>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-black leading-6 text-[#1b1c1b]">Vị trí: {bin.location_name}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6c7b6d]">
                {bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-[#d9e5da] bg-white p-6 text-center shadow-[0_18px_48px_rgba(21,29,24,0.06)]" data-admin-reveal>
            <h2 className="mb-5 text-left text-sm font-black uppercase tracking-[0.14em] text-[#3d4a3e]">Mã QR của thùng</h2>
            <div className="mx-auto grid size-56 place-items-center rounded-2xl border-[6px] border-[#dfe8df] bg-[#fbf9f8] p-5">
              <img alt={`QR ${bin.qr_code}`} className="size-full object-contain" src={qrImageUrl(bin.qr_code, 360)} />
            </div>
            <p className="mx-auto mt-5 max-w-[240px] text-sm font-semibold leading-6 text-[#6c7b6d]">Mã định danh duy nhất cho việc quét tại trạm.</p>
            <a className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#006d37] text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:-translate-y-0.5 active:translate-y-0" href={qrImageUrl(bin.qr_code, 720)} target="_blank" rel="noreferrer">
              <Download size={17} />
              Tải xuống QR
            </a>
          </article>
        </aside>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#d9e5da] bg-white shadow-[0_18px_48px_rgba(21,29,24,0.06)]" data-admin-reveal>
        <div className="flex items-center justify-between gap-4 border-b border-[#d9e5da] p-6">
          <h2 className="inline-flex items-center gap-3 text-2xl font-black tracking-[-0.04em] text-[#2c3e50]">
            <Recycle className="text-[#006d37]" size={26} />
            Lịch sử hoạt động gần đây
          </h2>
          <span className="hidden text-sm font-black text-[#006d37] sm:inline">Xem tất cả</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#f5f3f2]">
              <tr>
                {["Thời gian", "Hành động", "Chi tiết", "Người dùng/NV", "Trạng thái"].map((heading) => (
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#3d4a3e]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3ed]">
              {recentEvents.map((event) => (
                <tr className="transition hover:bg-[#2ecc71]/5" key={`${event.time}-${event.action}`}>
                  <td className="px-6 py-5 text-sm font-black text-[#1b1c1b]">{event.time}</td>
                  <td className="px-6 py-5"><ActivityPill tone={event.tone}>{event.action}</ActivityPill></td>
                  <td className="px-6 py-5 text-sm font-bold text-[#1b1c1b]">{event.detail}</td>
                  <td className="px-6 py-5 text-sm font-black text-[#1b1c1b]">{event.actor}</td>
                  <td className="px-6 py-5 text-sm font-black text-[#3d4a3e]">{event.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3.5 text-xs font-black ${active ? "bg-[#dcf8e6] text-[#006d37]" : "bg-[#e9e8e7] text-[#3d4a3e]"}`}>
      <CheckCircle2 size={15} />
      {active ? "Hoạt động tốt" : "Đã ẩn khỏi quét"}
    </span>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#d9e5da] py-4 last:border-b-0">
      <span className="text-sm font-black text-[#6c7b6d]">{label}</span>
      <span className={`max-w-[58%] text-right text-sm font-black text-[#1b1c1b] ${mono ? "font-mono text-[#006492]" : ""}`}>{value}</span>
    </div>
  );
}

function TelemetryTile({ Icon, label, value, note }: { Icon: typeof Signal; label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-[#fbf9f8] p-4">
      <p className="text-xs font-black text-[#6c7b6d]">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-[#006d37]">
        <Icon size={18} />
        <span className="text-lg font-black leading-6">{value}</span>
      </div>
      {note ? <p className="mt-1 text-sm font-black text-[#006d37]">{note}</p> : null}
    </div>
  );
}

function ActivityPill({ children, tone }: { children: React.ReactNode; tone: string }) {
  const toneClass = {
    blue: "bg-[#d9eefb] text-[#00557d]",
    green: "bg-[#dcf8e6] text-[#006d37]",
    neutral: "bg-[#e9e8e7] text-[#3d4a3e]",
  }[tone] ?? "bg-[#e9e8e7] text-[#3d4a3e]";

  return <span className={`rounded-lg px-3 py-1 text-xs font-black ${toneClass}`}>{children}</span>;
}
