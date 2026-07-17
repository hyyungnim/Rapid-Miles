import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useDriverLocation(bookingId: string | null, active: boolean) {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const shareLocation = useCallback(async () => {
    if (!user || !bookingId || !supabase) return;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        });
      });

      const { latitude: lat, longitude: lng } = pos.coords;
      lastPosRef.current = { lat, lng };

      await supabase.from("driver_locations").upsert(
        {
          driver_id: user.id,
          booking_id: bookingId,
          lat,
          lng,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        },
        { onConflict: "driver_locations_driver_booking_key" }
      );

      setError(null);
      setSharing(true);
    } catch (err: any) {
      if (err.code === 1) {
        setError("Location access denied. Enable GPS in settings.");
      } else if (err.code === 2) {
        setError("GPS unavailable. Try moving to an open area.");
      } else if (err.code === 3) {
        setError("GPS timeout. Check your signal.");
      }
      setSharing(false);
    }
  }, [user, bookingId]);

  useEffect(() => {
    if (!active || !bookingId) {
      clearInterval(intervalRef.current);
      setSharing(false);
      return;
    }

    // Immediately share on start
    shareLocation();
    intervalRef.current = setInterval(shareLocation, 5000);

    return () => {
      clearInterval(intervalRef.current);
      setSharing(false);
    };
  }, [active, bookingId, shareLocation]);

  return { sharing, error };
}
