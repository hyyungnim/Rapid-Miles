const ORS_BASE = "https://api.openrouteservice.org";
const API_KEY = import.meta.env.VITE_ORS_API_KEY || "";

interface ORSCoordinate {
  lat: number;
  lng: number;
}

interface GeoJSONFeature {
  geometry: { coordinates: number[]; type: string };
  properties: {
    label: string;
    name: string;
    country: string;
    region: string;
    locality: string;
    housenumber?: string;
    street?: string;
    postal_code?: string;
  };
}

interface ORSRouteResponse {
  features: Array<{
    geometry: { coordinates: number[][]; type: string };
    properties: {
      segments: Array<{
        distance: number;
        duration: number;
        steps: Array<{
          distance: number;
          duration: number;
          instruction: string;
          name: string;
        }>;
      }>;
      summary: { distance: number; duration: number };
    };
  }>;
}

export async function searchAddress(
  query: string,
  focusPoint?: { lat: number; lng: number }
): Promise<Array<{ label: string; lat: number; lng: number; details: string }>> {
  const params = new URLSearchParams({
    api_key: API_KEY,
    text: query,
    size: "8",
    layers: "address,locality,venue",
  });
  if (focusPoint) {
    params.set("focus.point.lat", String(focusPoint.lat));
    params.set("focus.point.lon", String(focusPoint.lng));
  }

  const res = await fetch(
    `${ORS_BASE}/geocode/search?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to search address");

  const data = await res.json();
  return (data.features || []).map((f: GeoJSONFeature) => {
    const coords = f.geometry.coordinates;
    const p = f.properties;
    const parts = [p.street, p.housenumber, p.locality, p.region].filter(Boolean);
    return {
      label: p.label || p.name,
      lat: coords[1],
      lng: coords[0],
      details: parts.join(", ") || p.label,
    };
  });
}

export async function reverseGeocode(lat: number, lng: number) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    "point.lat": String(lat),
    "point.lon": String(lng),
    size: "1",
  });

  const res = await fetch(`${ORS_BASE}/geocode/reverse?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to reverse geocode");

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  return {
    label: feature.properties.label,
    lat,
    lng,
    details: feature.properties.label,
  };
}

export async function calculateRoute(
  start: ORSCoordinate,
  end: ORSCoordinate
) {
  const body = {
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ],
    format: "geojson",
    profile: "driving-car",
    geometry: true,
    instructions: false,
  };

  const res = await fetch(
    `${ORS_BASE}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("Failed to calculate route");

  const data: ORSRouteResponse = await res.json();
  const feature = data.features?.[0];
  if (!feature) throw new Error("No route found");

  const summary = feature.properties.summary;
  return {
    distanceKm: +(summary.distance / 1000).toFixed(1),
    durationMinutes: Math.ceil(summary.duration / 60),
    geometry: feature.geometry,
  };
}
