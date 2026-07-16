import { useEffect, useRef, useState } from "react";

interface Props {
  pickupLat?: number; pickupLng?: number;
  dropLat?: number; dropLng?: number;
  height?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapView({ pickupLat, pickupLng, dropLat, dropLng, height = "300px" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => {
      (window as any).mapboxgl.accessToken = MAPBOX_TOKEN;
      setReady(true);
    };
    document.head.appendChild(script);

    return () => {
      link.remove();
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !(window as any).mapboxgl) return;
    const mapboxgl = (window as any).mapboxgl;

    if (!mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: pickupLng && pickupLat ? [pickupLng, pickupLat] : [4.5426, 8.4966],
        zoom: 13,
      });
    }

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const map = mapInstance.current;

    if (pickupLat && pickupLng) {
      const el = document.createElement("div");
      el.className = "w-4 h-4 rounded-full bg-primary border-2 border-white shadow";
      const m = new mapboxgl.Marker({ element: el })
        .setLngLat([pickupLng, pickupLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Pickup"))
        .addTo(map);
      markersRef.current.push(m);
    }

    if (dropLat && dropLng) {
      const el = document.createElement("div");
      el.className = "w-4 h-4 rounded-full bg-accent border-2 border-white shadow";
      const m = new mapboxgl.Marker({ element: el })
        .setLngLat([dropLng, dropLat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Drop-off"))
        .addTo(map);
      markersRef.current.push(m);
    }

    if (pickupLat && pickupLng && dropLat && dropLng) {
      const bounds = [
        [Math.min(pickupLng, dropLng), Math.min(pickupLat, dropLat)],
        [Math.max(pickupLng, dropLng), Math.max(pickupLat, dropLat)],
      ] as [[number, number], [number, number]];
      map.fitBounds(bounds, { padding: 60 });
    } else if (pickupLat && pickupLng) {
      map.setCenter([pickupLng, pickupLat]);
      map.setZoom(14);
    }
  }, [ready, pickupLat, pickupLng, dropLat, dropLng]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="rounded-xl bg-muted flex items-center justify-center" style={{ height }}>
        <p className="text-xs text-muted-fg">Set VITE_MAPBOX_TOKEN in .env</p>
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-xl overflow-hidden" style={{ height, width: "100%" }} />;
}
