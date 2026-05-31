"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp, Sparkles, Timer } from "lucide-react";

export function CaptureFlow({ scanSessionId }: { scanSessionId: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState("/demo/plastic-bottle.svg");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError("Không mở được camera. Demo sẽ dùng ảnh mẫu.");
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
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setImageUrl(canvas.toDataURL("image/jpeg", 0.78));
  }

  async function submit() {
    setLoading(true);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scanSessionId, imageUrl }),
    });
    const payload = (await response.json()) as { submission?: { id: string }; error?: string };
    setLoading(false);

    if (!response.ok || !payload.submission) {
      setError(payload.error ?? "Không gửi được ảnh.");
      return;
    }

    router.push(`/result/${payload.submission.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="eco-card overflow-hidden rounded-[32px]">
        <div className="bg-[#fbfbff] bg-[radial-gradient(#e6e7ef_1px,transparent_1px)] p-4 [background-size:24px_24px]">
          <div className="overflow-hidden rounded-[28px] bg-[#151515] shadow-[0_22px_70px_rgba(21,21,21,0.16)]">
            <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <button className="btn-secondary" onClick={captureFrame} type="button">
            <Camera size={18} />
            Chụp ảnh
          </button>
          <button className="btn-primary" disabled={loading} onClick={submit} type="button">
            <ImageUp size={18} />
            {loading ? "Đang phân tích..." : "Gửi phân tích"}
          </button>
        </div>
      </section>
      <canvas ref={canvasRef} className="hidden" />

      <aside className="eco-card rounded-[32px] p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl border border-[#e6e7ef] bg-white text-[#151515]">
            <Sparkles size={24} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#151515]">Xác minh ảnh</p>
            <h2 className="text-xl font-black text-[#151515]">Sẵn sàng phân tích</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl border border-[#e6e7ef] bg-white p-4">
            <div className="flex items-center gap-2 font-black text-[#151515]">
              <Timer size={18} className="text-[#00687a]" />
              Phiên QR
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5f6472]">{scanSessionId ? "Phiên đã được xác nhận. Hãy chụp ảnh rõ vật phẩm cần phân loại." : "Vui lòng quét mã thùng rác trước khi chụp ảnh."}</p>
          </div>
          <div className="rounded-2xl bg-[#f4f5fb] p-4 text-sm font-bold leading-6 text-[#5f6472]">Ảnh sẽ được kiểm tra để nhận diện loại rác, đánh giá độ rõ nét và tính điểm phù hợp.</div>
        </div>
        {error ? <p className="mt-4 rounded-xl bg-[#fff7e6] p-3 text-sm font-bold text-[#92400E]">{error}</p> : null}
      </aside>
    </div>
  );
}
