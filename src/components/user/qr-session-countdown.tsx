"use client";

import { useEffect, useMemo, useState } from "react";

const defaultTotalSeconds = 120;

function secondsUntil(expiresAt?: string) {
  if (!expiresAt) return 0;
  const timestamp = Date.parse(expiresAt);
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function useQrSessionCountdown(expiresAt?: string, totalSeconds = defaultTotalSeconds) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => secondsUntil(expiresAt));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds(secondsUntil(expiresAt));
    }, 0);

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(secondsUntil(expiresAt));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [expiresAt]);

  return useMemo(() => {
    const expired = Boolean(expiresAt) && remainingSeconds <= 0;
    const progress = expiresAt ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) : 0;

    return {
      expired,
      label: expiresAt ? formatRemaining(remainingSeconds) : "--:--",
      progress,
      remainingSeconds,
    };
  }, [expiresAt, remainingSeconds, totalSeconds]);
}

export function QrSessionCountdown({ expiresAt, compact = false }: { expiresAt?: string; compact?: boolean }) {
  const countdown = useQrSessionCountdown(expiresAt);
  const urgent = countdown.remainingSeconds <= 30;

  return (
    <div className={`rounded-[22px] border p-4 ${countdown.expired ? "border-[#ffd6d1] bg-[#fff1ef]" : urgent ? "border-[#f4d58d] bg-[#fff9e8]" : "border-[#8ff8b6] bg-[#f3fcf3]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.14em] ${countdown.expired ? "text-[#ba1a1a]" : urgent ? "text-[#925700]" : "text-[#007a3d]"}`}>Thời gian phiên QR</p>
          {!compact ? <p className="mt-1 text-xs font-bold leading-5 text-[#667468]">Hết giờ thì cần quét lại QR để tạo phiên mới.</p> : null}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-black tabular-nums ${countdown.expired ? "bg-[#ffd6d1] text-[#ba1a1a]" : urgent ? "bg-[#ffe8a3] text-[#5d3900]" : "bg-[#d8f5df] text-[#007a3d]"}`}>
          {countdown.expired ? "Hết hạn" : countdown.label}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className={`h-full rounded-full transition-all duration-500 ${countdown.expired ? "bg-[#ba1a1a]" : urgent ? "bg-[#d19300]" : "bg-[#007a3d]"}`} style={{ width: `${countdown.progress}%` }} />
      </div>
    </div>
  );
}
