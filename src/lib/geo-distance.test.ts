import { describe, expect, it } from "vitest";
import { distanceMeters, formatDistance, sortByNearest, type GeoPoint } from "./geo-distance";

const daNangCenter: GeoPoint = { lat: 16.0678, lng: 108.2208 };

describe("geo-distance", () => {
  it("calculates distance in meters between nearby Da Nang coordinates", () => {
    const choHan: GeoPoint = { lat: 16.0681, lng: 108.2247 };

    expect(Math.round(distanceMeters(daNangCenter, choHan))).toBeGreaterThan(350);
    expect(Math.round(distanceMeters(daNangCenter, choHan))).toBeLessThan(500);
  });

  it("formats meters and kilometers for Vietnamese UI", () => {
    expect(formatDistance(120)).toBe("120 m");
    expect(formatDistance(1450)).toBe("1,5 km");
  });

  it("sorts bins nearest first and preserves bin payload", () => {
    const bins = [
      { id: "far", name: "Ben xe", lat: 16.0718, lng: 108.1502 },
      { id: "near", name: "Cho Han", lat: 16.0681, lng: 108.2247 },
    ];

    const sorted = sortByNearest(daNangCenter, bins);

    expect(sorted.map((bin) => bin.id)).toEqual(["near", "far"]);
    expect(sorted[0]?.distanceMeters).toBeGreaterThan(0);
    expect(sorted[0]?.name).toBe("Cho Han");
  });
});
