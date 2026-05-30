import { NextResponse } from "next/server";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export async function POST(request: Request) {
  const body = (await request.json()) as { qrCode?: string; lat?: number; lng?: number };
  const result = ecoRewardService.createScanSession({
    qrCode: body.qrCode ?? "",
    lat: body.lat,
    lng: body.lng,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
