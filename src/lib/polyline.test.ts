import { describe, expect, it } from "vitest";
import { decodePolyline } from "./polyline";

describe("decodePolyline", () => {
  it("decodes an encoded route into MapLibre coordinates", () => {
    const coordinates = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");

    expect(coordinates).toEqual([
      [-120.2, 38.5],
      [-120.95, 40.7],
      [-126.453, 43.252],
    ]);
  });

  it("returns an empty route for blank input", () => {
    expect(decodePolyline("")).toEqual([]);
  });
});
