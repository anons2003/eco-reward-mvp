import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { placeDetailQuerySchema } from "../goong-schema";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const parsed = placeDetailQuerySchema.safeParse({
    placeId: url.searchParams.get("placeId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Goong place detail query" }, { status: 400 });
  }

  const apiKey = process.env.GOONG_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GOONG_REST_API_KEY" }, { status: 500 });
  }

  const upstream = new URL("https://rsapi.goong.io/Place/Detail");
  upstream.searchParams.set("place_id", parsed.data.placeId);
  upstream.searchParams.set("api_key", apiKey);

  const response = await fetch(upstream, { next: { revalidate: 60 } });
  const payload = (await response.json().catch(() => null)) as { result?: unknown } | null;

  if (!response.ok) {
    return NextResponse.json({ error: "Goong place detail failed" }, { status: response.status });
  }

  return NextResponse.json({ result: payload?.result ?? null });
}
