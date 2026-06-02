"use client";

import { MapCanvas, MapControls, MapMarker } from "@/components/ui/map";

export type AdminMapMarker = {
  id: string;
  label: string;
  description?: string;
  lat: number;
  lng: number;
  tone?: "location" | "bin" | "inactive";
};

export type AdminMapLibreMapProps = {
  markers: AdminMapMarker[];
  center?: [number, number];
  zoom?: number;
  heightClassName?: string;
  onPickCoordinate?: (coordinate: { lat: number; lng: number }) => void;
};

const daNangCenter: [number, number] = [108.2208, 16.0678];

function markerClass(tone: AdminMapMarker["tone"]) {
  return [
    "group relative grid size-10 place-items-center rounded-full border-[3px] border-white text-white shadow-[0_18px_38px_rgba(15,23,18,0.24)] ring-0 ring-white/0 transition-[box-shadow,filter] duration-200 hover:ring-4 hover:ring-white/70 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00a95c]",
    tone === "inactive" ? "bg-[#8b9098]" : "bg-[#00b96b]",
  ].join(" ");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function markerIconSvg(tone: AdminMapMarker["tone"]) {
  if (tone === "inactive") {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.99-5.54 10.2-7.4 11.86a1 1 0 0 1-1.32 0C9.54 20.2 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';
  }
  return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
}

function markerHtml(tone: AdminMapMarker["tone"]) {
  return `<span class="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span><span class="pointer-events-none relative z-10 grid size-full place-items-center">${markerIconSvg(tone)}</span>`;
}

function popupHtml(marker: AdminMapMarker) {
  const status = marker.tone === "inactive" ? "Đã ẩn" : "Đang hoạt động";
  const statusClass = marker.tone === "inactive" ? "bg-white/10 text-[#b9bec6]" : "bg-[#003f24] text-[#8ff8b6]";
  const toneClass = marker.tone === "inactive" ? "bg-[#8b9098]" : "bg-[#00b96b]";
  const description = marker.description ? `<p class="mt-1 line-clamp-2 text-xs font-bold leading-snug text-white/65">${escapeHtml(marker.description)}</p>` : "";

  return `
    <div class="min-w-60 space-y-3 rounded-2xl border border-white/10 bg-[#101412] p-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
      <div class="flex items-start gap-3">
        <div class="${toneClass} grid size-10 shrink-0 place-items-center rounded-full text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)]">${markerIconSvg(marker.tone)}</div>
        <div class="min-w-0">
          <p class="line-clamp-2 text-sm font-black leading-tight">${escapeHtml(marker.label)}</p>
          ${description}
        </div>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <span class="rounded-full px-2.5 py-1 text-[11px] font-black ${statusClass}">${status}</span>
        <a class="rounded-full px-3 py-1.5 text-[11px] font-black transition" style="background:#ffffff;color:#101412;" href="https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}" rel="noreferrer" target="_blank">Chỉ đường</a>
      </div>
    </div>
  `;
}

export function AdminMapLibreMap({ markers, center = daNangCenter, zoom = 12, heightClassName = "h-[420px]", onPickCoordinate }: AdminMapLibreMapProps) {
  const token = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;

  if (!token) {
    return (
      <div className={`grid ${heightClassName} place-items-center rounded-3xl border border-[#bbcbbb]/40 bg-[#f5f3f2] p-6 text-center`}>
        <p className="max-w-md text-sm font-black text-[#3d4a3e]">Thiếu NEXT_PUBLIC_GOONG_MAPTILES_KEY. Cấu hình Goong Maptiles key để bật bản đồ.</p>
      </div>
    );
  }

  return (
    <MapCanvas className={heightClassName} center={center} zoom={zoom} styleUrl={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(token)}`} onMapClick={onPickCoordinate}>
      <MapControls position="top-right" showZoom showCompass showFullscreen showLocate resetCenter={center} resetZoom={zoom} />
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          coordinate={[marker.lng, marker.lat]}
          label={marker.label}
          markerHtml={markerHtml(marker.tone)}
          popupHtml={popupHtml(marker)}
          className={markerClass(marker.tone)}
        />
      ))}
    </MapCanvas>
  );
}
