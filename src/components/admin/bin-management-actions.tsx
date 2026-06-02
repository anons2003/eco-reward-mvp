"use client";

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Edit3, MapPin, PackagePlus, Trash2 } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Database["public"]["Tables"]["bins"]["Row"];
type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
type DialogMode = "create" | "edit";

type GoongPrediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type GoongDetail = {
  name?: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
};

type BinManagementActionsProps = {
  bin?: BinRow;
  variant?: "compact" | "toolbar";
  locations?: Pick<LocationRow, "id" | "name" | "address" | "district" | "ward" | "lat" | "lng">[];
};

const compactButtonClass = "grid size-9 shrink-0 place-items-center rounded-lg transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-55";
const toolbarButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black shadow-[0_12px_24px_rgba(21,29,24,0.08)] transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55";
const fieldClass = "h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20";
const daNangDefaultCoordinate = {
  lat: 16.0678,
  lng: 108.2208,
};

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: unknown; issues?: Record<string, unknown> } | null;
  const message = typeof body?.error === "string" ? body.error.trim() : "";
  const issueCount = body?.issues && typeof body.issues === "object" ? Object.keys(body.issues).length : 0;
  if (!message) return fallback;
  return issueCount > 0 ? `${fallback}: ${message} (${issueCount} lỗi dữ liệu)` : `${fallback}: ${message}`;
}

