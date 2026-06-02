export type LocationGroupLocation = {
  id: string;
  name: string;
  address: string;
  district: string | null;
  ward: string | null;
  lat: number;
  lng: number;
};

export type LocationGroupBin = {
  id: string;
  name: string;
  qr_code: string;
  location_id: string | null;
  location_name: string;
  active: boolean;
};

export type LocationGroup = {
  location: LocationGroupLocation;
  bins: LocationGroupBin[];
  activeBinCount: number;
  searchText: string;
};

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildLocationGroups(locations: LocationGroupLocation[], bins: LocationGroupBin[]) {
  return locations.map((location) => {
    const linkedBins = bins.filter((bin) => bin.location_id === location.id);
    const searchText = normalizeSearchText(
      [
        location.name,
        location.address,
        location.district ?? "",
        location.ward ?? "",
        location.lat.toFixed(6),
        location.lng.toFixed(6),
        ...linkedBins.flatMap((bin) => [bin.name, bin.qr_code, bin.location_name, bin.active ? "hoat dong active" : "da an inactive"]),
      ].join(" "),
    );

    return {
      location,
      bins: linkedBins,
      activeBinCount: linkedBins.filter((bin) => bin.active).length,
      searchText,
    };
  });
}

export function filterLocationGroups(groups: LocationGroup[], query: string) {
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) {
    return groups.toSorted((first, second) => second.bins.length - first.bins.length || first.location.name.localeCompare(second.location.name, "vi"));
  }

  return groups
    .filter((group) => tokens.every((token) => group.searchText.includes(token)))
    .toSorted((first, second) => {
      const firstName = normalizeSearchText(first.location.name);
      const secondName = normalizeSearchText(second.location.name);
      const firstAddress = normalizeSearchText(first.location.address);
      const secondAddress = normalizeSearchText(second.location.address);
      const joinedQuery = tokens.join(" ");
      const firstScore = Number(firstName.startsWith(joinedQuery)) * 4 + Number(firstAddress.includes(joinedQuery)) * 3 + first.bins.length;
      const secondScore = Number(secondName.startsWith(joinedQuery)) * 4 + Number(secondAddress.includes(joinedQuery)) * 3 + second.bins.length;

      return secondScore - firstScore || first.location.name.localeCompare(second.location.name, "vi");
    });
}
