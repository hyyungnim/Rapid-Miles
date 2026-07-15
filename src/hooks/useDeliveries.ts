import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Booking } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";

export function useDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDeliveries(data);
        setLoading(false);
      });
  }, [user]);

  const addDelivery = useCallback((booking: Booking) => {
    setDeliveries((prev) => [booking, ...prev]);
  }, []);

  return { deliveries, loading, addDelivery };
}
