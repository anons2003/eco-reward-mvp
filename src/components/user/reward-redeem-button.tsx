"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PackageCheck } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";

type RewardRedeemButtonProps = {
  rewardId: string;
  canRedeem: boolean;
  className?: string;
};

export function RewardRedeemButton({ rewardId, canRedeem, className }: RewardRedeemButtonProps) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function redeem() {
    if (!canRedeem || loading) return;

    setError("");
    setLoading(true);
    setGlobalLoading("Đang đổi phần thưởng...");

    try {
      const response = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
        setError(typeof body?.error === "string" ? body.error : "Không thể đổi phần thưởng lúc này.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
      clearGlobalLoading();
    }
  }

  return (
    <div className="grid gap-3">
      <button
        className={
          className ??
          `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
            canRedeem ? "bg-[#007a3d] text-white hover:bg-[#006a3d]" : "bg-[#e7f0e7] text-[#3e4941]"
          }`
        }
        type="button"
        disabled={!canRedeem || loading}
        onClick={redeem}
      >
        <LoadingButtonContent loading={loading} loadingLabel="Đang đổi...">
          {canRedeem ? "Xác nhận đổi điểm" : "Chưa đủ điểm"}
          {canRedeem ? <ArrowRight size={18} /> : <PackageCheck size={18} />}
        </LoadingButtonContent>
      </button>
      {error ? <p className="rounded-2xl bg-[#ffdad6]/50 px-4 py-3 text-sm font-black text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
