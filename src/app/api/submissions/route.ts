import { NextResponse } from "next/server";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export async function GET() {
  return NextResponse.json({ submissions: ecoRewardService.listSubmissions() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { scanSessionId?: string; imageUrl?: string };

  if (!body.scanSessionId || !body.imageUrl) {
    return NextResponse.json({ error: "scanSessionId và imageUrl là bắt buộc." }, { status: 400 });
  }

  const submission = await ecoRewardService.createSubmission({
    scanSessionId: body.scanSessionId,
    imageUrl: body.imageUrl,
  });

  return NextResponse.json({ submission });
}
