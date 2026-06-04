"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";

type RewardRedemptionActionsProps = {
  redemptionId: string;
  status: string;
};

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : "Không thể cập nhật trạng thái nhận quà.";
}

export function RewardRedemptionActions({ redemptionId, status }: RewardRedemptionActionsProps) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [loadingStatus, setLoadingStatus] = useState<"used" | "cancelled" | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: "used" | "cancelled") {
    if (loadingStatus || status !== "issued") return;

    setError("");
    setLoadingStatus(nextStatus);
    setGlobalLoading("Đang cập nhật nhận quà...");

    try {
      const response = await fetch(`/api/admin/reward-redemptions/${redemptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        setError(await readError(response));
        return;
      }

      router.refresh();
    } finally {
      setLoadingStatus(null);
      clearGlobalLoading();
    }
  }

  if (status !== "issued") {
    return <span className="text-xs font-bold text-[#6c7b6d]">Đã xử lý</span>;
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#d8f5df] px-3 text-xs font-black text-[#006d37] transition hover:bg-[#b8edc7] disabled:cursor-not-allowed disabled:opacity-55" type="button" disabled={loadingStatus !== null} onClick={() => updateStatus("used")}>
          <LoadingButtonContent loading={loadingStatus === "used"} loadingLabel="Lưu...">
            <CheckCircle2 size={15} />
            Đã dùng
          </LoadingButtonContent>
        </button>
        <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#ffdad6]/45 px-3 text-xs font-black text-[#ba1a1a] transition hover:bg-[#ffdad6] disabled:cursor-not-allowed disabled:opacity-55" type="button" disabled={loadingStatus !== null} onClick={() => updateStatus("cancelled")}>
          <LoadingButtonContent loading={loadingStatus === "cancelled"} loadingLabel="Lưu...">
            <XCircle size={15} />
            Hủy
          </LoadingButtonContent>
        </button>
      </div>
      {error ? <p className="max-w-48 text-xs font-black leading-5 text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
