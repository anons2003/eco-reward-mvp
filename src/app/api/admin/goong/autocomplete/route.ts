import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { autocompleteQuerySchema } from "../goong-schema";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const parsed = autocompleteQuerySchema.safeParse({
    input: url.searchParams.get("input"),
    location: url.searchParams.get("location") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Goong autocomplete query" }, { status: 400 });
  }

  const apiKey = process.env.GOONG_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GOONG_REST_API_KEY" }, { status: 500 });
  }

  const upstream = new URL("https://rsapi.goong.io/Place/AutoComplete");
  upstream.searchParams.set("input", parsed.data.input);
  upstream.searchParams.set("api_key", apiKey);
  if (parsed.data.location) upstream.searchParams.set("location", parsed.data.location);

  const response = await fetch(upstream, { next: { revalidate: 60 } });
  const payload = (await response.json().catch(() => null)) as { predictions?: unknown[] } | null;

  if (!response.ok) {
    return NextResponse.json({ error: "Goong autocomplete failed" }, { status: response.status });
  }

  return NextResponse.json({ predictions: payload?.predictions ?? [] });
}
