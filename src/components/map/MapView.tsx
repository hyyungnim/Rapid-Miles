import { useEffect, useRef, useState } from "react";

interface Props {
  pickupLat?: number; pickupLng?: number;
  dropLat?: number; dropLng?: number;
  height?: string;
}

declare global { interface Window { L: any; } }

export function MapView({ pickupLat, pickupLng, dropLat, dropLng, height = "300px" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);

    return () => { link.remove(); script.remove(); };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = window.L;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [pickupLat || 8.4966, pickupLng || 4.5426], 13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;
    // Clear old layers
    map.eachLayer((layer: any) => {
      if (layer._marker || layer._polyline) map.removeLayer(layer);
    });

    if (pickupLat && pickupLng) {
      L.marker([pickupLat, pickupLng]).addTo(map).bindPopup("Pickup");
    }
    if (dropLat && dropLng) {
      L.marker([dropLat, dropLng]).addTo(map).bindPopup("Drop-off");
    }
    if (pickupLat && pickupLng && dropLat && dropLng) {
      const bounds = L.latLngBounds([pickupLat, pickupLng], [dropLat, dropLng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (pickupLat && pickupLng) {
      map.setView([pickupLat, pickupLng], 14);
    }
  }, [ready, pickupLat, pickupLng, dropLat, dropLng]);

  return <div ref={mapRef} className="rounded-xl overflow-hidden" style={{ height, width: "100%" }} />;
}
