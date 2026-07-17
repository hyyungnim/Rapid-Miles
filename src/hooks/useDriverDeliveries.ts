import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface DriverDelivery {
  id: string;
  pickup: string;
  dropoff: string;
  customer: string;
  customerPhone: string;
  recipient: string;
  recipientPhone: string;
  status: string;
  amount: number;
  eta?: string;
}

export function useDriverDeliveries() {
  const { user } = useAuth();
  const [activeDeliveries, setActiveDeliveries] = useState<DriverDelivery[]>([]);
  const [history, setHistory] = useState<DriverDelivery[]>([]);
  const [allBookings, setAllBookings] = useState<DriverDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  function mapBookings(bookings: any[]): DriverDelivery[] {
    return bookings.map((b: any) => ({
      id: b.tracking_number || b.id,
      pickup: b.pickup_address || "",
      dropoff: b.delivery_address || "",
      customer: b.customer || b.user_id || "Unknown",
      customerPhone: b.customerPhone || "",
      recipient: b.recipient_name || "",
      recipientPhone: b.recipient_phone || "",
      status: b.status,
      amount: b.delivery_fee || 0,
    }));
  }

  const updateBookingStatus = useCallback(async (trackingNumber: string, newStatus: string) => {
    const driverId = user?.id || null;
    if (supabase) {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus, driver_id: driverId })
        .eq("tracking_number", trackingNumber);
      if (error) {
        // Fallback to localStorage
        const all: any[] = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
        const updated = all.map((b: any) =>
          b.tracking_number === trackingNumber ? { ...b, status: newStatus, driver_id: driverId } : b
        );
        localStorage.setItem("rm_bookings", JSON.stringify(updated));
      }
    } else {
      const all: any[] = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
      const updated = all.map((b: any) =>
        b.tracking_number === trackingNumber ? { ...b, status: newStatus, driver_id: driverId } : b
      );
      localStorage.setItem("rm_bookings", JSON.stringify(updated));
    }
    // Refresh
    window.location.reload();
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const localAll: any[] = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
    const localMapped = mapBookings(localAll.filter((b: any) => b.driver_id === user?.id || b.status === "pending"));

    if (!supabase) {
      setActiveDeliveries(localMapped.filter(d => !["delivered", "cancelled"].includes(d.status)));
      setHistory(localMapped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      setAllBookings(localMapped);
      setLoading(false);
      return;
    }

    try {
      const { data: supBookings } = await supabase
        .from("bookings")
        .select("*")
        .or(`driver_id.eq.${user.id},status.eq.pending`)
        .order("created_at", { ascending: false });

      const customerIds = [...new Set((supBookings || []).map((b: any) => b.user_id))];
      const { data: customers } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", customerIds.length ? customerIds : ["none"]);

      const customerMap = new Map((customers || []).map((c: any) => [c.id, c]));

      const supMapped = (supBookings || []).map((b: any) => {
        const c = customerMap.get(b.user_id) || { full_name: b.user_id || "Unknown", phone: "" };
        return {
          id: b.tracking_number || b.id,
          pickup: b.pickup_address || "",
          dropoff: b.delivery_address || "",
          customer: c.full_name,
          customerPhone: c.phone || "",
          recipient: b.recipient_name || "",
          recipientPhone: b.recipient_phone || "",
          status: b.status,
          amount: b.delivery_fee || 0,
        };
      });

      const merged = [...localMapped, ...supMapped];
      const seen = new Set<string>();
      const deduped = merged.filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });

      // Backfill Supabase bookings into localStorage
      if (supBookings && supBookings.length > 0) {
        const existingLocal = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
        const localKeys = new Set(existingLocal.map((b: any) => b.tracking_number));
        const missing = supBookings.filter((b: any) => !localKeys.has(b.tracking_number || b.id));
        if (missing.length > 0) {
          localStorage.setItem("rm_bookings", JSON.stringify([...existingLocal, ...missing]));
        }
      }

      setActiveDeliveries(deduped.filter(d => !["delivered", "cancelled"].includes(d.status)));
      setHistory(deduped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      setAllBookings(deduped);
    } catch (e) {
      console.warn("Driver Supabase fetch failed, using local data only:", e);
      // Backfill attempt
      try {
        const { data: backup } = await supabase.from("bookings").select("*");
        if (backup && backup.length > 0) {
          const existing = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
          const localKeys = new Set(existing.map((b: any) => b.tracking_number));
          const missing = backup.filter((b: any) => !localKeys.has(b.tracking_number || b.id));
          if (missing.length > 0) {
            localStorage.setItem("rm_bookings", JSON.stringify([...existing, ...missing]));
          }
        }
      } catch (_) {}
      // Re-read local after possible backfill
      const refetched: any[] = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
      const refetchedMapped = mapBookings(refetched.filter((b: any) => b.driver_id === user?.id || b.status === "pending"));
      setActiveDeliveries(refetchedMapped.filter(d => !["delivered", "cancelled"].includes(d.status)));
      setHistory(refetchedMapped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      setAllBookings(refetchedMapped);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();

    // Re-fetch when localStorage changes from another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rm_bookings") fetchAll();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchAll]);

  return { activeDeliveries, history, allBookings, loading, updateBookingStatus, refresh: fetchAll };
}
