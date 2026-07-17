import { useEffect, useRef } from "react";
import { loadGoogleMaps, hasGoogleMaps } from "../../lib/google-maps";

interface Props {
  pickupLat?: number; pickupLng?: number;
  dropLat?: number; dropLng?: number;
  height?: string;
}

export function MapView({ pickupLat, pickupLng, dropLat, dropLng, height = "300px" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!hasGoogleMaps()) return;

    let cancelled = false;

    loadGoogleMaps().then((gm) => {
      if (!gm || cancelled || !mapRef.current) return;

      if (!mapInstance.current) {
        mapInstance.current = new gm.Map(mapRef.current, {
          center: { lat: pickupLat || 8.4966, lng: pickupLng || 4.5426 },
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          ],
        });
      }

      const map = mapInstance.current;
      map.setOptions({ draggableCursor: "default" });

      // Clear old markers
      const markers: google.maps.Marker[] = [];
      if ((map as any).__markers) {
        (map as any).__markers.forEach((m: google.maps.Marker) => m.setMap(null));
      }

      if (pickupLat && pickupLng) {
        const m = new gm.Marker({
          position: { lat: pickupLat, lng: pickupLng },
          map,
          title: "Pickup",
          label: { text: "A", color: "#fff", fontWeight: "bold" },
        });
        markers.push(m);
      }
      if (dropLat && dropLng) {
        const m = new gm.Marker({
          position: { lat: dropLat, lng: dropLng },
          map,
          title: "Drop-off",
          label: { text: "B", color: "#fff", fontWeight: "bold" },
        });
        markers.push(m);
      }

      (map as any).__markers = markers;

      if (pickupLat && pickupLng && dropLat && dropLng) {
        const bounds = new gm.LatLngBounds(
          { lat: Math.min(pickupLat, dropLat), lng: Math.min(pickupLng, dropLng) },
          { lat: Math.max(pickupLat, dropLat), lng: Math.max(pickupLng, dropLng) }
        );
        map.fitBounds(bounds, 60);
      } else if (pickupLat && pickupLng) {
        map.setCenter({ lat: pickupLat, lng: pickupLng });
        map.setZoom(14);
      }
    });

    return () => { cancelled = true; };
  }, [pickupLat, pickupLng, dropLat, dropLng]);

  if (!hasGoogleMaps()) {
    return (
      <div className="rounded-xl overflow-hidden bg-muted flex items-center justify-center" style={{ height, width: "100%" }}>
        <p className="text-sm text-muted-fg">Map unavailable — API key not configured</p>
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-xl overflow-hidden" style={{ height, width: "100%" }} />;
}
