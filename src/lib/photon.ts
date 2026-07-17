import { loadGoogleMaps, hasGoogleMaps } from "./google-maps";

export const ILORIN = {
  bbox: [4.4, 8.4, 4.75, 8.65] as [number, number, number, number],
  center: { lat: 8.4966, lon: 4.5426 },
};

const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ display_name: string; lat: number; lon: number } | null> {
  if (hasGoogleMaps()) {
    try {
      const gm = await loadGoogleMaps();
      if (gm) {
        const geocoder = new gm.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            resolve(status === gm.GeocoderStatus.OK && results?.length ? results[0] : null);
          });
        });
        if (result) {
          return {
            display_name: result.formatted_address,
            lat,
            lon: lng,
          };
        }
      }
    } catch {
      // Fall through to Nominatim
    }
  }

  // Fallback: Nominatim (OSM)
  try {
    const url = `${NOMINATIM_REVERSE}?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "RapidMiles/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.display_name) {
      return { display_name: data.display_name, lat: parseFloat(data.lat), lon: parseFloat(data.lon) };
    }
  } catch {}
  return null;
}
