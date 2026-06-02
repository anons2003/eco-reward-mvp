"use client";

import Link from "next/link";
import { Crosshair, LocateFixed, MapPin, Navigation, QrCode, Route, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { MapCanvas, MapControls, MapMarker } from "@/components/ui/map";
import { formatDistance, sortByNearest, type GeoPoint, type WithDistance } from "@/lib/geo-distance";

export type NearbyBin = {
  id: string;
  name: string;
  qr_code: string;
  location_name: string;
  lat: number;
  lng: number;
  active: boolean;
};

type LocationState =
  | { status: "idle"; point: null; message: string }
  | { status: "loading"; point: null; message: string }
  | { status: "ready"; point: GeoPoint; message: string }
  | { status: "error"; point: null; message: string };

const daNangCenter: [number, number] = [108.2208, 16.0678];
const defaultLocationState: LocationState = {
  status: "idle",
  point: null,
  message: "Bật định vị để SeaTech sắp xếp thùng rác gần bạn nhất.",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function binMarkerHtml(active: boolean) {
  const color = active ? "#00b96b" : "#8b9098";
  return `
    <span style="background:${color}" class="relative grid size-11 place-items-center rounded-full border-[3px] border-white text-white shadow-[0_18px_38px_rgba(15,23,18,0.24)]">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
      </svg>
    </span>
  `;
}

function userMarkerHtml() {
  return `
    <span class="relative grid size-12 place-items-center rounded-full border-[4px] border-white bg-[#006d37] text-white shadow-[0_18px_38px_rgba(0,109,55,0.30)]">
      <span class="absolute inset-[-8px] rounded-full border border-[#00b96b]/35"></span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/>
      </svg>
    </span>
  `;
}

function binPopupHtml(bin: NearbyBin, distance?: string) {
  const distanceLine = distance ? `<p class="mt-1 text-xs font-bold text-white/65">Cách bạn ${escapeHtml(distance)}</p>` : "";

  return `
    <div class="min-w-64 space-y-3 rounded-2xl border border-white/10 bg-[#101412] p-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
      <div class="flex items-start gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-full bg-[#00b96b] text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </div>
        <div class="min-w-0">
          <p class="line-clamp-2 text-sm font-black leading-tight">${escapeHtml(bin.name)}</p>
          <p class="mt-1 line-clamp-2 text-xs font-bold text-white/65">${escapeHtml(bin.location_name)}</p>
          ${distanceLine}
        </div>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <span class="rounded-full bg-[#003f24] px-2.5 py-1 text-[11px] font-black text-[#8ff8b6]">Đang hoạt động</span>
        <a class="rounded-full bg-white px-3 py-1.5 text-[11px] font-black" style="color:#101412" href="${googleMapsDirectionsUrl(bin)}" rel="noreferrer" target="_blank">Chỉ đường</a>
      </div>
    </div>
  `;
}

function googleMapsDirectionsUrl(bin: Pick<NearbyBin, "lat" | "lng">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`;
}

function mapToken() {
  return process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;
}

export function NearbyBinsMap({ bins }: { bins: NearbyBin[] }) {
  const [location, setLocation] = useState<LocationState>(defaultLocationState);
  const activeBins = useMemo(() => bins.filter((bin) => bin.active), [bins]);
  const nearestBins = useMemo(() => {
    if (!location.point) return activeBins.map((bin) => ({ ...bin, distanceMeters: Number.POSITIVE_INFINITY }));
    return sortByNearest(location.point, activeBins);
  }, [activeBins, location.point]);
  const visibleBins = nearestBins.slice(0, location.point ? 8 : 12);
  const closestBin = location.point ? nearestBins[0] : null;
  const token = mapToken();
  const center = useMemo<[number, number]>(() => (location.point ? [location.point.lng, location.point.lat] : daNangCenter), [location.point]);
  const zoom = location.point ? 14 : 12;

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocation({ status: "error", point: null, message: "Trình duyệt này không hỗ trợ định vị. Bạn vẫn có thể xem các thùng ở Đà Nẵng trên bản đồ." });
      return;
    }

    setLocation({ status: "loading", point: null, message: "Đang xin quyền và lấy vị trí hiện tại..." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          status: "ready",
          point: { lat: position.coords.latitude, lng: position.coords.longitude },
          message: "Đã có vị trí. Danh sách bên dưới đang xếp từ gần đến xa.",
        });
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        setLocation({
          status: "error",
          point: null,
          message: denied ? "Bạn chưa cấp quyền định vị. Hãy bật Location Permission nếu muốn xem thùng gần nhất." : "Không lấy được vị trí hiện tại. Bản đồ vẫn hiển thị các thùng đang hoạt động.",
        });
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
  }

  if (!token) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[28px] border border-[#d9e5da] bg-white/88 p-6 text-center">
        <p className="max-w-md text-sm font-black leading-6 text-[#3d4a3e]">Thiếu NEXT_PUBLIC_GOONG_MAPTILES_KEY. Cấu hình Goong Maptiles key để bật bản đồ thùng rác cho người dùng.</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[30px] border border-[#d9e5da] bg-white shadow-[0_18px_54px_rgba(21,29,24,0.08)]" aria-label="Bản đồ thùng rác gần bạn">
      <div className="border-b border-[#d9e5da] bg-[#f8fbf8] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#d8f5df] px-3 py-1.5 text-xs font-black text-[#007a3d]">
              <Crosshair size={15} />
              Tìm theo vị trí hiện tại
            </div>
            <h2 className="mt-3 text-2xl font-black leading-none tracking-[-0.05em] text-[#151d18] md:text-4xl">Bản đồ thùng rác gần bạn</h2>
            <p className="mt-3 text-sm font-bold leading-6 text-[#667468]">{location.message}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.20)] transition hover:bg-[#006a35] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
              style={{ color: "#ffffff" }}
              type="button"
              disabled={location.status === "loading"}
              onClick={requestLocation}
            >
              <LocateFixed size={18} />
              {location.status === "loading" ? "Đang định vị..." : "Dùng vị trí"}
            </button>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d9e5da] bg-white px-5 text-sm font-black transition hover:border-[#007a3d]" href="/scan" style={{ color: "#071b12" }}>
              <QrCode size={18} />
              Quét QR
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-flow-dense gap-0 lg:grid lg:grid-cols-12">
        <div className="relative min-h-[440px] lg:col-span-8 lg:min-h-[680px]">
          <MapCanvas className="h-[440px] rounded-none border-0 sm:h-[560px] lg:h-full" center={center} zoom={zoom} styleUrl={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(token)}`}>
            <MapControls position="top-right" showZoom showCompass showFullscreen showLocate resetCenter={center} resetZoom={zoom} />
            {location.point ? (
              <MapMarker
                coordinate={[location.point.lng, location.point.lat]}
                label="Vị trí của bạn"
                markerHtml={userMarkerHtml()}
                popupHtml='<div class="rounded-2xl bg-[#101412] px-4 py-3 text-sm font-black text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]">Vị trí của bạn</div>'
                className="grid size-12 place-items-center border-0 bg-transparent p-0"
              />
            ) : null}
            {visibleBins.map((bin) => (
              <MapMarker
                key={bin.id}
                coordinate={[bin.lng, bin.lat]}
                label={bin.name}
                markerHtml={binMarkerHtml(bin.active)}
                popupHtml={binPopupHtml(bin, Number.isFinite(bin.distanceMeters) ? formatDistance(bin.distanceMeters) : undefined)}
                className="grid size-11 place-items-center border-0 bg-transparent p-0"
              />
            ))}
          </MapCanvas>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl border border-white/70 bg-white/92 p-3 shadow-[0_16px_42px_rgba(21,29,24,0.16)] backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black text-[#3d4a3e]">{activeBins.length} thùng hoạt động</span>
              <span className="text-xs font-black text-[#007a3d]">{location.point ? "Đã sắp xếp theo vị trí" : "Đang ghim Đà Nẵng"}</span>
            </div>
          </div>
        </div>

        <aside className="border-t border-[#d9e5da] bg-[#fbfdfb] p-4 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-5">
          {closestBin && Number.isFinite(closestBin.distanceMeters) ? <ClosestBinCard bin={closestBin} /> : <MapEmptyPrompt activeCount={activeBins.length} />}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat Icon={Trash2} label="Hoạt động" value={activeBins.length.toLocaleString("vi-VN")} />
            <MiniStat Icon={MapPin} label="Đang xem" value={visibleBins.length.toLocaleString("vi-VN")} />
            <MiniStat Icon={ShieldCheck} label="QR riêng" value="100%" />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black tracking-[-0.03em] text-[#151d18]">Danh sách gần nhất</h3>
              <span className="rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#007a3d]">{activeBins.length} thùng</span>
            </div>
            <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1 lg:max-h-[360px]">
              {visibleBins.map((bin) => (
                <BinListItem bin={bin} key={bin.id} />
              ))}
              {activeBins.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#bbcbbb] bg-white p-5 text-center">
                  <p className="text-sm font-black text-[#3d4a3e]">Chưa có thùng rác hoạt động trong hệ thống.</p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ClosestBinCard({ bin }: { bin: WithDistance<NearbyBin> }) {
  return (
    <article className="rounded-[26px] bg-[#071b12] p-5 text-white shadow-[0_18px_46px_rgba(7,27,18,0.24)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#8ff8b6]">Gần nhất hiện tại</p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-black leading-tight tracking-[-0.04em]">{bin.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-white/70">{bin.location_name}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-black text-[#007a3d]">{formatDistance(bin.distanceMeters)}</span>
      </div>
      <a className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-black transition hover:bg-[#edf6ed]" href={googleMapsDirectionsUrl(bin)} rel="noreferrer" target="_blank" style={{ color: "#071b12" }}>
        <Navigation size={17} />
        Mở chỉ đường
      </a>
    </article>
  );
}

function BinListItem({ bin }: { bin: WithDistance<NearbyBin> }) {
  const hasDistance = Number.isFinite(bin.distanceMeters);

  return (
    <article className="group rounded-[20px] border border-[#d9e5da] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[#007a3d] hover:shadow-[0_12px_28px_rgba(21,29,24,0.08)]">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#00b96b] text-white">
          <Trash2 size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-black leading-tight text-[#151d18]">{bin.name}</p>
              <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#667468]">{bin.location_name}</p>
            </div>
            {hasDistance ? <span className="shrink-0 rounded-full bg-[#d8f5df] px-2.5 py-1 text-xs font-black text-[#007a3d]">{formatDistance(bin.distanceMeters)}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#edf6ed] px-2.5 py-1 text-[11px] font-black text-[#3d4a3e]">{bin.qr_code}</span>
            <a className="inline-flex min-h-8 items-center gap-1 rounded-full bg-[#007a3d] px-3 py-1 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(0,109,55,0.18)] transition hover:bg-[#006a35]" href={googleMapsDirectionsUrl(bin)} rel="noreferrer" target="_blank" style={{ color: "#ffffff" }}>
              <Route size={13} />
              Chỉ đường
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function MapEmptyPrompt({ activeCount }: { activeCount: number }) {
  return (
    <div className="rounded-[26px] border border-[#d9e5da] bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
          <LocateFixed size={20} />
        </span>
        <div>
          <h3 className="text-lg font-black tracking-[-0.04em] text-[#151d18]">Bật định vị để tìm gần nhất</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-[#667468]">
            {activeCount > 0 ? "Trước khi cấp quyền, bản đồ hiển thị các thùng đang hoạt động tại Đà Nẵng." : "Chưa có thùng rác hoạt động để hiển thị."}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ Icon, label, value }: { Icon: typeof Trash2; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[#d9e5da] bg-white p-3">
      <Icon className="text-[#007a3d]" size={18} />
      <p className="mt-2 truncate text-lg font-black tracking-[-0.04em] text-[#151d18]">{value}</p>
      <p className="mt-0.5 line-clamp-2 text-[11px] font-bold leading-4 text-[#667468]">{label}</p>
    </div>
  );
}
