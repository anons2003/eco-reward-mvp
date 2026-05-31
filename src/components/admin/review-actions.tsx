"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function ReviewActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("Đã kiểm tra ảnh và xác nhận hợp lệ.");
  const [loading, setLoading] = useState(false);

  async function submit(decision: "approved" | "rejected") {
    setLoading(true);
    await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, decision, reason }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="eco-card rounded-[28px] p-6">
      <h2 className="text-xl font-black text-[#071b12]">Quyết định kiểm duyệt</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#5d6a60]">Ghi lý do ngắn, rõ và có thể truy vết trước khi cấp hoặc từ chối điểm.</p>
      <label className="mt-4 block text-sm font-bold text-[#5d6a60]" htmlFor="reason">
        Lý do
      </label>
      <textarea className="input mt-2 min-h-24" id="reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button className="btn-primary" disabled={loading || !reason.trim()} onClick={() => submit("approved")} type="button">
          <Check size={18} />
          Duyệt
        </button>
        <button className="btn-secondary border-[#ffd7d7] bg-[#fff7f7] text-[#B91C1C]" disabled={loading || !reason.trim()} onClick={() => submit("rejected")} type="button">
          <X size={18} />
          Từ chối
        </button>
      </div>
    </div>
  );
}
