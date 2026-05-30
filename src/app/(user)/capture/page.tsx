import { CaptureFlow } from "@/components/user/capture-flow";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ scanSessionId?: string }> }) {
  const params = await searchParams;
  const scanSessionId = params.scanSessionId ?? "";

  return (
    <div>
      <h1 className="mb-2 text-3xl font-black">Chụp ảnh rác</h1>
      <p className="mb-6 text-[#3f4850]">Chụp trực tiếp bằng camera để giảm rủi ro dùng ảnh cũ.</p>
      <CaptureFlow scanSessionId={scanSessionId} />
    </div>
  );
}
