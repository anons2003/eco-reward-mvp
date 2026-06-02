# User Impact Nearby Bins Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real user-facing `Tác động` page where users can request browser location, see nearby smart bins on a MapLibre/Goong map, inspect distance/status, and open Google Maps directions.

**Architecture:** Add a new authenticated user route `/impact` that server-loads active bins from Supabase and passes them to a client map module. The client requests geolocation, computes distances locally, centers the map on the user, renders green bin markers plus a user-location marker, and lists nearest bins with directions links. Keep admin location management unchanged.

**Tech Stack:** Next.js App Router, React client components, Supabase SSR server client, MapLibre/Goong map components already in `src/components/ui/map.tsx`, lucide-react, Vitest for pure distance/search helpers.

---

<design_plan>
Python RNG Execution:
seed=246; hero_architecture="Editorial Split"; typography="Geist existing app font"; components=["map command panel", "ranked nearby bin list", "distance status rail"]; gsap=["card stacking", "hover physics"].
AIDA Check:
This is an authenticated app surface, not a marketing landing page. Navigation is provided by `UserAppShell`; Attention is the map-first command header; Interest is nearest-bin list and impact copy; Desire is live map + distance feedback; Action is scan/directions CTA.
Hero Math Verification:
Use `max-w-4xl` on the H1 with `text-3xl md:text-5xl` so Vietnamese heading stays within 2 lines. No decorative stamp icons, no fake badges, no meta labels.
Bento Density Verification:
Desktop grid uses `lg:grid-cols-12 grid-flow-dense`: map spans 8 columns, command/list panel spans 4 columns, lower stat rail uses 3 equal cards. 8+4 fills row one; 4+4+4 fills row two; no empty grid cells.
Label Sweep & Button Check:
No labels like SECTION/QUESTION. Primary button is green background with white text; secondary actions use white surface with dark text and clear focus ring.
</design_plan>

## File Structure

- Modify `src/components/user/user-app-shell.tsx`: change the `Tác động` nav item from `/dashboard#impact` to `/impact`.
- Create `src/app/(user)/impact/page.tsx`: authenticated server page; fetch active bins; render page shell and client map component.
- Create `src/components/user/nearby-bins-map.tsx`: client component for geolocation, map rendering, nearest list, permission/error states.
- Create `src/lib/geo-distance.ts`: pure distance helpers, distance formatting, nearest-bin sorting.
- Create `src/lib/geo-distance.test.ts`: unit tests for distance and nearest-bin sorting.
- Modify `src/components/ui/map.tsx` only if needed to support a lightweight custom marker style for user location; prefer using existing `MapMarker`.
- Optional modify `src/components/shared/dynamic-client-components.tsx`: add dynamic import wrapper only if `/impact/page.tsx` needs lazy loading similar to admin dynamic components.

## UX Specification

The `/impact` page should feel like an app workflow, not a content section.

First viewport desktop:
- Top: compact page title `Tác động xanh quanh bạn`.
- Supporting copy: `Bật định vị để xem thùng rác gần nhất và đi tới điểm phân loại phù hợp.`
- Primary button: `Dùng vị trí của tôi`.
- Secondary link/button: `Quét QR ngay` to `/scan`.
- Main grid: left map, right nearest-bin list.
- Map default before permission: centered Đà Nẵng `[108.2208, 16.0678]`, zoom `12`.
- After permission: center user coordinate, zoom `14`, show user marker and active bin markers.
- List: sorted by distance; each row includes bin name, location name, distance, active status, and `Chỉ đường`.
- Empty result: if no bins exist, show `Chưa có thùng rác hoạt động trong hệ thống.`
- Permission denied: show recovery text and keep Đà Nẵng map with all active bins.

Mobile:
- Title and location button first.
- Map height `min-h-[420px]`, full width.
- List follows map with dense rows.
- Bottom nav remains usable; no horizontal overflow.

## Task 1: Distance Helpers

