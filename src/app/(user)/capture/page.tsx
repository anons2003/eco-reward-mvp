import { CaptureFlow } from "@/components/user/capture-flow";
import { PageHeader } from "@/components/shared/eco-ui";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ scanSessionId?: string }> }) {
  const params = await searchParams;
  const scanSessionId = params.scanSessionId ?? "";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Bằng chứng ảnh" title="Chụp ảnh rác" body="Chụp trực tiếp bằng camera để giảm rủi ro dùng ảnh cũ hoặc gửi sai vật phẩm." />
      <CaptureFlow scanSessionId={scanSessionId} />
    </div>
  );
}
