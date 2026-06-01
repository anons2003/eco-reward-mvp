"use client";

import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Ban, Edit3, Trash2, UserPlus, Unlock } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";

type UserManagementUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: "user" | "admin";
  status: "active" | "blocked" | "deleted";
  trust_score: number;
};

type UserManagementActionsProps = {
  user?: UserManagementUser;
};

type DialogMode = "create" | "edit";

const compactButtonClass = "grid size-9 shrink-0 place-items-center rounded-lg transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-55";
const fieldClass = "h-11 w-full rounded-xl border border-[#bbcbbb] bg-white px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20";
const textAreaClass = "min-h-24 w-full resize-none rounded-xl border border-[#bbcbbb] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#2d9cdb]/20";

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: unknown; issues?: Record<string, unknown> } | null;
  const serverError = typeof body?.error === "string" ? body.error.trim() : "";
  const issueCount = body?.issues && typeof body.issues === "object" ? Object.keys(body.issues).length : 0;

  if (!serverError) return fallback;
  return issueCount > 0 ? `${fallback}: ${serverError} (${issueCount} lỗi dữ liệu)` : `${fallback}: ${serverError}`;
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function UserManagementActions({ user }: UserManagementActionsProps) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState<"submit" | "toggle" | "delete" | null>(null);

  const isBlocked = user?.status === "blocked";

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
    setGlobalLoading("Đang lưu người dùng...");

    const formData = new FormData(event.currentTarget);
    const isEdit = dialogMode === "edit" && user;
    const trustScore = Number.parseInt(stringValue(formData, "trustScore"), 10);

    const payload = isEdit
      ? {
          fullName: stringValue(formData, "fullName"),
          role: stringValue(formData, "role"),
          phone: stringValue(formData, "phone"),
          location: stringValue(formData, "location"),
          bio: stringValue(formData, "bio"),
          trustScore: Number.isFinite(trustScore) ? trustScore : user.trust_score,
          status: stringValue(formData, "status"),
        }
      : {
          email: stringValue(formData, "email"),
          fullName: stringValue(formData, "fullName"),
          password: stringValue(formData, "password"),
          role: stringValue(formData, "role"),
          phone: stringValue(formData, "phone"),
          location: stringValue(formData, "location"),
          bio: stringValue(formData, "bio"),
        };

    try {
      const response = await fetch(isEdit ? `/api/admin/users/${user.id}` : "/api/admin/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(await readError(response, "Không thể lưu người dùng"));
        return;
      }

      setDialogMode(null);
      router.refresh();
    } finally {
      setLoadingAction(null);
      clearGlobalLoading();
    }
  }

  async function toggleBlocked() {
    if (!user) return;

    setError("");
    setLoadingAction("toggle");
    setGlobalLoading(isBlocked ? "Đang mở chặn người dùng..." : "Đang chặn người dùng...");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user.full_name,
          role: user.role,
          phone: user.phone ?? "",
          location: user.location ?? "",
          bio: user.bio ?? "",
          trustScore: user.trust_score,
          status: isBlocked ? "active" : "blocked",
        }),
      });

      if (!response.ok) {
        setError(await readError(response, isBlocked ? "Không thể mở chặn" : "Không thể chặn"));
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
      clearGlobalLoading();
    }
  }

  async function softDelete() {
    if (!user || !window.confirm("Xóa người dùng này?")) return;

    setError("");
    setLoadingAction("delete");
    setGlobalLoading("Đang xóa người dùng...");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });

      if (!response.ok) {
        setError(await readError(response, "Không thể xóa người dùng"));
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
      {user ? (
        <div className="inline-flex shrink-0 items-center justify-end gap-1.5">
          <button className={`${compactButtonClass} text-[#2d9cdb] hover:bg-[#2d9cdb]/10`} type="button" title="Sửa người dùng" aria-label="Sửa người dùng" disabled={loadingAction !== null} onClick={() => openDialog("edit")}>
            <Edit3 size={18} />
          </button>
          <button className={`${compactButtonClass} ${isBlocked ? "text-[#2ecc71] hover:bg-[#2ecc71]/10" : "text-[#e74c3c] hover:bg-[#e74c3c]/10"}`} type="button" title={isBlocked ? "Mở chặn" : "Chặn người dùng"} aria-label={isBlocked ? "Mở chặn" : "Chặn người dùng"} disabled={loadingAction !== null} onClick={toggleBlocked}>
            {isBlocked ? <Unlock size={18} /> : <Ban size={18} />}
          </button>
          <button className={`${compactButtonClass} text-[#ba1a1a] hover:bg-[#ffdad6]/55`} type="button" title="Xóa người dùng" aria-label="Xóa người dùng" disabled={loadingAction !== null} onClick={softDelete}>
            <Trash2 size={18} />
          </button>
        </div>
      ) : (
        <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2d9cdb] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(45,156,219,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button" onClick={() => openDialog("create")}>
          <UserPlus size={17} />
          Thêm người dùng
        </button>
      )}
      {user && error ? <p className="mt-2 max-w-56 text-right text-xs font-black text-[#ba1a1a]">{error}</p> : null}

      {dialogMode
        ? createPortal(
            <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[#1b1c1b]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="user-management-dialog-title" onMouseDown={closeFromBackdrop}>
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#bbcbbb]/50 bg-[#fbf9f8] p-5 shadow-[0_24px_80px_rgba(21,29,24,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-black tracking-[-0.03em] text-[#1b1c1b]" id="user-management-dialog-title">
                {dialogMode === "create" ? "Thêm người dùng" : "Sửa người dùng"}
              </h2>
              <button className="grid size-9 shrink-0 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#e9e8e7]" type="button" aria-label="Đóng" onClick={closeDialog}>
                ×
              </button>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={submitForm}>
              {dialogMode === "create" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Mật khẩu" name="password" type="password" required minLength={8} />
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Họ tên" name="fullName" defaultValue={user?.full_name ?? ""} required />
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Vai trò</span>
                  <select className={fieldClass} name="role" defaultValue={user?.role ?? "user"}>
                    <option value="user">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Điện thoại" name="phone" defaultValue={user?.phone ?? ""} />
                <Field label="Khu vực" name="location" defaultValue={user?.location ?? ""} />
              </div>

              {dialogMode === "edit" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Độ uy tín" name="trustScore" type="number" defaultValue={String(user?.trust_score ?? 0)} min={0} max={100} required />
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Trạng thái</span>
                    <select className={fieldClass} name="status" defaultValue={user?.status ?? "active"}>
                      <option value="active">Hoạt động</option>
                      <option value="blocked">Đã chặn</option>
                    </select>
                  </label>
                </div>
              ) : null}

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">Tiểu sử</span>
                <textarea className={textAreaClass} name="bio" defaultValue={user?.bio ?? ""} maxLength={220} />
              </label>

              {error ? <p className="rounded-xl bg-[#ffdad6]/45 px-4 py-3 text-sm font-black text-[#ba1a1a]">{error}</p> : null}

              <div className="flex gap-3 sm:justify-end">
                <button className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#bbcbbb]/70 bg-white px-5 text-sm font-black text-[#3d4a3e] transition hover:bg-[#e9e8e7] disabled:opacity-55 sm:flex-none" type="button" disabled={loadingAction !== null} onClick={closeDialog}>
                  Hủy
                </button>
                <button className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,109,55,0.18)] transition hover:bg-[#005d34] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none" type="submit" disabled={loadingAction !== null}>
                  <LoadingButtonContent loading={loadingAction === "submit"} loadingLabel="Đang lưu...">
                    {dialogMode === "create" ? "Tạo người dùng" : "Lưu thay đổi"}
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
  required = false,
  min,
  max,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">{label}</span>
      <input className={fieldClass} name={name} type={type} defaultValue={defaultValue} required={required} min={min} max={max} minLength={minLength} />
    </label>
  );
}
