"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, ImageUp, Sparkles, Timer, Zap } from "lucide-react";
import { LoadingButtonContent, LoadingSpinner, useGlobalLoading } from "@/components/shared/loading-ui";

export function CaptureFlow({ scanSessionId }: { scanSessionId: string }) {
  const router = useRouter();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState("/demo/plastic-bottle.svg");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCaptured(true);
        setError("Không mở được camera. Demo đang dùng ảnh mẫu.");
      }
    }

    void startCamera();
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) {
      setImageUrl("/demo/plastic-bottle.svg");
      setCaptured(true);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setImageUrl(canvas.toDataURL("image/jpeg", 0.78));
    setCaptured(true);
    setError("");
  }

  async function submit() {
    if (!scanSessionId) {
      setError("Bạn cần quét mã QR trước khi gửi ảnh.");
      return;
    }

    setLoading(true);
    setGlobalLoading("Đang gửi phân tích...");
    setError("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanSessionId, imageUrl }),
      });
      const payload = (await response.json()) as { submission?: { id: string }; error?: string };

      if (!response.ok || !payload.submission) {
        setLoading(false);
        clearGlobalLoading();
        setError(payload.error ?? "Không gửi được ảnh.");
        return;
      }

      setTimeout(() => router.push(`/result/${payload.submission?.id}`), 700);
    } catch {
      setLoading(false);
      clearGlobalLoading();
      setError("Không gửi được ảnh.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[34px] border border-[#d9e5da] bg-white/86 p-8 text-center shadow-[0_22px_70px_rgba(21,29,24,0.08)]">
          <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#d8f5df] text-[#007a3d]">
            <LoadingSpinner className="size-10" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Đang phân tích</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#093719]">AI đang kiểm tra vật phẩm</h2>
          <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-[#5d6a60]">Hệ thống đang nhận diện loại rác, đánh giá độ rõ nét và tính điểm phù hợp.</p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {["Kiểm tra phiên QR", "Nhận diện vật phẩm", "Tính điểm SeaTech"].map((label) => (
              <div className="rounded-[22px] border border-[#d9e5da] bg-[#f3fcf3] p-4" key={label}>
                <CheckCircle2 className="text-[#007a3d]" size={20} />
                <p className="mt-3 text-sm font-black text-[#151d18]">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-[32px] border border-[#d9e5da] bg-white/82 shadow-[0_22px_70px_rgba(21,29,24,0.08)]">
        <div className="bg-[#f3fcf3] bg-[radial-gradient(#bdcabe_1px,transparent_1px)] p-4 [background-size:24px_24px]">
          <div className="overflow-hidden rounded-[28px] bg-[#142219] shadow-[0_22px_70px_rgba(21,29,24,0.16)]">
            {captured ? (
              <div className="relative aspect-[4/3] w-full bg-white">
                <Image alt="Ảnh vật phẩm đã chụp" className="object-contain p-8" fill sizes="(min-width: 1024px) 720px, 100vw" src={imageUrl} unoptimized={imageUrl.startsWith("data:")} />
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full object-cover" />
            )}
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#edf6ed] px-5 font-black text-[#151d18] ring-1 ring-[#d9e5da] transition hover:bg-white" onClick={captureFrame} type="button">
            <Camera size={18} />
            {captured ? "Chụp lại" : "Chụp ảnh"}
          </button>
          <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 font-black text-white shadow-[0_12px_30px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] disabled:cursor-not-allowed disabled:opacity-60" disabled={!captured} onClick={submit} type="button">
            <LoadingButtonContent loading={loading} loadingLabel="Đang gửi...">
              <ImageUp size={18} />
              Gửi phân tích
            </LoadingButtonContent>
          </button>
        </div>
      </section>
      <canvas ref={canvasRef} className="hidden" />

      <aside className="rounded-[32px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_22px_70px_rgba(21,29,24,0.08)]">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
            <Sparkles size={24} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a3d]">Xác minh ảnh</p>
            <h2 className="text-xl font-black text-[#151d18]">Sẵn sàng phân tích</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <div className="rounded-[22px] border border-[#d9e5da] bg-white p-4">
            <div className="flex items-center gap-2 font-black text-[#151d18]">
              <Timer size={18} className="text-[#007a3d]" />
              Phiên QR
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5d6a60]">{scanSessionId ? "Phiên đã được xác nhận. Hãy chụp ảnh rõ vật phẩm cần phân loại." : "Vui lòng quét mã thùng rác trước khi chụp ảnh."}</p>
          </div>
          <div className="rounded-[22px] bg-[#f3fcf3] p-4 text-sm font-bold leading-6 text-[#5d6a60]">
            <Zap className="mb-2 text-[#007a3d]" size={18} />
            Ưu tiên ánh sáng đủ, vật phẩm nằm trọn trong khung và không bị che khuất.
          </div>
        </div>
        {error ? <p className="mt-4 rounded-2xl bg-[#fff7e6] p-3 text-sm font-bold text-[#92400E]">{error}</p> : null}
      </aside>
    </div>
  );
}
