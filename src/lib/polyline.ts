export type RouteCoordinate = [number, number];

export function decodePolyline(value: string): RouteCoordinate[] {
  const coordinates: RouteCoordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < value.length) {
    const latResult = decodeValue(value, index);
    index = latResult.nextIndex;
    lat += latResult.delta;

    const lngResult = decodeValue(value, index);
    index = lngResult.nextIndex;
    lng += lngResult.delta;

    coordinates.push([roundCoordinate(lng / 1e5), roundCoordinate(lat / 1e5)]);
  }

  return coordinates;
}

function decodeValue(value: string, startIndex: number) {
  let result = 0;
  let shift = 0;
  let index = startIndex;
  let byte = 0;

  do {
    if (index >= value.length) throw new Error("Invalid encoded polyline");
    byte = value.charCodeAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20);

  const delta = result & 1 ? ~(result >> 1) : result >> 1;
  return { delta, nextIndex: index };
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}
