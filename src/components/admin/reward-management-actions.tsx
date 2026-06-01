"use client";

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Edit3, PackagePlus, Trash2 } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";
import type { Database } from "@/infrastructure/supabase/database.types";

type RewardRow = Database["public"]["Tables"]["reward_items"]["Row"];
type DialogMode = "create" | "edit";

type RewardManagementActionsProps = {
  reward?: RewardRow;
};

const compactButtonClass = "grid size-9 shrink-0 place-items-center rounded-lg transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-55";
const fieldClass = "h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20";
const textAreaClass = "min-h-24 w-full resize-none rounded-xl border border-[#bbcbbb] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20";

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

export function RewardManagementActions({ reward }: RewardManagementActionsProps) {
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
    setGlobalLoading("Đang lưu phần thưởng...");

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: stringValue(formData, "title"),
      description: stringValue(formData, "description"),
      pointsRequired: Number.parseInt(stringValue(formData, "pointsRequired"), 10),
      stock: Number.parseInt(stringValue(formData, "stock"), 10),
      active: stringValue(formData, "active") === "true",
      category: stringValue(formData, "category"),
      partner: stringValue(formData, "partner"),
      imageUrl: stringValue(formData, "imageUrl"),
      expiresAt: stringValue(formData, "expiresAt"),
    };

    try {
      const isEdit = dialogMode === "edit" && reward;
      const response = await fetch(isEdit ? `/api/admin/rewards/${reward.id}` : "/api/admin/rewards", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(await readError(response, "Không thể lưu phần thưởng"));
        return;
      }

      setDialogMode(null);
      router.refresh();
    } finally {
      setLoadingAction(null);
      clearGlobalLoading();
    }
  }

  async function deleteReward() {
    if (!reward || !window.confirm("Ẩn phần thưởng này khỏi danh sách người dùng?")) return;

    setError("");
    setLoadingAction("delete");
    setGlobalLoading("Đang ẩn phần thưởng...");

    try {
      const response = await fetch(`/api/admin/rewards/${reward.id}`, { method: "DELETE" });
      if (!response.ok) {
        setError(await readError(response, "Không thể ẩn phần thưởng"));
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
      {reward ? (
        <div className="inline-flex shrink-0 items-center justify-end gap-1.5">
          <button className={`${compactButtonClass} text-[#2d9cdb] hover:bg-[#2d9cdb]/10`} type="button" title="Sửa phần thưởng" aria-label="Sửa phần thưởng" disabled={loadingAction !== null} onClick={() => openDialog("edit")}>
            <Edit3 size={18} />
          </button>
          <button className={`${compactButtonClass} text-[#ba1a1a] hover:bg-[#ffdad6]/55`} type="button" title="Ẩn phần thưởng" aria-label="Ẩn phần thưởng" disabled={loadingAction !== null} onClick={deleteReward}>
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <button className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#2ecc71] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(46,204,113,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button" onClick={() => openDialog("create")}>
          <PackagePlus size={18} />
          Thêm phần thưởng mới
        </button>
      )}
      {reward && error ? <p className="mt-2 max-w-60 text-right text-xs font-black text-[#ba1a1a]">{error}</p> : null}

      {dialogMode
        ? createPortal(
            <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[#1b1c1b]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reward-management-dialog-title" onMouseDown={closeFromBackdrop}>
              <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#bbcbbb]/50 bg-[#fbf9f8] p-5 shadow-[0_24px_80px_rgba(21,29,24,0.24)]">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black tracking-[-0.03em] text-[#1b1c1b]" id="reward-management-dialog-title">
                    {dialogMode === "create" ? "Thêm phần thưởng" : "Sửa phần thưởng"}
                  </h2>
                  <button className="grid size-9 shrink-0 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#e9e8e7]" type="button" aria-label="Đóng" onClick={closeDialog}>
                    ×
                  </button>
                </div>

                <form className="mt-5 grid gap-4" onSubmit={submitForm}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Tên phần thưởng" name="title" defaultValue={reward?.title ?? ""} required />
                    <Field label="Đối tác" name="partner" defaultValue={reward?.partner ?? "SeaTech"} />
                  </div>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Mô tả</span>
                    <textarea className={textAreaClass} name="description" defaultValue={reward?.description ?? ""} required maxLength={500} />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Điểm cần đổi" name="pointsRequired" type="number" defaultValue={String(reward?.points_required ?? 100)} min={1} required />
                    <Field label="Tồn kho" name="stock" type="number" defaultValue={String(reward?.stock ?? 1)} min={0} required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Danh mục</span>
                      <select className={fieldClass} name="category" defaultValue={reward?.category ?? "Voucher"}>
                        <option value="Voucher">Voucher</option>
                        <option value="Quà tặng">Quà tặng</option>
                        <option value="Đóng góp">Đóng góp</option>
                        <option value="Dịch vụ">Dịch vụ</option>
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Trạng thái</span>
                      <select className={fieldClass} name="active" defaultValue={String(reward?.active ?? true)}>
                        <option value="true">Đang mở</option>
                        <option value="false">Ẩn</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Ảnh URL" name="imageUrl" type="url" defaultValue={reward?.image_url ?? ""} />
                    <Field label="Hạn dùng" name="expiresAt" type="date" defaultValue={reward?.expires_at ?? ""} />
                  </div>

                  {error ? <p className="rounded-xl bg-[#ffdad6]/45 px-4 py-3 text-sm font-black text-[#ba1a1a]">{error}</p> : null}

                  <div className="flex gap-3 sm:justify-end">
                    <button className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#bbcbbb]/70 bg-white px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e9e8e7] disabled:opacity-55 sm:flex-none" type="button" disabled={loadingAction !== null} onClick={closeDialog}>
                      Hủy
                    </button>
                    <button className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,109,55,0.18)] transition hover:bg-[#005d34] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none" type="submit" disabled={loadingAction !== null}>
                      <LoadingButtonContent loading={loadingAction === "submit"} loadingLabel="Đang lưu...">
                        {dialogMode === "create" ? "Tạo phần thưởng" : "Lưu thay đổi"}
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

function Field({ label, name, type = "text", defaultValue, required = false, min }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean; min?: number }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <input className={fieldClass} name={name} type={type} defaultValue={defaultValue} required={required} min={min} />
    </label>
  );
}
