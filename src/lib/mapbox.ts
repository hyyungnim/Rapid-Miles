const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const ILORIN_PROXIMITY = "4.5426,8.4966";

export interface MapboxSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

export async function geocodeSearch(query: string): Promise<MapboxSuggestion[]> {
  if (!TOKEN || query.length < 2) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${TOKEN}` +
    `&country=ng` +
    `&types=address,poi,neighborhood,locality,place,district` +
    `&proximity=${ILORIN_PROXIMITY}` +
    `&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return data.features || [];
}

export async function getDrivingDistance(
  origin: [number, number],
  dest: [number, number]
): Promise<{ distanceKm: number; durationMin: number } | null> {
  if (!TOKEN) return null;
  const [lng1, lat1] = origin;
  const [lng2, lat2] = dest;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lng1},${lat1};${lng2},${lat2}` +
    `?access_token=${TOKEN}&overview=false&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) return null;
  return {
    distanceKm: +(route.distance / 1000).toFixed(1),
    durationMin: Math.ceil(route.duration / 60),
  };
}
