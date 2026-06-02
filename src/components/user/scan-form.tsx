"use client";

import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, CameraOff, CheckCircle2, Clock3, MapPin, QrCode, ScanLine, ShieldCheck, Wifi, type LucideIcon } from "lucide-react";
import { LoadingButtonContent, useGlobalLoading } from "@/components/shared/loading-ui";
import { QrSessionCountdown, useQrSessionCountdown } from "@/components/user/qr-session-countdown";

type ScanPayload = {
  session?: { id: string; expiresAt: string };
  bin?: { name: string; locationName: string; qrCode: string };
  error?: string;
};

type GeoPoint = {
  lat: number;
  lng: number;
};

type CameraState = "idle" | "starting" | "ready" | "unsupported" | "blocked" | "error";

function normalizeQrInput(value: string) {
  return value.trim();
}

function getQrFromUrl(value: string) {
  try {
    const url = new URL(value);
    return normalizeQrInput(url.searchParams.get("qr") ?? url.pathname.split("/").filter(Boolean).at(-1) ?? value);
  } catch {
    return normalizeQrInput(value);
  }
}

function getPosition() {
  return new Promise<GeoPoint | null>((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 6000 },
    );
  });
}

export function ScanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearGlobalLoading, setGlobalLoading } = useGlobalLoading();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const autoScanningRef = useRef(false);
  const autoQrStartedRef = useRef(false);
  const initialQrCode = searchParams.get("qr") ?? "ECO-BIN-A1";
  const [qrCode, setQrCode] = useState(initialQrCode);
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraMessage, setCameraMessage] = useState("Bấm mở camera để quét QR trên điện thoại.");
  const countdown = useQrSessionCountdown(payload?.session?.expiresAt);

  const createScanSession = useCallback(async (nextQrCode: string, autoContinue = false) => {
    const trimmedQrCode = getQrFromUrl(nextQrCode);
    if (!trimmedQrCode) {
      setError("Vui lòng nhập hoặc quét mã QR.");
      return;
    }

    setLoading(true);
    setGlobalLoading("Đang xác nhận thùng...");
    setError("");
    try {
      const position = await getPosition();
      const response = await fetch("/api/scan-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: trimmedQrCode, lat: position?.lat, lng: position?.lng }),
      });
      const nextPayload = (await response.json()) as ScanPayload;

      if (!response.ok || !nextPayload.session || !nextPayload.bin) {
        setPayload(null);
        setError(nextPayload.error ?? "Không tạo được phiên quét.");
        return;
      }

      setPayload(nextPayload);
      setQrCode(trimmedQrCode);
      if (autoContinue && nextPayload.session) {
        setGlobalLoading("Đang mở camera...");
        router.push(`/capture?scanSessionId=${nextPayload.session.id}`);
      }
    } finally {
      setLoading(false);
      clearGlobalLoading();
    }
  }, [clearGlobalLoading, router, setGlobalLoading]);

  const stopCamera = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    autoScanningRef.current = false;
    setCameraReady(false);
    setCameraState("idle");
    setCameraMessage("Camera đã tắt. Bấm mở lại khi cần quét QR.");
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setCameraMessage("Trình duyệt này không hỗ trợ camera web. Hãy nhập mã QR thủ công.");
      return;
    }
    if (!window.isSecureContext) {
      setCameraState("blocked");
      setCameraMessage("Camera trên điện thoại cần HTTPS. Hãy dùng domain production hoặc localhost, không dùng địa chỉ http trong mạng LAN.");
      return;
    }

    setCameraState("starting");
    setCameraMessage("Đang xin quyền camera...");
    setError("");
    autoScanningRef.current = false;

    try {
      scannerControlsRef.current?.stop();
      const reader = new BrowserQRCodeReader();
      scannerControlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        const detected = result?.getText();
        if (!detected || autoScanningRef.current) return;

        const detectedQr = getQrFromUrl(detected);
        autoScanningRef.current = true;
        setQrCode(detectedQr);
        setCameraMessage("Đã đọc QR. Đang xác nhận thùng...");
        void createScanSession(detectedQr, true);
      });
      setCameraReady(true);
      setCameraState("ready");
      setCameraMessage("Camera đang mở. Đưa QR vào giữa khung để hệ thống tự đọc.");
    } catch (nextError) {
      setCameraReady(false);
      const name = nextError instanceof DOMException ? nextError.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraState("blocked");
        setCameraMessage("Bạn chưa cấp quyền camera. Hãy bật quyền camera trong trình duyệt rồi thử lại.");
      } else {
        setCameraState("error");
        setCameraMessage("Không mở được camera. Bạn vẫn có thể nhập mã QR thủ công.");
      }
    }
  }, [createScanSession]);

  useEffect(() => {
    const qrFromUrl = searchParams.get("qr");
    if (!qrFromUrl || autoQrStartedRef.current) return;
    autoQrStartedRef.current = true;
    const normalizedQr = getQrFromUrl(qrFromUrl);
    const timeoutId = window.setTimeout(() => {
      setQrCode(normalizedQr);
      void createScanSession(normalizedQr);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [createScanSession, searchParams]);

  useEffect(
    () => () => {
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
    },
    [],
  );

  function verifyBin() {
    void createScanSession(qrCode);
  }

  function continueToCapture() {
    if (!payload?.session) return;
    setGlobalLoading("Đang mở camera...");
    router.push(`/capture?scanSessionId=${payload.session.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="order-2 overflow-hidden rounded-[32px] border border-[#d9e5da] bg-white/82 shadow-[0_22px_70px_rgba(21,29,24,0.08)] lg:order-1">
        <div className="grid min-h-[360px] place-items-center bg-[#f3fcf3] bg-[radial-gradient(#bdcabe_1px,transparent_1px)] p-5 text-[#151d18] [background-size:24px_24px] lg:min-h-[560px] lg:p-6">
          <div className="w-full max-w-[280px] sm:max-w-sm">
            <div className="relative aspect-square rounded-[34px] border-2 border-[#007a3d] bg-white p-5 shadow-[0_22px_70px_rgba(0,106,61,0.12)]">
              <div className="relative grid h-full place-items-center overflow-hidden rounded-[26px] border border-dashed border-[#bdcabe] bg-[#edf6ed]">
                <video ref={videoRef} autoPlay muted playsInline className={`absolute inset-0 size-full object-cover transition ${cameraReady ? "opacity-100" : "opacity-0"}`} />
                {!cameraReady ? (
                  <button className="grid size-full place-items-center text-center transition hover:bg-white/40" type="button" onClick={startCamera} aria-label="Mở camera quét QR">
                    <span className="grid gap-4">
                      <QrCode className="mx-auto text-[#007a3d]" size={96} />
                      <span className="mx-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(0,106,61,0.24)]" style={{ color: "#ffffff" }}>
                        <Camera size={17} />
                        Mở camera
                      </span>
                    </span>
                  </button>
                ) : null}
              </div>
              <span className="absolute left-5 top-5 size-11 rounded-tl-3xl border-l-4 border-t-4 border-[#007a3d]" />
              <span className="absolute right-5 top-5 size-11 rounded-tr-3xl border-r-4 border-t-4 border-[#007a3d]" />
              <span className="absolute bottom-5 left-5 size-11 rounded-bl-3xl border-b-4 border-l-4 border-[#007a3d]" />
              <span className="absolute bottom-5 right-5 size-11 rounded-br-3xl border-b-4 border-r-4 border-[#007a3d]" />
              <div className="absolute left-8 right-8 top-1/2 h-1 rounded-full bg-[#8ff8b6] shadow-[0_0_28px_rgba(0,122,61,0.55)]" />
            </div>
            <p className="mt-5 text-center text-sm font-bold leading-6 text-[#3e4941]">{cameraMessage}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-4 text-sm font-black text-white transition hover:bg-[#006a35] disabled:cursor-wait disabled:opacity-70" type="button" onClick={startCamera} disabled={cameraState === "starting"} style={{ color: "#ffffff" }}>
                <Camera size={16} />
                {cameraState === "starting" ? "Đang mở..." : "Mở camera"}
              </button>
              <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9e5da] bg-white px-4 text-sm font-black text-[#151d18] transition hover:border-[#007a3d] disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={stopCamera} disabled={!cameraReady}>
                <CameraOff size={16} />
                Tắt camera
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="order-1 rounded-[32px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_22px_70px_rgba(21,29,24,0.08)] lg:order-2">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
            <ScanLine size={24} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a3d]">Mã thùng rác</p>
            <h2 className="text-xl font-black text-[#151d18]">Xác nhận thùng</h2>
          </div>
        </div>

        <label className="mt-6 block text-sm font-bold text-[#5d6a60]" htmlFor="qr">
          Mã QR
        </label>
        <input className="mt-2 min-h-14 w-full rounded-2xl border border-[#d9e5da] bg-white px-4 font-black text-[#151d18] outline-none focus:ring-2 focus:ring-[#007a3d]/20" id="qr" value={qrCode} onChange={(event) => setQrCode(event.target.value)} />

        <div className="mt-4 grid gap-3">
          <InfoRow icon={MapPin} title="Vị trí hiện tại" body="Nếu trình duyệt cho phép, vị trí thật sẽ được lưu cùng phiên QR." />
          <InfoRow icon={Wifi} title="Camera điện thoại" body="Dùng HTTPS trên điện thoại để trình duyệt cho phép mở camera." />
        </div>

        {payload?.bin ? (
          <div className="mt-5 rounded-[24px] border border-[#8ff8b6] bg-[#f3fcf3] p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-[#007a3d]" />
              <div>
                <p className="font-black text-[#151d18]">{payload.bin.name}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-[#5d6a60]">{payload.bin.locationName}</p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[#007a3d]">
                  <Clock3 size={14} />
                  Phiên QR đã sẵn sàng
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {payload?.session ? (
          <div className="mt-4">
            <QrSessionCountdown expiresAt={payload.session.expiresAt} compact />
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-2xl bg-[#fff0f0] p-3 text-sm font-bold text-[#B91C1C]">{error}</p> : null}

        <div className="mt-6 grid gap-3">
          <button className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 font-black text-white shadow-[0_12px_30px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={verifyBin} type="button">
            <LoadingButtonContent loading={loading} loadingLabel="Đang xác nhận...">
              <ShieldCheck size={18} />
              {payload ? "Xác nhận lại" : "Xác nhận thùng"}
            </LoadingButtonContent>
          </button>
          <button className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#edf6ed] px-5 font-black text-[#151d18] ring-1 ring-[#d9e5da] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!payload?.session || countdown.expired} onClick={continueToCapture} type="button">
            {countdown.expired ? "Quét lại để tạo phiên mới" : "Tiếp tục chụp ảnh"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-[#d9e5da] bg-white p-4">
      <Icon className="mt-0.5 text-[#007a3d]" size={18} />
      <div>
        <p className="font-black text-[#151d18]">{title}</p>
        <p className="mt-1 text-sm leading-5 text-[#5d6a60]">{body}</p>
      </div>
    </div>
  );
}
