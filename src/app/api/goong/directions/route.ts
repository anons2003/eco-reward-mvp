import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/infrastructure/auth/session";
import { decodePolyline } from "@/lib/polyline";

const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const directionsPayloadSchema = z.object({
  origin: coordinateSchema,
  destination: coordinateSchema,
  vehicle: z.enum(["car", "bike", "taxi", "truck", "hd"]).default("car"),
  alternatives: z.boolean().default(false),
});

type GoongDirectionsResponse = {
  routes?: Array<{
    overview_polyline?: {
      points?: string;
    };
    legs?: Array<{
      distance?: { text?: string; value?: number };
      duration?: { text?: string; value?: number };
      steps?: Array<{
        html_instructions?: string;
        maneuver?: string;
        distance?: { text?: string; value?: number };
        duration?: { text?: string; value?: number };
      }>;
    }>;
  }>;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = directionsPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid directions payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const apiKey = process.env.GOONG_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GOONG_REST_API_KEY" }, { status: 500 });
  }

  const upstream = new URL("https://rsapi.goong.io/v2/direction");
  upstream.searchParams.set("origin", formatCoordinate(parsed.data.origin));
  upstream.searchParams.set("destination", formatCoordinate(parsed.data.destination));
  upstream.searchParams.set("vehicle", parsed.data.vehicle);
  upstream.searchParams.set("alternatives", String(parsed.data.alternatives));
  upstream.searchParams.set("api_key", apiKey);

  const response = await fetch(upstream, { cache: "no-store" });
  const data = (await response.json().catch(() => null)) as GoongDirectionsResponse | null;

  if (!response.ok) {
    return NextResponse.json({ error: "Goong directions failed" }, { status: response.status });
  }

  const routes = (data?.routes ?? [])
    .map((route) => {
      const overview = route.overview_polyline?.points;
      const leg = route.legs?.[0];
      const coordinates = overview ? decodePolyline(overview) : [];

      return {
        coordinates,
        distanceText: leg?.distance?.text ?? "",
        distanceMeters: leg?.distance?.value ?? 0,
        durationText: leg?.duration?.text ?? "",
        durationSeconds: leg?.duration?.value ?? 0,
        steps: (leg?.steps ?? []).map((step) => ({
          instruction: stripHtml(step.html_instructions ?? ""),
          maneuver: step.maneuver ?? "",
          distanceText: step.distance?.text ?? "",
          distanceMeters: step.distance?.value ?? 0,
          durationText: step.duration?.text ?? "",
          durationSeconds: step.duration?.value ?? 0,
        })),
      };
    })
    .filter((route) => route.coordinates.length > 1);

  if (routes.length === 0) {
    return NextResponse.json({ error: "Goong không trả về tuyến đường phù hợp." }, { status: 404 });
  }

  return NextResponse.json({ routes });
}

function formatCoordinate(coordinate: { lat: number; lng: number }) {
  return `${coordinate.lat},${coordinate.lng}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
