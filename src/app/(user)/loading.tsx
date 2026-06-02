import { Loader2 } from "lucide-react";

export default function UserLoading() {
  return (
    <div className="flex min-h-[52vh] items-start justify-center pt-6 md:pt-10" aria-label="Đang chuyển trang" aria-busy="true">
      <div className="w-full max-w-sm rounded-[28px] border border-[#bdcabe]/70 bg-white/92 p-5 text-center shadow-[0_22px_60px_rgba(21,29,24,0.12)] backdrop-blur">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#d8f5df] text-[#007a3d]">
          <Loader2 className="animate-spin" size={24} />
        </div>
        <p className="mt-4 text-base font-black tracking-[-0.02em] text-[#071b12]">Đang chuyển trang...</p>
        <p className="mt-1 text-sm font-bold leading-5 text-[#667468]">SeaTech đang tải dữ liệu mới.</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7f0e7]">
          <div className="h-full w-1/3 animate-[loading-progress_1.1s_ease-in-out_infinite] rounded-full bg-[#007a3d]" />
        </div>
      </div>
    </div>
  );
}
