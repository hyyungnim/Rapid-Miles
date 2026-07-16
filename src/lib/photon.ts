export interface PhotonFeature {
  geometry: { coordinates: [number, number]; type: "Point" };
  properties: {
    osm_type: string;
    osm_id: number;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
  };
}

export interface PhotonResult {
  place_id: string;
  display_name: string;
  lat: number;
  lon: number;
}

export const ILORIN = {
  bbox: [4.4, 8.4, 4.75, 8.65] as [number, number, number, number],
  center: { lat: 8.4966, lon: 4.5426 },
};

export function buildDisplayName(p: PhotonFeature["properties"]): string {
  const parts: string[] = [];
  if (p.name) parts.push(p.name);
  if (p.street && p.street !== p.name) {
    const s = p.housenumber ? `${p.housenumber} ${p.street}` : p.street;
    parts.push(s);
  }
  if (p.city && !parts.some(pt => pt.includes(p.city!))) parts.push(p.city);
  if (p.state && !parts.some(pt => pt.includes(p.state!))) parts.push(p.state);
  if (p.country && !parts.some(pt => pt.includes(p.country!))) parts.push(p.country);
  return parts.join(", ");
}

export function toPhotonResult(feature: PhotonFeature): PhotonResult {
  const [lon, lat] = feature.geometry.coordinates;
  const { osm_type, osm_id } = feature.properties;
  return {
    place_id: `photon-${osm_type}-${osm_id}`,
    display_name: buildDisplayName(feature.properties),
    lat,
    lon,
  };
}
