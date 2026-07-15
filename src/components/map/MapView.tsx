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

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !pickupLat || !pickupLng) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([pickupLat, pickupLng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    L.marker([pickupLat, pickupLng]).addTo(map).bindPopup("Pickup");
    if (dropLat && dropLng) {
      L.marker([dropLat, dropLng]).addTo(map).bindPopup("Drop-off");
      const bounds = L.latLngBounds([pickupLat, pickupLng], [dropLat, dropLng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
    return () => { map.remove(); };
  }, [ready, pickupLat, pickupLng, dropLat, dropLng]);

  return <div ref={mapRef} className="rounded-lg border border-gray-200" style={{ height, width: "100%" }} />;
}
