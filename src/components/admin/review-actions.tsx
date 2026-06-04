"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, X } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-ui";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";
import { readReviewActionError } from "@/components/admin/review-actions-error";

export function ReviewActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [reason, setReason] = useState("Đã kiểm tra ảnh và xác nhận hợp lệ.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "approved" | "rejected") {
    setLoading(true);
    setError(null);
    setGlobalLoading("Đang xử lý kiểm duyệt...");
    try {
      const response = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, decision, reason }),
      });
      if (!response.ok) {
        setError(await readReviewActionError(response));
        return;
      }
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ kiểm duyệt. Quyết định chưa được lưu.");
    } finally {
      setLoading(false);
      clearGlobalLoading();
    }
  }

  return (
    <AdminCard className="h-fit p-5 lg:sticky lg:top-24 lg:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#d8f5df] text-[#006d37]">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#1b1c1b]">Quyết định kiểm duyệt</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#6e7a70]">Ghi lý do ngắn, rõ và có thể truy vết trước khi cấp hoặc từ chối điểm.</p>
        </div>
      </div>
      <label className="mt-5 block text-sm font-black text-[#3e4941]" htmlFor="reason">
        Lý do
      </label>
      <textarea
        className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-[#d9e5da] bg-[#fbf9f8] px-4 py-3 text-sm font-semibold leading-6 text-[#1b1c1b] outline-none transition placeholder:text-[#8a938c] focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/20"
        id="reason"
        value={reason}
        onChange={(event) => {
          setReason(event.target.value);
          if (error) setError(null);
        }}
      />
      {error ? (
        <div className="mt-4 rounded-2xl border border-[#ffb4ab] bg-[#fff7f6] px-4 py-3 text-sm font-black leading-6 text-[#8c1d18]" role="alert">
          {error}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#006d37] px-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:bg-[#005d34] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55" disabled={loading || !reason.trim()} onClick={() => submit("approved")} type="button">
          <LoadingButtonContent loading={loading} loadingLabel="Đang xử lý...">
            <Check size={18} />
            Duyệt
          </LoadingButtonContent>
        </button>
        <button className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#ba1a1a]/18 bg-[#ffdad6]/35 px-4 text-sm font-black text-[#ba1a1a] transition hover:bg-[#ffdad6]/55 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55" disabled={loading || !reason.trim()} onClick={() => submit("rejected")} type="button">
          <LoadingButtonContent loading={loading} loadingLabel="Đang xử lý...">
            <X size={18} />
            Từ chối
          </LoadingButtonContent>
        </button>
      </div>
    </AdminCard>
  );
}
