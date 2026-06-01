import { NextResponse } from "next/server";
import { seaTechService } from "@/application/services/seatech-service";

export async function GET() {
  return NextResponse.json({ submissions: seaTechService.listSubmissions() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { scanSessionId?: string; imageUrl?: string };

  if (!body.scanSessionId || !body.imageUrl) {
    return NextResponse.json({ error: "scanSessionId và imageUrl là bắt buộc." }, { status: 400 });
  }

  const submission = await seaTechService.createSubmission({
    scanSessionId: body.scanSessionId,
    imageUrl: body.imageUrl,
  });

  return NextResponse.json({ submission });
}