**Files:**
- Create: `src/lib/geo-distance.ts`
- Create: `src/lib/geo-distance.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/geo-distance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { distanceMeters, formatDistance, sortByNearest, type GeoPoint } from "./geo-distance";

const daNangCenter: GeoPoint = { lat: 16.0678, lng: 108.2208 };

describe("geo-distance", () => {
  it("calculates distance in meters between nearby Da Nang coordinates", () => {
    const choHan: GeoPoint = { lat: 16.0681, lng: 108.2247 };

    expect(Math.round(distanceMeters(daNangCenter, choHan))).toBeGreaterThan(350);
    expect(Math.round(distanceMeters(daNangCenter, choHan))).toBeLessThan(500);
  });

  it("formats meters and kilometers for UI", () => {
    expect(formatDistance(120)).toBe("120 m");
    expect(formatDistance(1450)).toBe("1,5 km");
  });

  it("sorts bins nearest first and preserves bin payload", () => {
    const bins = [
      { id: "far", name: "Bến xe", lat: 16.0718, lng: 108.1502 },
      { id: "near", name: "Chợ Hàn", lat: 16.0681, lng: 108.2247 },
    ];

    const sorted = sortByNearest(daNangCenter, bins);

    expect(sorted.map((bin) => bin.id)).toEqual(["near", "far"]);
    expect(sorted[0]?.distanceMeters).toBeGreaterThan(0);
    expect(sorted[0]?.name).toBe("Chợ Hàn");
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
npm test -- src/lib/geo-distance.test.ts
```

Expected: FAIL because `src/lib/geo-distance.ts` does not exist.

- [ ] **Step 3: Implement helper**

Create `src/lib/geo-distance.ts`:

