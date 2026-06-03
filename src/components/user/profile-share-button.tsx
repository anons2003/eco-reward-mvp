"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type ProfileShareButtonProps = {
  displayName: string;
  points: number;
  co2KgLabel: string;
};

export function ProfileShareButton({ displayName, points, co2KgLabel }: ProfileShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function shareProfile() {
    const url = window.location.href;
    const shareData = {
      title: `Thành tích SeaTech của ${displayName}`,
      text: `${displayName} đang có ${points.toLocaleString("vi-VN")} điểm và ước tính giảm ${co2KgLabel} kg CO2 trên SeaTech.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="relative inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#151d18] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]" type="button" onClick={shareProfile}>
      <Share2 size={16} />
      Chia sẻ thành tích
      {copied ? <span className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#071b12] px-3 py-1.5 text-xs font-black text-white shadow-lg">Đã copy link</span> : null}
    </button>
  );
}
