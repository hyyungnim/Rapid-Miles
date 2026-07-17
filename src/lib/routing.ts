import { loadGoogleMaps, hasGoogleMaps } from "./google-maps";

const OSRM_TIMEOUT = 10_000;
const NIGERIA_BOX = { minLat: 4, maxLat: 14, minLng: 2, maxLng: 15 };

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  source: "google" | "osrm" | "estimate";
}

function isValidCoord(c: { lat: number; lng: number }): boolean {
  return (
    isFinite(c.lat) && isFinite(c.lng) &&
    Math.abs(c.lat) > 0.01 && Math.abs(c.lng) > 0.01 &&
    c.lat >= NIGERIA_BOX.minLat && c.lat <= NIGERIA_BOX.maxLat &&
    c.lng >= NIGERIA_BOX.minLng && c.lng <= NIGERIA_BOX.maxLng
  );
}

function isSameLocation(a: { lat: number; lng: number }, b: { lat: number; lng: number }): boolean {
  return Math.abs(a.lat - b.lat) < 0.001 && Math.abs(a.lng - b.lng) < 0.001;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDuration(distKm: number): number {
  if (distKm <= 0) return 0;
  if (distKm < 2) return Math.ceil(distKm * 3);
  if (distKm < 10) return Math.ceil(distKm * 2.5);
  return Math.ceil(distKm * 2);
}

export async function getDrivingDistance(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Promise<RouteResult | null> {
  if (!isValidCoord(origin) || !isValidCoord(dest)) return null;

  if (isSameLocation(origin, dest)) {
    return { distanceKm: 0, durationMin: 0, source: "estimate" };
  }

  // Try Google Directions first
  if (hasGoogleMaps()) {
    try {
      const gm = await loadGoogleMaps();
      if (gm) {
        const directions = new gm.DirectionsService();
        const result = await new Promise<google.maps.DirectionsResult | null>((resolve) => {
          directions.route(
            {
              origin: new gm.LatLng(origin.lat, origin.lng),
              destination: new gm.LatLng(dest.lat, dest.lng),
              travelMode: gm.TravelMode.DRIVING,
            },
            (res, status) => {
              resolve(status === gm.DirectionsStatus.OK ? res : null);
            }
          );
        });
        if (result?.routes?.[0]?.legs?.[0]) {
          const leg = result.routes[0].legs[0];
          return {
            distanceKm: +(leg.distance!.value / 1000).toFixed(1),
            durationMin: Math.ceil(leg.duration!.value / 60),
            source: "google",
          };
        }
      }
    } catch {
      // Fall through to OSRM
    }
  }

  // Fallback: OSRM
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`;
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) throw new Error(`OSRM ${res.status}`);

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) throw new Error("No route");

    return {
      distanceKm: +(route.distance / 1000).toFixed(1),
      durationMin: Math.ceil(route.duration / 60),
      source: "osrm",
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;

    const distKm = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
    const rounded = Math.round(distKm * 10) / 10;

    return {
      distanceKm: rounded < 0.1 ? 0 : rounded,
      durationMin: estimateDuration(distKm),
      source: "estimate",
    };
  } finally {
    clearTimeout(timeout);
  }
}
