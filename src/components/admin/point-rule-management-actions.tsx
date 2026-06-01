"use client";

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Edit3, Plus, PowerOff } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";
import { WASTE_TYPE_LABELS } from "@/core/points/point-rules";
import type { Database } from "@/infrastructure/supabase/database.types";

type PointRuleRow = Database["public"]["Tables"]["point_rules"]["Row"];
type WasteType = PointRuleRow["waste_type"];
type DialogMode = "create" | "edit";

type PointRuleManagementActionsProps = {
  rule?: PointRuleRow;
  wasteType: WasteType;
};

const compactButtonClass = "grid size-9 shrink-0 place-items-center rounded-lg transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-55";
const fieldClass = "h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20";

function numberValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? Number.parseInt(value.trim(), 10) : Number.NaN;
}

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

export function PointRuleManagementActions({ rule, wasteType }: PointRuleManagementActionsProps) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [loadingAction, setLoadingAction] = useState<"submit" | "delete" | null>(null);
  const [error, setError] = useState("");
  const label = WASTE_TYPE_LABELS[wasteType];

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
    setGlobalLoading("Đang lưu quy tắc điểm...");

    const formData = new FormData(event.currentTarget);
    const payload = {
      wasteType,
      points: numberValue(formData, "points"),
      active: stringValue(formData, "active") === "true",
    };

    try {
      const isEdit = dialogMode === "edit" && rule;
      const response = await fetch(isEdit ? `/api/admin/point-rules/${wasteType}` : "/api/admin/point-rules", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(await readError(response, "Không thể lưu quy tắc điểm"));
        return;
      }

      setDialogMode(null);
      router.refresh();
    } finally {
      setLoadingAction(null);
      clearGlobalLoading();
    }
  }

  async function deactivateRule() {
    if (!rule || !window.confirm(`Tắt cộng điểm cho ${label}?`)) return;

    setError("");
    setLoadingAction("delete");
    setGlobalLoading("Đang tắt quy tắc điểm...");

    try {
      const response = await fetch(`/api/admin/point-rules/${wasteType}`, { method: "DELETE" });
      if (!response.ok) {
        setError(await readError(response, "Không thể tắt quy tắc điểm"));
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
      <div className="inline-flex shrink-0 items-center justify-end gap-1.5">
        {rule ? (
          <>
            <button className={`${compactButtonClass} text-[#2d9cdb] hover:bg-[#2d9cdb]/10`} type="button" title={`Sửa ${label}`} aria-label={`Sửa ${label}`} disabled={loadingAction !== null} onClick={() => openDialog("edit")}>
              <Edit3 size={18} />
            </button>
            <button className={`${compactButtonClass} text-[#ba1a1a] hover:bg-[#ffdad6]/55`} type="button" title={`Tắt ${label}`} aria-label={`Tắt ${label}`} disabled={loadingAction !== null || !rule.active} onClick={deactivateRule}>
              <PowerOff size={18} />
            </button>
          </>
        ) : (
          <button className={`${compactButtonClass} text-[#006d37] hover:bg-[#d8f5df]`} type="button" title={`Tạo ${label}`} aria-label={`Tạo ${label}`} disabled={loadingAction !== null} onClick={() => openDialog("create")}>
            <Plus size={18} />
          </button>
        )}
      </div>
      {error ? <p className="mt-2 text-right text-xs font-black text-[#ba1a1a]">{error}</p> : null}

      {dialogMode
        ? createPortal(
            <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[#1b1c1b]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="point-rule-dialog-title" onMouseDown={closeFromBackdrop}>
              <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#bbcbbb]/50 bg-[#fbf9f8] p-5 shadow-[0_24px_80px_rgba(21,29,24,0.24)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#006d37]">{label}</p>
                    <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#1b1c1b]" id="point-rule-dialog-title">
                      {dialogMode === "create" ? "Tạo quy tắc điểm" : "Sửa quy tắc điểm"}
                    </h2>
                  </div>
                  <button className="grid size-9 shrink-0 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#e9e8e7]" type="button" aria-label="Đóng" onClick={closeDialog}>
                    ×
                  </button>
                </div>

                <form className="mt-5 grid gap-4" onSubmit={submitForm}>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Điểm cộng</span>
                    <input className={fieldClass} name="points" type="number" defaultValue={String(rule?.points ?? 0)} min={0} max={1000000} required />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Trạng thái</span>
                    <select className={fieldClass} name="active" defaultValue={String(rule?.active ?? true)}>
                      <option value="true">Đang áp dụng</option>
                      <option value="false">Tạm tắt</option>
                    </select>
                  </label>

                  {error ? <p className="rounded-xl bg-[#ffdad6]/45 px-4 py-3 text-sm font-black text-[#ba1a1a]">{error}</p> : null}

                  <div className="flex gap-3 sm:justify-end">
                    <button className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#bbcbbb]/70 bg-white px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e9e8e7] disabled:opacity-55 sm:flex-none" type="button" disabled={loadingAction !== null} onClick={closeDialog}>
                      Hủy
                    </button>
                    <button className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,109,55,0.18)] transition hover:bg-[#005d34] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none" type="submit" disabled={loadingAction !== null}>
                      <LoadingButtonContent loading={loadingAction === "submit"} loadingLabel="Đang lưu...">
                        {dialogMode === "create" ? "Tạo quy tắc" : "Lưu thay đổi"}
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
