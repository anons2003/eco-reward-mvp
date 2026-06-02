"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import maplibregl, { type LngLatLike, type Map as MapLibreInstance, type MapMouseEvent, type Marker as MapLibreMarker, type StyleSpecification } from "maplibre-gl";
import { Compass, LocateFixed, Maximize2, Minus, Plus } from "lucide-react";

type MapContextValue = {
  map: MapLibreInstance | null;
};

const MapContext = createContext<MapContextValue>({ map: null });

export type MapCanvasProps = {
  center: [number, number];
  zoom: number;
  styleUrl: string;
  className?: string;
  children?: ReactNode;
  onMapClick?: (coordinate: { lat: number; lng: number }) => void;
};

export function MapCanvas({ center, zoom, styleUrl, className, children, onMapClick }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreInstance | null>(null);
  const [map, setMap] = useState<MapLibreInstance | null>(null);
  const [style, setStyle] = useState<StyleSpecification | null>(null);
  const [styleError, setStyleError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadStyle() {
      setStyleError("");
      try {
        const sanitizedStyle = await fetchSanitizedStyle(styleUrl);
        if (!ignore) setStyle(sanitizedStyle);
      } catch {
        if (!ignore) setStyleError("Không thể tải style bản đồ Goong.");
      }
    }

    void loadStyle();

    return () => {
      ignore = true;
    };
  }, [styleUrl]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !style) return;

    setMapError("");

    try {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style,
        center,
        zoom,
        attributionControl: false,
      });
    } catch {
      queueMicrotask(() => setMapError("Không thể khởi tạo WebGL cho bản đồ trên trình duyệt này."));
      return;
    }

    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    mapRef.current.on("styleimagemissing", (event) => {
      if (!mapRef.current?.hasImage(event.id)) {
        mapRef.current?.addImage(event.id, createTransparentPixel());
      }
    });
    setMap(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, [center, style, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center, zoom, essential: true });
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current || !onMapClick) return;
    const clickHandler = onMapClick;

    function handleClick(event: MapMouseEvent) {
      clickHandler({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    }

    mapRef.current.on("click", handleClick);
    return () => {
      mapRef.current?.off("click", handleClick);
    };
  }, [onMapClick]);

  return (
    <MapContext.Provider value={{ map }}>
      <div className={`relative overflow-hidden rounded-3xl border border-[#bbcbbb]/35 bg-[#f5f3f2] ${className ?? ""}`}>
        <div ref={containerRef} className="absolute inset-0" style={{ position: "absolute", inset: 0 }} />
        {!style && !styleError ? <div className="absolute inset-0 grid place-items-center text-sm font-black text-[#3d4a3e]">Đang tải bản đồ...</div> : null}
        {styleError ? <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-black text-[#ba1a1a]">{styleError}</div> : null}
        {mapError ? <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-black text-[#3d4a3e]">{mapError}</div> : null}
        {children}
      </div>
    </MapContext.Provider>
  );
}

type VectorSourceMetadata = {
  vector_layers?: { id: string }[];
};

async function fetchSanitizedStyle(styleUrl: string): Promise<StyleSpecification> {
  const response = await fetch(styleUrl);
  if (!response.ok) throw new Error("Unable to load map style");

  const style = (await response.json()) as StyleSpecification;
  const availableLayersBySource = await loadVectorLayersBySource(style);

  return {
    ...style,
    layers: style.layers.filter((layer) => {
      const source = "source" in layer ? layer.source : undefined;
      const sourceLayer = "source-layer" in layer ? layer["source-layer"] : undefined;
      if (!source || !sourceLayer) return true;

      const availableLayers = availableLayersBySource.get(source);
      if (!availableLayers) return true;

      return availableLayers.has(sourceLayer);
    }),
  };
}

async function loadVectorLayersBySource(style: StyleSpecification) {
  const entries = await Promise.all(
    Object.entries(style.sources).map(async ([sourceId, source]) => {
      if (!("url" in source) || typeof source.url !== "string") return [sourceId, null] as const;

      const response = await fetch(source.url);
      if (!response.ok) return [sourceId, null] as const;

      const metadata = (await response.json()) as VectorSourceMetadata;
      return [sourceId, new Set((metadata.vector_layers ?? []).map((layer) => layer.id))] as const;
    }),
  );

  return new Map(entries.filter((entry): entry is readonly [string, Set<string>] => entry[1] !== null));
}

function createTransparentPixel() {
  return {
    width: 1,
    height: 1,
    data: new Uint8Array([0, 0, 0, 0]),
  };
}

export type MapControlsProps = {
  position?: "top-right" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showFullscreen?: boolean;
  showLocate?: boolean;
  resetCenter?: [number, number];
  resetZoom?: number;
};

export function MapControls({ position = "top-right", showZoom = true, showCompass = true, showFullscreen = true, showLocate = false, resetCenter, resetZoom }: MapControlsProps) {
  const { map } = useContext(MapContext);
  const positionClass = position === "bottom-right" ? "bottom-4 right-4" : "right-4 top-4";

  return (
    <div className={`absolute z-10 grid gap-2 ${positionClass}`}>
      {showZoom ? (
        <div className="overflow-hidden rounded-xl border border-[#bbcbbb]/70 bg-white shadow-[0_14px_30px_rgba(21,29,24,0.12)]">
          <ControlButton label="Phóng to bản đồ" onClick={() => map?.zoomIn()}>
            <Plus size={16} />
          </ControlButton>
          <div className="h-px bg-[#bbcbbb]/45" />
          <ControlButton label="Thu nhỏ bản đồ" onClick={() => map?.zoomOut()}>
            <Minus size={16} />
          </ControlButton>
        </div>
      ) : null}
      {showCompass ? (
        <ControlButton label="Đặt lại hướng bản đồ" standalone onClick={() => map?.resetNorthPitch()}>
          <Compass size={16} />
        </ControlButton>
      ) : null}
      {showLocate && resetCenter ? (
        <ControlButton label="Về trung tâm vận hành" standalone onClick={() => map?.flyTo({ center: resetCenter, zoom: resetZoom ?? map.getZoom(), essential: true })}>
          <LocateFixed size={16} />
        </ControlButton>
      ) : null}
      {showFullscreen ? (
        <ControlButton label="Phóng toàn màn hình" standalone onClick={() => map?.getContainer().requestFullscreen?.()}>
          <Maximize2 size={16} />
        </ControlButton>
      ) : null}
    </div>
  );
}

function ControlButton({ children, label, standalone = false, onClick }: { children: ReactNode; label: string; standalone?: boolean; onClick: () => void }) {
  return (
    <button className={`${standalone ? "rounded-xl border border-[#bbcbbb]/70 bg-white shadow-[0_14px_30px_rgba(21,29,24,0.12)]" : ""} grid size-10 place-items-center text-[#1b1c1b] transition hover:bg-[#edf6ed] hover:text-[#006d37] active:scale-95`} type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

export type MapMarkerProps = {
  coordinate: [number, number];
  label: string;
  popupHtml?: string;
  markerHtml?: string;
  className?: string;
};

export function MapMarker({ coordinate, label, popupHtml, markerHtml, className }: MapMarkerProps) {
  const { map } = useContext(MapContext);
  const markerRef = useRef<MapLibreMarker | null>(null);

  useEffect(() => {
    if (!map) return;
    const mapInstance = map;

    const markerElement = document.createElement("button");
    markerElement.type = "button";
    markerElement.className =
      className ??
      "group relative grid size-9 place-items-center rounded-full border-[3px] border-white bg-[#006d37] text-white shadow-[0_14px_34px_rgba(0,109,55,0.3)] ring-0 ring-white/0 transition-[box-shadow,filter] duration-200 hover:ring-4 hover:ring-white/70 hover:brightness-105";
    markerElement.setAttribute("aria-label", label);
    markerElement.innerHTML = markerHtml ?? '<span class="size-2.5 rounded-full bg-white"></span>';

    const popupElement = document.createElement("div");
    popupElement.innerHTML =
      popupHtml ??
      `<div class="min-w-56 rounded-2xl border border-white/10 bg-[#101412] p-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.32)]"><p class="text-sm font-black">${label}</p></div>`;
    const popup = new maplibregl.Popup({ offset: 20, closeButton: true, maxWidth: "none" }).setDOMContent(popupElement);

    function handleMarkerClick(event: MouseEvent) {
      event.stopPropagation();
      if (popup.isOpen()) {
        popup.remove();
        return;
      }
      popup.setLngLat(coordinate as LngLatLike).addTo(mapInstance);
    }

    markerElement.addEventListener("click", handleMarkerClick);
    markerRef.current = new maplibregl.Marker({ element: markerElement }).setLngLat(coordinate as LngLatLike).addTo(mapInstance);

    return () => {
      markerElement.removeEventListener("click", handleMarkerClick);
      popup.remove();
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [className, coordinate, label, map, markerHtml, popupHtml]);

  return null;
}
