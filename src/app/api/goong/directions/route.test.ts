import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();

vi.mock("@/infrastructure/auth/session", () => ({ getCurrentUser }));

const goongPolyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

function request(body: unknown) {
  return new Request("https://eco.test/api/goong/directions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("/api/goong/directions", () => {
  beforeEach(() => {
    vi.resetModules();
    getCurrentUser.mockReset();
    getCurrentUser.mockResolvedValue({ id: "user-1", email: "user@example.com" });
    vi.stubEnv("GOONG_REST_API_KEY", "goong-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("validates coordinates before calling Goong", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const { POST } = await import("./route");

    const response = await POST(request({ origin: { lat: 200, lng: 108 }, destination: { lat: 16, lng: 108 } }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid directions payload");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports missing Goong key", async () => {
    vi.stubEnv("GOONG_REST_API_KEY", "");
    const { POST } = await import("./route");

    const response = await POST(request({ origin: { lat: 16, lng: 108 }, destination: { lat: 16.1, lng: 108.1 } }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Missing GOONG_REST_API_KEY");
  });

  it("normalizes Goong routes for the client map", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        routes: [
          {
            overview_polyline: { points: goongPolyline },
            legs: [
              {
                distance: { text: "2,8 km", value: 2800 },
                duration: { text: "8 phút", value: 480 },
                steps: [
                  {
                    html_instructions: "Rẽ phải vào <b>Võ Văn Kiệt</b>",
                    maneuver: "right",
                    distance: { text: "300 m", value: 300 },
                    duration: { text: "1 phút", value: 60 },
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    const { POST } = await import("./route");

    const response = await POST(
      request({
        origin: { lat: 16.0678, lng: 108.2208 },
        destination: { lat: 16.069, lng: 108.225 },
        vehicle: "car",
      }),
    );
    const payload = await response.json();
    const upstream = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(response.status).toBe(200);
    expect(upstream.pathname).toBe("/v2/direction");
    expect(upstream.searchParams.get("origin")).toBe("16.0678,108.2208");
    expect(upstream.searchParams.get("destination")).toBe("16.069,108.225");
    expect(upstream.searchParams.get("vehicle")).toBe("car");
    expect(payload.routes[0]).toMatchObject({
      distanceText: "2,8 km",
      distanceMeters: 2800,
      durationText: "8 phút",
      durationSeconds: 480,
      steps: [{ instruction: "Rẽ phải vào Võ Văn Kiệt", maneuver: "right" }],
    });
    expect(payload.routes[0].coordinates).toEqual([
      [-120.2, 38.5],
      [-120.95, 40.7],
      [-126.453, 43.252],
    ]);
  });

  it("requires a signed-in user", async () => {
    getCurrentUser.mockResolvedValueOnce(null);
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const { POST } = await import("./route");

    const response = await POST(request({ origin: { lat: 16, lng: 108 }, destination: { lat: 16.1, lng: 108.1 } }));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Authentication required");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