export function BinManagementActions({ bin, variant = "compact", locations = [] }: BinManagementActionsProps) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [loadingAction, setLoadingAction] = useState<"submit" | "delete" | "place" | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<GoongPrediction[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState(bin?.location_id ?? "");
  const [pickedLocation, setPickedLocation] = useState({
    name: "",
    address: "",
    lat: daNangDefaultCoordinate.lat,
    lng: daNangDefaultCoordinate.lng,
  });
  const selectedLocation = locations.find((location) => location.id === selectedLocationId);
  const isCreate = dialogMode === "create";
  const hasPredictions = predictions.length > 0;

  const closeDialog = useCallback(() => {
    if (loadingAction) return;
    setError("");
    setPredictions([]);
    setDialogMode(null);
  }, [loadingAction]);

  useEffect(() => {
    if (!dialogMode) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDialog();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeDialog, dialogMode]);

  useEffect(() => {
    if (!isCreate || query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/admin/goong/autocomplete?input=${encodeURIComponent(query.trim())}`, { signal: controller.signal }).catch(() => null);
      if (!response?.ok) return;
      const body = (await response.json().catch(() => null)) as { predictions?: GoongPrediction[] } | null;
      setPredictions(body?.predictions ?? []);
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [isCreate, query]);

  function openDialog(mode: DialogMode) {
    setError("");
    setPredictions([]);
    setQuery("");
    setSelectedLocationId(bin?.location_id ?? "");
    setPickedLocation({
      name: "",
      address: "",
      lat: daNangDefaultCoordinate.lat,
      lng: daNangDefaultCoordinate.lng,
    });
    setDialogMode(mode);
  }

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeDialog();
  }

  async function choosePrediction(prediction: GoongPrediction) {
    setError("");
    setLoadingAction("place");

    try {
      const response = await fetch(`/api/admin/goong/place-detail?placeId=${encodeURIComponent(prediction.place_id)}`);
      if (!response.ok) {
        setError(await readError(response, "Không thể lấy tọa độ từ Goong"));
        return;
      }

      const body = (await response.json().catch(() => null)) as { result?: GoongDetail } | null;
      const detail = body?.result;
      const lat = detail?.geometry?.location?.lat;
      const lng = detail?.geometry?.location?.lng;
      if (typeof lat !== "number" || typeof lng !== "number") {
        setError("Goong không trả về tọa độ cho địa điểm này.");
        return;
      }

      const address = detail?.formatted_address || prediction.description;
      setPickedLocation((current) => ({
        ...current,
        name: current.name || detail?.name || prediction.structured_formatting?.main_text || prediction.description,
        address,
        lat: roundCoordinate(lat),
        lng: roundCoordinate(lng),
      }));
      setQuery(prediction.description);
      setPredictions([]);
    } finally {
      setLoadingAction(null);
    }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoadingAction("submit");
    setGlobalLoading("Đang lưu thùng rác...");

    const formData = new FormData(event.currentTarget);
    const isEdit = dialogMode === "edit" && bin;
    const active = stringValue(formData, "active") === "true";
    const payload = isEdit
      ? {
          name: stringValue(formData, "name"),
          qrCode: stringValue(formData, "qrCode"),
          locationId: stringValue(formData, "locationId"),
          active,
        }
      : {
          name: stringValue(formData, "name"),
          location: {
            name: stringValue(formData, "locationName"),
            address: stringValue(formData, "address"),
            lat: Number.parseFloat(stringValue(formData, "lat")),
            lng: Number.parseFloat(stringValue(formData, "lng")),
            active: true,
          },
          active,
        };

    try {
      const response = await fetch(isEdit ? `/api/admin/bins/${bin.id}` : "/api/admin/bins", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(await readError(response, "Không thể lưu thùng rác"));
        return;
      }

      setDialogMode(null);
      router.refresh();
    } finally {
      setLoadingAction(null);
      clearGlobalLoading();
    }
  }

  async function deactivateBin() {
    if (!bin || !window.confirm("Ẩn thùng rác này khỏi luồng quét của người dùng?")) return;

    setError("");
    setLoadingAction("delete");
    setGlobalLoading("Đang ẩn thùng rác...");

    try {
      const response = await fetch(`/api/admin/bins/${bin.id}`, { method: "DELETE" });
      if (!response.ok) {
        setError(await readError(response, "Không thể ẩn thùng rác"));
        return;
      }
      router.refresh();
    } finally {
      setLoadingAction(null);
      clearGlobalLoading();
    }
  }

  return (
    <>
      {bin ? (
        <div className={variant === "toolbar" ? "flex flex-wrap items-center gap-3" : "inline-flex shrink-0 items-center justify-end gap-1.5"}>
          <button
            className={
              variant === "toolbar"
                ? `${toolbarButtonClass} border border-[#bbcbbb]/70 bg-white text-[#1b1c1b] hover:bg-[#f5f3f2]`
                : `${compactButtonClass} text-[#2d9cdb] hover:bg-[#2d9cdb]/10`
            }
            type="button"
            title="Sửa thùng rác"
            aria-label="Sửa thùng rác"
            disabled={loadingAction !== null}
            onClick={() => openDialog("edit")}
          >
            <Edit3 size={18} />
            {variant === "toolbar" ? "Chỉnh sửa" : null}
          </button>
          <button
            className={
              variant === "toolbar"
                ? `${toolbarButtonClass} bg-[#c41d24] text-white hover:bg-[#aa171d]`
                : `${compactButtonClass} text-[#ba1a1a] hover:bg-[#ffdad6]/55`
            }
            type="button"
            title="Ẩn thùng rác"
            aria-label="Ẩn thùng rác"
            disabled={loadingAction !== null}
            onClick={deactivateBin}
          >
            <Trash2 size={18} />
            {variant === "toolbar" ? "Ẩn" : null}
          </button>
        </div>
      ) : (
        <button className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#2ecc71] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(46,204,113,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button" onClick={() => openDialog("create")}>
          <PackagePlus size={18} />
          Thêm thùng mới
        </button>
      )}
      {bin && error ? <p className="mt-2 max-w-60 text-right text-xs font-black text-[#ba1a1a]">{error}</p> : null}

      {dialogMode
        ? createPortal(
            <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[#1b1c1b]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bin-management-dialog-title" onMouseDown={closeFromBackdrop}>
              <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#bbcbbb]/50 bg-[#fbf9f8] p-5 shadow-[0_24px_80px_rgba(21,29,24,0.24)]">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black tracking-[-0.03em] text-[#1b1c1b]" id="bin-management-dialog-title">
                    {dialogMode === "create" ? "Thêm thùng rác" : "Sửa thùng rác"}
                  </h2>
                  <button className="grid size-9 shrink-0 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#e9e8e7]" type="button" aria-label="Đóng" onClick={closeDialog}>
                    ×
                  </button>
                </div>

                <form className="mt-5 grid gap-4" onSubmit={submitForm}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Tên thùng" name="name" defaultValue={bin?.name ?? ""} required />
                    {isCreate ? (
                      <div className="rounded-xl border border-[#bbcbbb]/70 bg-[#edf6ed] px-4 py-3">
                        <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Mã QR</span>
                        <p className="mt-1 text-sm font-black text-[#006d37]">Tự sinh khi tạo thùng</p>
                        <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">Server kiểm tra unique bằng constraint QR trong database.</p>
                      </div>
                    ) : (
                      <Field label="Mã QR" name="qrCode" defaultValue={bin?.qr_code ?? ""} required />
                    )}
                  </div>

                  {isCreate ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Tên địa điểm" name="locationName" value={pickedLocation.name} onChange={(value) => setPickedLocation((current) => ({ ...current, name: value }))} required />
                        <div className="relative grid gap-2 md:col-span-2">
                          <Field
                            label="Địa chỉ"
                            name="address"
                            value={pickedLocation.address}
                            onChange={(value) => {
                              setPickedLocation((current) => ({ ...current, address: value }));
                              setQuery(value);
                              if (value.trim().length < 2) setPredictions([]);
                            }}
                            required
                          />
                          <p className="text-xs font-bold text-[#6c7b6d]">{loadingAction === "place" ? "Đang lấy tọa độ..." : "Nhập địa chỉ và chọn gợi ý Goong để tự điền tọa độ."}</p>
                          {hasPredictions ? (
                            <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#bbcbbb]/60 bg-white p-2 shadow-[0_18px_42px_rgba(21,29,24,0.18)]">
                              {predictions.map((prediction) => (
                                <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[#edf6ed]" type="button" key={prediction.place_id} onClick={() => choosePrediction(prediction)}>
                                  <MapPin className="mt-0.5 shrink-0 text-[#006d37]" size={17} />
                                  <span>
                                    <span className="block text-sm font-black text-[#1b1c1b]">{prediction.structured_formatting?.main_text ?? prediction.description}</span>
                                    <span className="mt-0.5 block text-xs font-semibold text-[#6c7b6d]">{prediction.structured_formatting?.secondary_text ?? prediction.description}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <Field label="Vĩ độ" name="lat" type="number" value={String(pickedLocation.lat)} onChange={(value) => setPickedLocation((current) => ({ ...current, lat: Number.parseFloat(value) }))} step="any" min={-90} max={90} required />
                        <Field label="Kinh độ" name="lng" type="number" value={String(pickedLocation.lng)} onChange={(value) => setPickedLocation((current) => ({ ...current, lng: Number.parseFloat(value) }))} step="any" min={-180} max={180} required />
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="grid gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Địa điểm đã lưu</span>
                        <select className={fieldClass} name="locationId" value={selectedLocationId} required onChange={(event) => setSelectedLocationId(event.target.value)}>
                          <option value="" disabled>
                            Chọn địa điểm
                          </option>
                          {locations.map((location) => (
                            <option value={location.id} key={location.id}>
                              {location.name} {location.district ? `- ${location.district}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      {selectedLocation ? (
                        <div className="rounded-xl border border-[#bbcbbb]/70 bg-[#edf6ed] px-4 py-3 text-sm font-bold text-[#006d37]">
                          <p>{selectedLocation.address}</p>
                          <p className="mt-1 text-xs text-[#3d4a3e]">
                            Tọa độ lấy từ địa điểm: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      ) : (
                        <p className="rounded-xl bg-[#fff7d6] px-4 py-3 text-sm font-bold text-[#6a5200]">Chọn một địa điểm đã lưu để cập nhật vị trí thùng.</p>
                      )}
                    </>
                  )}
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Trạng thái</span>
                    <select className={fieldClass} name="active" defaultValue={String(bin?.active ?? true)}>
                      <option value="true">Hoạt động</option>
                      <option value="false">Ẩn khỏi quét</option>
                    </select>
                  </label>

                  {error ? <p className="rounded-xl bg-[#ffdad6]/45 px-4 py-3 text-sm font-black text-[#ba1a1a]">{error}</p> : null}

                  <div className="flex gap-3 sm:justify-end">
                    <button className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#bbcbbb]/70 bg-white px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e9e8e7] disabled:opacity-55 sm:flex-none" type="button" disabled={loadingAction !== null} onClick={closeDialog}>
                      Hủy
                    </button>
                    <button className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,109,55,0.18)] transition hover:bg-[#005d34] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none" type="submit" disabled={loadingAction !== null}>
                      <LoadingButtonContent loading={loadingAction === "submit"} loadingLabel="Đang lưu...">
                        {dialogMode === "create" ? "Tạo thùng" : "Lưu thay đổi"}
                      </LoadingButtonContent>
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  disabled = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <input className={fieldClass} name={name} type={type} defaultValue={value === undefined ? defaultValue : undefined} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} required={required} min={min} max={max} step={step} disabled={disabled} />
    </label>
  );
}
