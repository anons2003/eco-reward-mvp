"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp } from "lucide-react";

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
    <div className="surface mx-auto max-w-2xl rounded-2xl p-6">
      <div className="overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full object-cover" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {error ? <p className="mt-4 rounded-lg bg-[#fff4c2] p-3 text-sm font-bold text-[#904d00]">{error}</p> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button className="btn-secondary" onClick={captureFrame} type="button">
          <Camera size={18} />
          Chụp ảnh
        </button>
        <button className="btn-primary" disabled={loading} onClick={submit} type="button">
          <ImageUp size={18} />
          {loading ? "Đang phân tích..." : "Gửi phân tích"}
        </button>
      </div>
    </div>
  );
}
