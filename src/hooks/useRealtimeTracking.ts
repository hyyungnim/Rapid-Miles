import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

interface DriverLocation {
  driver_id: string;
  driver_name: string;
  lat: number;
  lng: number;
  heading: number | null;
  updated_at: string;
}

export function useRealtimeTracking(bookingId: string | null) {
  const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null);
  const [driverOnline, setDriverOnline] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!bookingId || !supabase) return;

    const fetchLocation = async () => {
      const { data: booking } = await supabase
        .from("bookings")
        .select("driver_id")
        .eq("id", bookingId)
        .maybeSingle();

      if (!booking?.driver_id) {
        setDriverLoc(null);
        setDriverOnline(false);
        return;
      }

      const { data: loc } = await supabase
        .from("driver_locations")
        .select("driver_id, lat, lng, heading, updated_at")
        .eq("driver_id", booking.driver_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (loc) {
        const { data: driver } = await supabase
          .from("drivers")
          .select("full_name")
          .eq("id", loc.driver_id)
          .maybeSingle();

        setDriverLoc({
          driver_id: loc.driver_id,
          driver_name: driver?.full_name || "Rider",
          lat: loc.lat,
          lng: loc.lng,
          heading: loc.heading,
          updated_at: loc.updated_at,
        });
        setDriverOnline(true);
      } else {
        setDriverOnline(false);
      }
    };

    fetchLocation();

    // Poll every 5s as fallback (Realtime subscription also active)
    pollRef.current = setInterval(fetchLocation, 5000);

    // Supabase Realtime subscription for live updates
    const channel = supabase
      .channel(`driver-location-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const loc = payload.new as any;
          if (loc?.lat && loc?.lng) {
            setDriverLoc((prev) => ({
              driver_id: loc.driver_id,
              driver_name: prev?.driver_name || "Rider",
              lat: loc.lat,
              lng: loc.lng,
              heading: loc.heading,
              updated_at: loc.updated_at,
            }));
            setDriverOnline(true);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollRef.current);
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  return { driverLoc, driverOnline };
}
