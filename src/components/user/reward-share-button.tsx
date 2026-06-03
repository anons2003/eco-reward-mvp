"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type RewardShareButtonProps = {
  title: string;
};

export function RewardShareButton({ title }: RewardShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function shareReward() {
    const url = window.location.href;
    const shareData = {
      title,
      text: `Xem ưu đãi SeaTech: ${title}`,
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
    <button
      className="relative grid size-11 place-items-center rounded-full bg-white text-[#3e4941] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]"
      type="button"
      aria-label="Chia sẻ ưu đãi"
      onClick={shareReward}
    >
      <Share2 size={18} />
      {copied ? <span className="absolute right-0 top-12 whitespace-nowrap rounded-full bg-[#071b12] px-3 py-1.5 text-xs font-black text-white shadow-lg">Đã copy link</span> : null}
    </button>
  );
}
