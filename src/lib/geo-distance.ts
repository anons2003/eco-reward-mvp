export type GeoPoint = {
  lat: number;
  lng: number;
};

export type WithCoordinate = GeoPoint & {
  id: string;
};

export type WithDistance<T> = T & {
  distanceMeters: number;
};

const earthRadiusMeters = 6_371_000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(first: GeoPoint, second: GeoPoint) {
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);

  const haversine = Math.sin(latDelta / 2) ** 2 + Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export function formatDistance(valueMeters: number) {
  if (valueMeters < 1000) return `${Math.round(valueMeters).toLocaleString("vi-VN")} m`;
  return `${(valueMeters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`;
}

export function sortByNearest<T extends WithCoordinate>(origin: GeoPoint, items: T[]): WithDistance<T>[] {
  return items
    .map((item) => ({
      ...item,
      distanceMeters: distanceMeters(origin, item),
    }))
    .toSorted((first, second) => first.distanceMeters - second.distanceMeters);
}
