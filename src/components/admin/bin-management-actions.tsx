"use client";

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Edit3, PackagePlus, Trash2 } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Database["public"]["Tables"]["bins"]["Row"];
type DialogMode = "create" | "edit";

type BinManagementActionsProps = {
  bin?: BinRow;
  variant?: "compact" | "toolbar";
};

const compactButtonClass = "grid size-9 shrink-0 place-items-center rounded-lg transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-55";
const toolbarButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black shadow-[0_12px_24px_rgba(21,29,24,0.08)] transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55";
const fieldClass = "h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: unknown; issues?: Record<string, unknown> } | null;
  const message = typeof body?.error === "string" ? body.error.trim() : "";
  const issueCount = body?.issues && typeof body.issues === "object" ? Object.keys(body.issues).length : 0;
  if (!message) return fallback;
  return issueCount > 0 ? `${fallback}: ${message} (${issueCount} lỗi dữ liệu)` : `${fallback}: ${message}`;
}

export function BinManagementActions({ bin, variant = "compact" }: BinManagementActionsProps) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [loadingAction, setLoadingAction] = useState<"submit" | "delete" | null>(null);
  const [error, setError] = useState("");

  const closeDialog = useCallback(() => {
    if (loadingAction) return;
    setError("");
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

  function openDialog(mode: DialogMode) {
    setError("");
    setDialogMode(mode);
  }

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeDialog();
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoadingAction("submit");
    setGlobalLoading("Đang lưu thùng rác...");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: stringValue(formData, "name"),
      qrCode: stringValue(formData, "qrCode"),
      locationName: stringValue(formData, "locationName"),
      lat: Number.parseFloat(stringValue(formData, "lat")),
      lng: Number.parseFloat(stringValue(formData, "lng")),
      active: stringValue(formData, "active") === "true",
    };

    try {
      const isEdit = dialogMode === "edit" && bin;
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
                    <Field label="Mã QR" name="qrCode" defaultValue={bin?.qr_code ?? ""} required />
                  </div>
                  <Field label="Địa điểm" name="locationName" defaultValue={bin?.location_name ?? ""} required />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Vĩ độ" name="lat" type="number" defaultValue={String(bin?.lat ?? 10.7769)} step="0.000001" min={-90} max={90} required />
                    <Field label="Kinh độ" name="lng" type="number" defaultValue={String(bin?.lng ?? 106.7009)} step="0.000001" min={-180} max={180} required />
                  </div>
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

function Field({ label, name, type = "text", defaultValue, required = false, min, max, step }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean; min?: number; max?: number; step?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <input className={fieldClass} name={name} type={type} defaultValue={defaultValue} required={required} min={min} max={max} step={step} />
    </label>
  );
}
