"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";

type FraudAlertActionUser = {
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

export function FraudAlertActions({ submissionId, user }: { submissionId: string; user: FraudAlertActionUser | null }) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isBlocked = user?.status === "blocked";

  async function toggleBlocked() {
    if (!user || loading) return;

    setError("");
    setLoading(true);
    setGlobalLoading(isBlocked ? "Đang mở chặn người dùng..." : "Đang khóa tài khoản...");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: user.bio ?? "",
          fullName: user.full_name,
          location: user.location ?? "",
          phone: user.phone ?? "",
          role: user.role,
          status: isBlocked ? "active" : "blocked",
          trustScore: user.trust_score,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
        setError(typeof body?.error === "string" ? body.error : "Không thể cập nhật trạng thái người dùng.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
      clearGlobalLoading();
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <Link className="rounded-lg px-3 py-1.5 text-xs font-black text-[#006d37] transition hover:bg-[#006d37]/10" href={`/admin/submissions/${submissionId}`}>
          Chi tiết
        </Link>
        {user ? (
          <button className={`inline-flex min-w-36 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${isBlocked ? "bg-[#edf6ed] text-[#006d37]" : "bg-[#ba1a1a] text-white"}`} type="button" onClick={toggleBlocked} disabled={loading}>
            <LoadingButtonContent loading={loading} loadingLabel={isBlocked ? "Đang mở..." : "Đang khóa..."}>
              {isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
              {isBlocked ? "Mở khóa" : "Khóa tài khoản"}
            </LoadingButtonContent>
          </button>
        ) : (
          <Link className="inline-flex min-w-36 items-center justify-center rounded-lg bg-[#efedec] px-3 py-1.5 text-xs font-black text-[#3d4a3e]" href={`/admin/users?q=${encodeURIComponent(submissionId)}`}>
            Tìm người dùng
          </Link>
        )}
      </div>
      {error ? <p className="max-w-56 text-right text-[11px] font-black text-[#ba1a1a]">{error}</p> : null}
    </div>
  );
}
