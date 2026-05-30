"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, QrCode } from "lucide-react";

export function ScanForm() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("ECO-BIN-A1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/scan-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode, lat: 10.7769, lng: 106.7009 }),
    });
    const payload = (await response.json()) as { session?: { id: string }; error?: string };
    setLoading(false);

    if (!response.ok || !payload.session) {
      setError(payload.error ?? "Không tạo được phiên quét.");
      return;
    }

    router.push(`/capture?scanSessionId=${payload.session.id}`);
  }

  return (
    <div className="surface mx-auto max-w-xl rounded-2xl p-6">
      <div className="grid aspect-square place-items-center rounded-2xl bg-[#0f2530] text-white">
        <div className="grid h-48 w-48 place-items-center rounded-3xl border-4 border-dashed border-[#8ccdff]">
          <QrCode size={72} />
        </div>
      </div>
      <label className="mt-6 block text-sm font-bold" htmlFor="qr">
        Mã QR demo
      </label>
      <input className="input mt-2" id="qr" value={qrCode} onChange={(event) => setQrCode(event.target.value)} />
      <p className="mt-2 flex items-center gap-2 text-sm text-[#3f4850]">
        <MapPin size={16} />
        Demo tự gửi vị trí gần thùng A1.
      </p>
      {error ? <p className="mt-4 rounded-lg bg-[#ffdad6] p-3 text-sm font-bold text-[#ba1a1a]">{error}</p> : null}
      <button className="btn-primary mt-6 w-full" disabled={loading} onClick={submit} type="button">
        {loading ? "Đang tạo phiên..." : "Tiếp tục chụp ảnh"}
      </button>
    </div>
  );
}
