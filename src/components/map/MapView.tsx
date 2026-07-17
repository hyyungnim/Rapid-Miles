import { useEffect, useRef } from "react";
import { loadGoogleMaps, hasGoogleMaps } from "../../lib/google-maps";

interface DriverMarker {
  lat: number;
  lng: number;
  label?: string;
  heading?: number | null;
}

interface Props {
  pickupLat?: number; pickupLng?: number;
  dropLat?: number; dropLng?: number;
  driver?: DriverMarker;
  height?: string;
}

export function MapView({ pickupLat, pickupLng, dropLat, dropLng, driver, height = "300px" }: Props) {
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

      // Driver marker with heading
      if (driver?.lat && driver?.lng) {
        const icon = driver.heading != null
          ? {
              path: gm.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#fff",
              rotation: driver.heading,
            }
          : {
              path: gm.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#fff",
            };
        const m = new gm.Marker({
          position: { lat: driver.lat, lng: driver.lng },
          map,
          title: driver.label || "Rider",
          icon,
          zIndex: 10,
        });
        markers.push(m);
      }

      (map as any).__markers = markers;

      // Fit bounds to include all markers
      const allCoords = [
        pickupLat && pickupLng ? { lat: pickupLat, lng: pickupLng } : null,
        dropLat && dropLng ? { lat: dropLat, lng: dropLng } : null,
        driver?.lat && driver?.lng ? { lat: driver.lat, lng: driver.lng } : null,
      ].filter(Boolean) as { lat: number; lng: number }[];

      if (allCoords.length >= 2) {
        const lats = allCoords.map(c => c.lat);
        const lngs = allCoords.map(c => c.lng);
        const bounds = new gm.LatLngBounds(
          { lat: Math.min(...lats), lng: Math.min(...lngs) },
          { lat: Math.max(...lats), lng: Math.max(...lngs) }
        );
        map.fitBounds(bounds, 80);
      } else if (allCoords.length === 1) {
        map.setCenter(allCoords[0]);
        map.setZoom(14);
      }
    });

    return () => { cancelled = true; };
  }, [pickupLat, pickupLng, dropLat, dropLng, driver?.lat, driver?.lng, driver?.heading]);

  if (!hasGoogleMaps()) {
    return (
      <div className="rounded-xl overflow-hidden bg-muted flex items-center justify-center" style={{ height, width: "100%" }}>
        <p className="text-sm text-muted-fg">Map unavailable — API key not configured</p>
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-xl overflow-hidden" style={{ height, width: "100%" }} />;
}
