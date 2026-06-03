import { NextResponse } from "next/server";
import { analyzeImage } from "@/application/ai/analyze-image";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { imageUrl?: unknown } | null;
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl là bắt buộc." }, { status: 400 });
  }

  const result = await analyzeImage(imageUrl);
  return NextResponse.json({ result });
}