```ts
export type GeoPoint = {
  lat: number;
  lng: number;
};

export type WithCoordinate = GeoPoint & {
  id: string;
};

export type WithDistance<T> = T & {
  distanceMeters: number;
};

const earthRadiusMeters = 6_371_000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(first: GeoPoint, second: GeoPoint) {
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);

  const haversine = Math.sin(latDelta / 2) ** 2 + Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export function formatDistance(valueMeters: number) {
  if (valueMeters < 1000) return `${Math.round(valueMeters).toLocaleString("vi-VN")} m`;
  return `${(valueMeters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`;
}

export function sortByNearest<T extends WithCoordinate>(origin: GeoPoint, items: T[]): WithDistance<T>[] {
  return items
    .map((item) => ({
      ...item,
      distanceMeters: distanceMeters(origin, item),
    }))
    .toSorted((first, second) => first.distanceMeters - second.distanceMeters);
}
```

- [ ] **Step 4: Run tests and confirm pass**

Run:

```bash
npm test -- src/lib/geo-distance.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/geo-distance.ts src/lib/geo-distance.test.ts
git commit -m "Add nearby bin distance helpers"
```

## Task 2: Nearby Bins Client Map

**Files:**
- Create: `src/components/user/nearby-bins-map.tsx`

- [ ] **Step 1: Create client component**

Create `src/components/user/nearby-bins-map.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Crosshair, LocateFixed, MapPin, Navigation, ScanLine } from "lucide-react";
import Link from "next/link";
import { MapCanvas, MapControls, MapMarker } from "@/components/ui/map";
import { formatDistance, sortByNearest, type GeoPoint } from "@/lib/geo-distance";

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

function binMarkerHtml(active: boolean) {
  const color = active ? "#00b96b" : "#8b9098";
  return `<span style="background:${color}" class="grid size-11 place-items-center rounded-full border-[3px] border-white text-white shadow-[0_18px_38px_rgba(15,23,18,0.24)]"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></span>`;
}

function userMarkerHtml() {
  return `<span class="grid size-12 place-items-center rounded-full border-[4px] border-white bg-[#006d37] text-white shadow-[0_18px_38px_rgba(0,109,55,0.30)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg></span>`;
}

function popupHtml(bin: NearbyBin, distance?: number) {
  const distanceText = typeof distance === "number" ? `<p class="mt-1 text-xs font-bold text-white/65">${formatDistance(distance)} từ vị trí của bạn</p>` : "";
  return `
    <div class="min-w-60 rounded-2xl border border-white/10 bg-[#101412] p-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
      <p class="text-sm font-black leading-tight">${bin.name}</p>
      <p class="mt-1 text-xs font-bold text-white/65">${bin.location_name}</p>
      ${distanceText}
      <a class="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#101412]" href="https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}" target="_blank" rel="noreferrer">Chỉ đường</a>
    </div>
  `;
}

export function NearbyBinsMap({ bins }: { bins: NearbyBin[] }) {
  const [location, setLocation] = useState<LocationState>({
    status: "idle",
    point: null,
    message: "Bật định vị để sắp xếp thùng rác theo khoảng cách thật.",
  });

  const activeBins = useMemo(() => bins.filter((bin) => bin.active), [bins]);
  const rankedBins = useMemo(() => {
    if (!location.point) return activeBins.map((bin) => ({ ...bin, distanceMeters: null as number | null }));
    return sortByNearest(location.point, activeBins).map((bin) => ({ ...bin, distanceMeters: bin.distanceMeters as number | null }));
  }, [activeBins, location.point]);

  const mapCenter: [number, number] = location.point ? [location.point.lng, location.point.lat] : daNangCenter;
  const mapZoom = location.point ? 14 : 12;

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocation({ status: "error", point: null, message: "Trình duyệt này không hỗ trợ định vị." });
      return;
    }

    setLocation({ status: "loading", point: null, message: "Đang xin quyền định vị..." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          status: "ready",
          point: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          message: "Đã dùng vị trí của bạn để sắp xếp thùng rác gần nhất.",
        });
      },
      () => {
        setLocation({
          status: "error",
          point: null,
          message: "Không lấy được vị trí. Bạn vẫn có thể xem các thùng rác đang hoạt động tại Đà Nẵng.",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="grid-flow-dense grid gap-5 lg:grid-cols-12">
      <section className="overflow-hidden rounded-[28px] border border-[#bbcbbb]/30 bg-white shadow-[0_18px_48px_rgba(45,156,219,0.08)] lg:col-span-8">
        <MapCanvas className="h-[430px] md:h-[560px]" center={mapCenter} zoom={mapZoom} styleUrl={`${process.env.NEXT_PUBLIC_GOONG_MAP_STYLE_URL ?? ""}`}>
          <MapControls position="top-right" showZoom showCompass showFullscreen showLocate resetCenter={mapCenter} resetZoom={mapZoom} />
          {location.point ? <MapMarker coordinate={[location.point.lng, location.point.lat]} label="Vị trí của bạn" markerHtml={userMarkerHtml()} /> : null}
          {rankedBins.map((bin) => (
            <MapMarker
              key={bin.id}
              coordinate={[bin.lng, bin.lat]}
              label={bin.name}
              markerHtml={binMarkerHtml(bin.active)}
              popupHtml={popupHtml(bin, bin.distanceMeters ?? undefined)}
            />
          ))}
        </MapCanvas>
      </section>

      <aside className="grid content-start gap-4 rounded-[28px] border border-[#bbcbbb]/30 bg-white p-5 shadow-[0_18px_48px_rgba(45,156,219,0.08)] lg:col-span-4">
        <div>
          <h2 className="text-xl font-black tracking-[-0.04em] text-[#151d18]">Thùng gần bạn</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[#5d6a60]">{location.message}</p>
        </div>

        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          disabled={location.status === "loading"}
          onClick={requestLocation}
          type="button"
        >
          <LocateFixed size={18} />
          {location.status === "loading" ? "Đang định vị..." : "Dùng vị trí của tôi"}
        </button>

        <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d9e5da] bg-white px-5 text-sm font-black text-[#151d18] transition hover:bg-[#edf6ed]" href="/scan">
          <ScanLine size={18} />
          Quét QR ngay
        </Link>

        <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
          {rankedBins.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#bbcbbb] bg-[#f5f3f2] p-5 text-sm font-black text-[#3d4a3e]">Chưa có thùng rác hoạt động trong hệ thống.</div>
          ) : null}

          {rankedBins.map((bin) => (
            <article className="group rounded-2xl border border-[#bbcbbb]/40 bg-[#fbf9f8] p-4 transition hover:-translate-y-0.5 hover:border-[#007a3d]/45 hover:shadow-[0_14px_28px_rgba(21,29,24,0.08)]" key={bin.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#2c3e50]">{bin.name}</p>
                  <p className="mt-1 text-xs font-bold text-[#5d6a60]">{bin.location_name}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#007a3d]">
                  {typeof bin.distanceMeters === "number" ? formatDistance(bin.distanceMeters) : "Đà Nẵng"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#006492]">
                  <MapPin size={13} />
                  {bin.qr_code}
                </span>
                <a className="inline-flex items-center gap-1 rounded-full bg-[#101412] px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-[#007a3d]" href={`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`} target="_blank" rel="noreferrer">
                  <Navigation size={13} />
                  Chỉ đường
                </a>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Fix Goong style URL integration**

The code above intentionally exposes the likely issue: `MapCanvas` currently expects a full style URL, while the project uses `NEXT_PUBLIC_GOONG_MAPTILES_KEY`. Replace this line:

```tsx
styleUrl={`${process.env.NEXT_PUBLIC_GOONG_MAP_STYLE_URL ?? ""}`}
```

with:

```tsx
styleUrl={`https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY ?? "")}`}
```

Expected: component compiles and uses the same Goong tiles setup as admin maps.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS. If lint flags a long line, split JSX props across lines without changing behavior.

- [ ] **Step 4: Commit**

```bash
git add src/components/user/nearby-bins-map.tsx
git commit -m "Add nearby bins map component"
```

## Task 3: Real `/impact` Route

**Files:**
- Create: `src/app/(user)/impact/page.tsx`

- [ ] **Step 1: Create server page**

Create `src/app/(user)/impact/page.tsx`:

```tsx
import Link from "next/link";
import { ArrowRight, Leaf, MapPin, Navigation } from "lucide-react";
import { NearbyBinsMap, type NearbyBin } from "@/components/user/nearby-bins-map";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "qr_code" | "location_name" | "lat" | "lng" | "active">;

const binColumns = "id,name,qr_code,location_name,lat,lng,active";

export default async function ImpactPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bins").select(binColumns).eq("active", true).order("name", { ascending: true });
  const bins = ((data ?? []) as BinRow[]).map((bin) => ({
    id: bin.id,
    name: bin.name,
    qr_code: bin.qr_code,
    location_name: bin.location_name,
    lat: bin.lat,
    lng: bin.lng,
    active: bin.active,
  })) satisfies NearbyBin[];

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <section className="space-y-6">
        <div className="grid-flow-dense grid gap-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9e5da] bg-white px-4 py-2 text-xs font-black text-[#007a3d]">
              <Leaf size={15} />
              Tác động xanh
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-[-0.05em] text-[#151d18] md:text-5xl">
              Tìm thùng rác gần bạn để phân loại đúng nơi.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#5d6a60]">
              Bật định vị để SeaTech sắp xếp các thùng rác thông minh quanh khu vực của bạn và mở chỉ đường bằng Google Maps.
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-[#bbcbbb]/30 bg-white p-5 shadow-[0_18px_48px_rgba(45,156,219,0.08)] lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
                <MapPin size={22} />
              </span>
              <div>
                <p className="text-2xl font-black tracking-[-0.04em] text-[#151d18]">{bins.length.toLocaleString("vi-VN")}</p>
                <p className="text-sm font-bold text-[#5d6a60]">thùng đang hoạt động</p>
              </div>
            </div>
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#101412] px-5 text-sm font-black text-white transition hover:bg-[#007a3d]" href="/scan">
              Bắt đầu quét
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/35 p-5 text-sm font-black text-[#ba1a1a]">
            Không thể tải danh sách thùng rác đang hoạt động.
          </div>
        ) : null}

        <NearbyBinsMap bins={bins} />

        <section className="grid-flow-dense grid gap-4 md:grid-cols-3">
          <ImpactCard title="Định vị chủ động" body="Vị trí chỉ dùng trong trình duyệt để sắp xếp thùng gần nhất." Icon={Navigation} />
          <ImpactCard title="Đi đúng điểm" body="Mỗi thùng có liên kết chỉ đường Google Maps theo tọa độ đã lưu." Icon={MapPin} />
          <ImpactCard title="Quét sau khi tới nơi" body="Đi tới thùng gần nhất, quét QR và gửi ảnh phân loại như luồng hiện tại." Icon={Leaf} />
        </section>
      </section>
    </main>
  );
}

function ImpactCard({ title, body, Icon }: { title: string; body: string; Icon: typeof Leaf }) {
  return (
    <article className="group rounded-[26px] border border-[#bbcbbb]/30 bg-white p-5 shadow-[0_14px_38px_rgba(45,156,219,0.07)] transition hover:-translate-y-0.5 hover:border-[#007a3d]/45">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#edf6ed] text-[#007a3d] transition duration-500 group-hover:scale-105">
        <Icon size={22} />
      </span>
      <h2 className="mt-5 text-lg font-black tracking-[-0.04em] text-[#151d18]">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5d6a60]">{body}</p>
    </article>
  );
}
```

- [ ] **Step 2: Run TypeScript/build**

Run:

```bash
npm run build
```

Expected: PASS. If `Icon` typing fails in `ImpactCard`, import `type LucideIcon` from `lucide-react` and change prop to `Icon: LucideIcon`.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/(user)/impact/page.tsx'
git commit -m "Add user impact map page"
```

## Task 4: Navigation And Existing Dashboard Link

**Files:**
- Modify: `src/components/user/user-app-shell.tsx`
- Modify: `src/app/(user)/dashboard/page.tsx`

- [ ] **Step 1: Update user shell nav**

In `src/components/user/user-app-shell.tsx`, replace:

```ts
{ href: "/dashboard#impact", label: "Tác động", Icon: Leaf, match: "/dashboard#impact" },
```

with:

```ts
{ href: "/impact", label: "Tác động", Icon: Leaf, match: "/impact" },
```

- [ ] **Step 2: Update dashboard quick link**

In `src/app/(user)/dashboard/page.tsx`, keep the existing dashboard `#impact` section if it shows personal impact stats, but add a clear CTA inside that section:

```tsx
<Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#007a3d] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,106,61,0.18)] transition hover:bg-[#006a35]" href="/impact">
  Xem thùng gần bạn
</Link>
```

Place it inside the `id="impact"` section after the section heading/subcopy, before lower cards. If the section structure makes this awkward, add it as the first action in that panel without changing existing stats.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/user/user-app-shell.tsx 'src/app/(user)/dashboard/page.tsx'
git commit -m "Link impact navigation to nearby bins"
```

## Task 5: Map Environment And Fallback Hardening

**Files:**
- Modify: `src/components/user/nearby-bins-map.tsx`
- Optional Modify: `src/components/ui/map.tsx`

- [ ] **Step 1: Add missing map key fallback**

At the top of `NearbyBinsMap`, compute:

```tsx
const maptilesKey = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;
```

Before rendering `MapCanvas`, add:

```tsx
if (!maptilesKey) {
  return (
    <div className="rounded-[28px] border border-[#bbcbbb]/30 bg-white p-6 text-sm font-black text-[#3d4a3e] shadow-[0_18px_48px_rgba(45,156,219,0.08)]">
      Thiếu NEXT_PUBLIC_GOONG_MAPTILES_KEY. Cấu hình Goong Maptiles key để bật bản đồ thùng rác.
    </div>
  );
}
```

Then use:

```tsx
const styleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(maptilesKey)}`;
```

and pass `styleUrl={styleUrl}` to `MapCanvas`.

- [ ] **Step 2: Verify `MapCanvas` WebGL fallback still protects page**

Inspect `src/components/ui/map.tsx`. It should already catch map init failure and show:

```tsx
Không thể khởi tạo WebGL cho bản đồ trên trình duyệt này.
```

Do not duplicate this logic in the user component.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/user/nearby-bins-map.tsx src/components/ui/map.tsx
git commit -m "Harden user nearby bins map fallback"
```

## Task 6: Browser QA Desktop And Mobile

**Files:**
- No source files unless QA finds defects.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: app starts on `http://localhost:3000` or the next available port.

- [ ] **Step 2: Login as user**

Use:

```txt
user@seatech.app
SeaTech123!
```

Navigate to `/impact`.

Expected:
- Page title renders.
- `Dùng vị trí của tôi` button is visible.
- Map renders or map fallback renders without framework overlay.
- List shows all active bins before location permission.

- [ ] **Step 3: Test geolocation allowed**

In browser automation, grant geolocation permission and set coordinates near Đà Nẵng center:

```ts
await context.grantPermissions(["geolocation"]);
await context.setGeolocation({ latitude: 16.0678, longitude: 108.2208 });
```

Click `Dùng vị trí của tôi`.

Expected:
- Message changes to `Đã dùng vị trí của bạn...`
- Nearest list shows meter/km distances.
- `Chợ Hàn`, `Cầu Rồng`, or `Công viên APEC` appear near top depending exact coordinate.
- Google Maps `Chỉ đường` links include `destination=<lat>,<lng>`.

- [ ] **Step 4: Test geolocation denied**

Reload with permission denied.

Expected:
- Page does not crash.
- Error text says location could not be obtained.
- Map/list still shows active Đà Nẵng bins.

- [ ] **Step 5: Test mobile**

Set viewport `390x844`.

Expected:
- No horizontal overflow.
- Header, map, button, nearest list fit.
- Bottom nav marks `Tác động` active and remains accessible.
- Map does not cover bottom nav.

- [ ] **Step 6: Run final checks**

Run:

```bash
npm run lint
npm test -- src/lib/geo-distance.test.ts
npm run build
```

Expected: all PASS.

- [ ] **Step 7: Commit QA fixes if needed**

Only if source changed:

```bash
git add <changed-files>
git commit -m "Polish impact map responsive QA"
```

## Task 7: Production Deploy

**Files:**
- No source files.

- [ ] **Step 1: Check git status**

Run:

```bash
git status --short
```

Expected: clean or only intentional committed changes.

- [ ] **Step 2: Push branch**

Run:

```bash
git push -u origin "$(git branch --show-current)"
```

Expected: push succeeds.

- [ ] **Step 3: Deploy production**

Run:

```bash
npx vercel deploy --prod --yes
```

Expected: Vercel returns `readyState: READY` and aliases `https://eco-reward-mvp.vercel.app`.

- [ ] **Step 4: Smoke production**

Run:

```bash
APP_URL=https://eco-reward-mvp.vercel.app npm run smoke:prod
```

Expected: existing smoke routes pass. Manually add `/impact` check:

```bash
curl -I https://eco-reward-mvp.vercel.app/impact
```

Expected: `307` if unauthenticated redirect is expected, or `200` if current session/cookie is available through browser.

## Self-Review

Spec coverage:
- Real `Tác động` route: Task 3.
- User location permission: Task 2 and Task 6.
- Nearby bins on map: Task 2.
- UI/system design: design plan, UX spec, Tasks 2-4.
- Mobile and desktop logic: Task 6.
- Existing Goong/MapLibre/Google directions combo: Tasks 2 and 5.

Placeholder scan:
- No TBD/TODO placeholders. Every implementation step has concrete file paths and code snippets.

Type consistency:
- `NearbyBin` is defined in Task 2 and imported by Task 3.
- `GeoPoint`, `sortByNearest`, `formatDistance` are defined in Task 1 and used by Task 2.
- Map style URL uses the existing `NEXT_PUBLIC_GOONG_MAPTILES_KEY` already used by admin maps.

