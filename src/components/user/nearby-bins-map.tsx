"use client";

import Link from "next/link";
import { AlertCircle, Crosshair, LocateFixed, Navigation, QrCode, Route, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapCanvas, MapControls, MapMarker, MapRouteLine } from "@/components/ui/map";
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

type RouteStep = {
  instruction: string;
  maneuver: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
};

type DirectionsRoute = {
  coordinates: [number, number][];
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  steps: RouteStep[];
};

type ActiveRoute = {
  bin: NearbyBin;
  route: DirectionsRoute;
};

type LocationCluster = {
  key: string;
  name: string;
  bins: WithDistance<NearbyBin>[];
};

const daNangCenter: [number, number] = [108.2208, 16.0678];
const defaultLocationState: LocationState = {
  status: "idle",
  point: null,
  message: "Bấm Dùng vị trí để SeaTech sắp xếp thùng rác gần bạn nhất.",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

function locationMarkerHtml(selected: boolean, count: number) {
  const color = selected ? "#007a3d" : "#00b96b";
  const ring = selected ? "box-shadow:0 0 0 6px rgba(143,248,182,0.55),0 18px 38px rgba(0,109,55,0.30);" : "box-shadow:0 18px 38px rgba(15,23,18,0.24);";
  const countBadge =
    count > 1
      ? `<span style="position:absolute;right:-6px;top:-7px;background:#071b12;color:white;border:2px solid white;border-radius:999px;min-width:22px;height:22px;display:grid;place-items:center;font-size:11px;font-weight:900;line-height:1">${count}</span>`
      : "";
  return `
    <span style="background:${color};${ring}" class="relative grid size-11 place-items-center rounded-full border-[3px] border-white text-white">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
      </svg>
      ${countBadge}
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

function googleMapsDirectionsUrl(bin: Pick<NearbyBin, "lat" | "lng">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`;
}

function locationClusterPopupHtml(cluster: LocationCluster) {
  const primaryBin = cluster.bins[0];
  const distanceLine = Number.isFinite(primaryBin?.distanceMeters) ? `Cách bạn ${escapeHtml(formatDistance(primaryBin.distanceMeters))}` : "Địa điểm trong hệ thống";
  const binsHtml = cluster.bins
    .map(
      (bin) => `
        <div class="rounded-2xl bg-white/8 px-3 py-2">
          <div class="flex items-center justify-between gap-3">
            <div style="min-width:0">
              <p class="line-clamp-1 text-xs font-black leading-5">${escapeHtml(bin.name)}</p>
              <p class="mt-0.5 text-[11px] font-bold text-white/58">${escapeHtml(bin.qr_code)}</p>
            </div>
            <span class="shrink-0 rounded-full bg-[#8ff8b6] px-2.5 py-1 text-[10px] font-black text-[#071b12]">${bin.active ? "Hoạt động" : "Đã ẩn"}</span>
          </div>
        </div>
      `,
    )
    .join("");

  return `
    <div class="space-y-3 rounded-2xl border border-white/10 bg-[#101412] p-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]" style="width:min(320px,calc(100vw - 48px));max-height:min(420px,70vh);overflow:hidden">
      <div class="flex items-start gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-full bg-[#00b96b] text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
          </svg>
        </div>
        <div class="min-w-0">
          <p class="line-clamp-2 text-base font-black leading-tight">${escapeHtml(cluster.name)}</p>
          <p class="mt-1 text-xs font-bold text-white/65">${cluster.bins.length} thùng tại điểm này · ${distanceLine}</p>
        </div>
      </div>
      <div class="space-y-2 overflow-y-auto pr-1" style="max-height:170px">${binsHtml}</div>
      ${
        primaryBin
          ? `<button class="inline-flex min-h-10 w-full items-center justify-center rounded-full bg-white px-4 text-sm font-black" style="color:#071b12" type="button" data-map-action="route" data-map-value="${escapeHtml(primaryBin.id)}">Chỉ đường tới địa điểm</button>`
          : ""
      }
    </div>
  `;
}

function mapToken() {
  return process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;
}

export function NearbyBinsMap({ bins }: { bins: NearbyBin[] }) {
  const [location, setLocation] = useState<LocationState>(defaultLocationState);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
  const [routeStatus, setRouteStatus] = useState<"idle" | "loading" | "error">("idle");
  const [routeMessage, setRouteMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const activeBins = useMemo(() => bins.filter((bin) => bin.active), [bins]);
  const nearestBins = useMemo(() => {
    if (!location.point) return activeBins.map((bin) => ({ ...bin, distanceMeters: Number.POSITIVE_INFINITY }));
    return sortByNearest(location.point, activeBins);
  }, [activeBins, location.point]);
  const searchedBins = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);
    if (!normalizedQuery) return nearestBins;
    return nearestBins.filter((bin) => normalizeSearchText(`${bin.name} ${bin.location_name} ${bin.qr_code}`).includes(normalizedQuery));
  }, [nearestBins, searchQuery]);
  const locationClusters = useMemo(() => groupBinsByLocation(nearestBins), [nearestBins]);
  const searchedLocationClusters = useMemo(() => groupBinsByLocation(searchedBins), [searchedBins]);
  const visibleListClusters = searchedLocationClusters.slice(0, 6);
  const selectedLocation = selectedLocationKey ? locationClusters.find((cluster) => cluster.key === selectedLocationKey) ?? null : null;
  const token = mapToken();
  const center = useMemo<[number, number]>(() => (location.point ? [location.point.lng, location.point.lat] : daNangCenter), [location.point]);
  const zoom = location.point ? 14 : 12;

  const locationBlockedMessage = "Quyền định vị đang bị chặn. Hãy mở cài đặt trang web của trình duyệt, cho phép Location rồi bấm Dùng vị trí lại.";

  const requestLocation = useCallback(() => {
    return new Promise<GeoPoint>((resolve, reject) => {
      if (!window.isSecureContext) {
        const message = "Định vị chỉ hoạt động trên HTTPS hoặc localhost. Hãy mở bản production bằng https://.";
        setLocation({ status: "error", point: null, message });
        reject(new Error(message));
        return;
      }

      if (!("geolocation" in navigator)) {
        const message = "Trình duyệt này không hỗ trợ định vị. Bạn vẫn có thể xem các thùng ở Đà Nẵng trên bản đồ.";
        setLocation({ status: "error", point: null, message });
        reject(new Error(message));
        return;
      }

      setLocation({ status: "loading", point: null, message: "Đang xin quyền và lấy vị trí hiện tại..." });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation({
            status: "ready",
            point,
            message: "Đã có vị trí. Danh sách bên dưới đang xếp từ gần đến xa.",
          });
          resolve(point);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? locationBlockedMessage
              : error.code === error.TIMEOUT
                ? "Lấy vị trí quá lâu. Hãy bật GPS/Wi-Fi rồi bấm Dùng vị trí lại."
                : "Không lấy được vị trí hiện tại. Bản đồ vẫn hiển thị các thùng đang hoạt động.";
          setLocation({ status: "error", point: null, message });
          reject(new Error(message));
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
      );
    });
  }, [locationBlockedMessage]);

  async function handleLocateClick() {
    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (permission.state === "denied") {
          setLocation({ status: "error", point: null, message: locationBlockedMessage });
          return;
        }
      } catch {
        // Safari/iOS may not support querying geolocation permission; getCurrentPosition will handle it.
      }
    }

    await requestLocation().catch(() => null);
  }

  async function drawRouteToBin(bin: NearbyBin) {
    setRouteStatus("loading");
    setRouteMessage("");

    try {
      const origin = location.point ?? (await requestLocation());
      const response = await fetch("/api/goong/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination: { lat: bin.lat, lng: bin.lng },
          vehicle: "car",
          alternatives: false,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { routes?: DirectionsRoute[]; error?: string } | null;

      if (!response.ok || !payload?.routes?.[0]) {
        throw new Error(payload?.error ?? "Không thể lấy tuyến đường từ Goong.");
      }

      setActiveRoute({ bin, route: payload.routes[0] });
      setSelectedLocationKey(locationKey(bin));
      setRouteStatus("idle");
    } catch (error) {
      setRouteStatus("error");
      setRouteMessage(error instanceof Error ? error.message : "Không thể lấy tuyến đường từ Goong.");
    }
  }

  function clearRoute() {
    setActiveRoute(null);
    setRouteStatus("idle");
    setRouteMessage("");
  }

  function selectLocationCluster(cluster: LocationCluster) {
    setSelectedLocationKey(cluster.key);
  }

  function handlePopupAction(action: string, value: string) {
    if (action !== "route") return;
    const bin = activeBins.find((item) => item.id === value);
    if (!bin) return;
    void drawRouteToBin(bin);
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
              onClick={handleLocateClick}
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
        <div className="relative min-h-[380px] lg:col-span-8 lg:min-h-[560px]">
          <MapCanvas className="h-[380px] rounded-none border-0 sm:h-[500px] lg:h-full" center={center} zoom={zoom} styleUrl={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(token)}`}>
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
            {searchedLocationClusters.map((cluster) => {
              const primaryBin = cluster.bins[0];
              if (!primaryBin) return null;
              const active = activeRoute ? locationKey(activeRoute.bin) === cluster.key : selectedLocationKey === cluster.key;
              return (
              <MapMarker
                key={cluster.key}
                coordinate={[primaryBin.lng, primaryBin.lat]}
                label={cluster.name}
                markerHtml={locationMarkerHtml(active, cluster.bins.length)}
                popupHtml={locationClusterPopupHtml(cluster)}
                className="grid size-11 place-items-center border-0 bg-transparent p-0"
                onClick={() => selectLocationCluster(cluster)}
                onPopupAction={handlePopupAction}
              />
              );
            })}
            {activeRoute ? <MapRouteLine id="active-bin-route" coordinates={activeRoute.route.coordinates} color="#007a3d" width={7} opacity={0.95} /> : null}
          </MapCanvas>
          {activeRoute ? <RouteMapOverlay activeRoute={activeRoute} onClear={clearRoute} /> : null}
          {routeStatus === "error" && routeMessage ? <RouteErrorOverlay message={routeMessage} /> : null}
          {!activeRoute ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl border border-white/70 bg-white/92 p-3 shadow-[0_16px_42px_rgba(21,29,24,0.16)] backdrop-blur md:hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-[#3d4a3e]">{activeBins.length} thùng hoạt động</span>
                <span className="text-xs font-black text-[#007a3d]">{location.point ? "Đã sắp xếp theo vị trí" : "Đang ghim Đà Nẵng"}</span>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="flex min-h-0 flex-col border-t border-[#d9e5da] bg-[#fbfdfb] p-4 lg:col-span-4 lg:h-full lg:border-l lg:border-t-0 lg:p-5">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="grid grid-cols-3 gap-2">
              <PanelStat Icon={Trash2} label="Hoạt động" value={activeBins.length.toLocaleString("vi-VN")} />
              <PanelStat Icon={LocateFixed} label="Địa điểm" value={searchedLocationClusters.length.toLocaleString("vi-VN")} />
              <PanelStat Icon={ShieldCheck} label="QR riêng" value="100%" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black tracking-[-0.03em] text-[#151d18]">Danh sách gần nhất</h3>
              <span className="rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#007a3d]">{searchedLocationClusters.length} điểm</span>
            </div>
            <label className="mt-3 flex min-h-12 items-center gap-2 rounded-2xl border border-[#d9e5da] bg-white px-4 text-[#667468] shadow-[0_10px_26px_rgba(21,29,24,0.05)] focus-within:border-[#007a3d]">
              <Search size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#151d18] outline-none placeholder:text-[#8a978d]"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo tên, địa điểm hoặc mã QR"
                aria-label="Tìm thùng rác gần nhất"
              />
              {searchQuery ? (
                <button className="grid size-7 shrink-0 place-items-center rounded-full bg-[#edf6ed] text-[#3d4a3e] transition hover:bg-[#d8f5df]" type="button" onClick={() => setSearchQuery("")} aria-label="Xóa tìm kiếm">
                  <X size={14} />
                </button>
              ) : null}
            </label>
            <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1 lg:max-h-[300px]">
              {visibleListClusters.map((cluster) => (
                <LocationListItem active={activeRoute ? locationKey(activeRoute.bin) === cluster.key : selectedLocation?.key === cluster.key} cluster={cluster} key={cluster.key} loading={routeStatus === "loading"} routingActive={activeRoute ? locationKey(activeRoute.bin) === cluster.key : false} onDrawRoute={drawRouteToBin} onSelectLocation={selectLocationCluster} />
              ))}
              {activeBins.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#bbcbbb] bg-white p-5 text-center">
                  <p className="text-sm font-black text-[#3d4a3e]">Chưa có thùng rác hoạt động trong hệ thống.</p>
                </div>
              ) : null}
              {activeBins.length > 0 && visibleListClusters.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[#bbcbbb] bg-white p-5 text-center">
                  <p className="text-sm font-black text-[#3d4a3e]">Không tìm thấy thùng phù hợp.</p>
                  <p className="mt-2 text-xs font-bold leading-5 text-[#667468]">Thử tìm bằng tên địa điểm hoặc mã QR khác.</p>
                </div>
              ) : null}
            </div>
            {searchedLocationClusters.length > visibleListClusters.length ? (
              <p className="mt-3 text-center text-xs font-bold text-[#667468]">Đang hiển thị {visibleListClusters.length} địa điểm gần nhất. Bản đồ vẫn hiển thị toàn bộ điểm phù hợp.</p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function RouteMapOverlay({ activeRoute, onClear }: { activeRoute: ActiveRoute; onClear: () => void }) {
  const firstStep = activeRoute.route.steps[0];

  return (
    <article className="absolute inset-x-3 bottom-3 z-10 rounded-[22px] border border-white/70 bg-white/94 p-3 text-[#071b12] shadow-[0_20px_54px_rgba(7,27,18,0.22)] backdrop-blur-xl md:bottom-5 md:left-5 md:right-auto md:w-[460px] md:rounded-[24px]">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[#007a3d] text-white shadow-[0_12px_24px_rgba(0,109,55,0.24)] md:size-11">
          <Navigation size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#007a3d]">Đang chỉ đường</p>
              <h3 className="mt-1 line-clamp-1 text-[15px] font-black leading-tight tracking-[-0.03em] md:text-base">{activeRoute.bin.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-xs font-bold text-[#667468]">{activeRoute.bin.location_name}</p>
            </div>
            <button className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf6ed] text-[#3d4a3e] transition hover:bg-[#d8f5df]" type="button" onClick={onClear} aria-label="Đóng tuyến đường">
              <X size={15} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-3">
            <span className="rounded-full bg-[#edf6ed] px-3 py-1.5 text-xs font-black text-[#007a3d] md:text-sm">{activeRoute.route.distanceText || formatDistance(activeRoute.route.distanceMeters)}</span>
            <span className="rounded-full bg-[#edf6ed] px-3 py-1.5 text-xs font-black text-[#007a3d] md:text-sm">{activeRoute.route.durationText || formatDuration(activeRoute.route.durationSeconds)}</span>
            <a className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#071b12] px-3 text-xs font-black text-white transition hover:bg-[#003f24] md:min-h-9" href={googleMapsDirectionsUrl(activeRoute.bin)} rel="noreferrer" target="_blank" style={{ color: "#ffffff" }}>
              <Navigation size={14} />
              Mở map
            </a>
          </div>

          {firstStep ? (
            <p className="mt-2 hidden rounded-2xl bg-[#f3f8f3] px-3 py-2 text-xs font-bold leading-5 text-[#667468] md:line-clamp-2 md:block">
              Bước tiếp theo: <span className="text-[#151d18]">{firstStep.instruction || "Tiếp tục theo tuyến đường"}</span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function RouteErrorOverlay({ message }: { message: string }) {
  return (
    <div className="absolute left-3 right-3 top-3 z-10 flex items-start gap-2 rounded-2xl border border-[#ffd6d1] bg-[#fff1ef]/95 p-3 text-sm font-black text-[#ba1a1a] shadow-[0_16px_42px_rgba(21,29,24,0.16)] backdrop-blur md:left-5 md:right-auto md:max-w-[380px]">
      <AlertCircle className="mt-0.5 shrink-0" size={16} />
      <p>{message}</p>
    </div>
  );
}

function PanelStat({ Icon, label, value }: { Icon: typeof Trash2; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[18px] border border-[#d9e5da] bg-white p-3 shadow-[0_8px_20px_rgba(21,29,24,0.04)]">
      <Icon className="text-[#007a3d]" size={18} />
      <p className="mt-2 truncate text-xl font-black tracking-[-0.04em] text-[#151d18]">{value}</p>
      <p className="mt-0.5 truncate text-[11px] font-bold text-[#667468]">{label}</p>
    </div>
  );
}

function LocationListItem({
  active,
  cluster,
  loading,
  routingActive,
  onDrawRoute,
  onSelectLocation,
}: {
  active: boolean;
  cluster: LocationCluster;
  loading: boolean;
  routingActive: boolean;
  onDrawRoute: (bin: NearbyBin) => void;
  onSelectLocation: (cluster: LocationCluster) => void;
}) {
  const primaryBin = cluster.bins[0];
  const hasDistance = Number.isFinite(primaryBin?.distanceMeters);
  const qrCodes = cluster.bins.slice(0, 2).map((bin) => bin.qr_code);
  const hiddenQrCount = Math.max(cluster.bins.length - qrCodes.length, 0);
  if (!primaryBin) return null;

  return (
    <article className={`group rounded-[18px] border bg-white p-3 transition hover:border-[#007a3d] hover:shadow-[0_10px_24px_rgba(21,29,24,0.07)] ${active ? "border-[#007a3d] shadow-[0_10px_24px_rgba(0,109,55,0.11)]" : "border-[#d9e5da]"}`}>
      <div className="flex items-start gap-3">
        <button className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-[#00b96b] text-white transition hover:scale-105" type="button" onClick={() => onSelectLocation(cluster)} aria-label={`Xem các thùng tại ${cluster.name}`}>
          <Trash2 size={17} />
          {cluster.bins.length > 1 ? <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-white bg-[#071b12] text-[10px] font-black text-white">{cluster.bins.length}</span> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button className="block text-left" type="button" onClick={() => onSelectLocation(cluster)}>
                <span className="line-clamp-2 text-sm font-black leading-[1.15] text-[#151d18]">{cluster.name}</span>
                <span className="mt-1 line-clamp-1 text-xs font-bold text-[#667468]">{cluster.bins.length} thùng tại địa điểm này</span>
              </button>
            </div>
            {hasDistance ? <span className="shrink-0 rounded-full bg-[#d8f5df] px-2.5 py-1 text-[11px] font-black text-[#007a3d]">{formatDistance(primaryBin.distanceMeters)}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {qrCodes.map((qrCode) => (
              <span className="max-w-[150px] truncate rounded-full bg-[#edf6ed] px-2.5 py-1 text-[10px] font-black text-[#3d4a3e]" key={qrCode}>
                {qrCode}
              </span>
            ))}
            {hiddenQrCount > 0 ? <span className="rounded-full bg-[#edf6ed] px-2.5 py-1 text-[10px] font-black text-[#3d4a3e]">+{hiddenQrCount}</span> : null}
            <button className="inline-flex min-h-8 items-center gap-1 rounded-full bg-[#007a3d] px-3 py-1 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(0,109,55,0.18)] transition hover:bg-[#006a35] disabled:cursor-wait disabled:opacity-70" type="button" disabled={loading} onClick={() => onDrawRoute(primaryBin)} style={{ color: "#ffffff" }}>
              <Route size={13} />
              {loading ? "Đang vẽ..." : routingActive ? "Đang xem" : "Chỉ đường"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function groupBinsByLocation(bins: WithDistance<NearbyBin>[]): LocationCluster[] {
  const groups = new Map<string, LocationCluster>();

  for (const bin of bins) {
    const key = locationKey(bin);
    const existing = groups.get(key);
    if (existing) {
      existing.bins.push(bin);
    } else {
      groups.set(key, { key, name: bin.location_name, bins: [bin] });
    }
  }

  return [...groups.values()].sort((first, second) => {
    const firstDistance = first.bins[0]?.distanceMeters ?? Number.POSITIVE_INFINITY;
    const secondDistance = second.bins[0]?.distanceMeters ?? Number.POSITIVE_INFINITY;
    return firstDistance - secondDistance || first.name.localeCompare(second.name, "vi");
  });
}

function locationKey(bin: Pick<NearbyBin, "location_name" | "lat" | "lng">) {
  return `${bin.location_name.trim().toLowerCase()}-${bin.lat.toFixed(5)}-${bin.lng.toFixed(5)}`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} giờ ${remaining} phút` : `${hours} giờ`;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
