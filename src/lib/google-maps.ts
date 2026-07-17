import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let loader: Loader | null = null;
let loadPromise: Promise<typeof google.maps> | null = null;

export function getGoogleMapsLoader(): Loader | null {
  if (!API_KEY) {
    console.warn("VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps will not be available.");
    return null;
  }
  if (!loader) {
    loader = new Loader({
      apiKey: API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"],
    });
  }
  return loader;
}

export async function loadGoogleMaps(): Promise<typeof google.maps | null> {
  const l = getGoogleMapsLoader();
  if (!l) return null;
  if (!loadPromise) {
    loadPromise = l.load().catch((err) => {
      console.warn("Google Maps failed to load:", err);
      loadPromise = null;
      return null;
    });
  }
  return loadPromise;
}

export function hasGoogleMaps(): boolean {
  return !!API_KEY;
}
