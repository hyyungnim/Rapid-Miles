import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchAll() {
      const localAll: any[] = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
      const localMapped = mapBookings(localAll.filter((b: any) => b.driver_id === user?.id || b.status === "pending"));

      if (!supabase) {
        setActiveDeliveries(localMapped.filter(d => !["delivered", "cancelled"].includes(d.status)));
        setHistory(localMapped.filter(d => ["delivered", "cancelled"].includes(d.status)));
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

        setActiveDeliveries(deduped.filter(d => !["delivered", "cancelled"].includes(d.status)));
        setHistory(deduped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      } catch (e) {
        console.warn("Driver Supabase fetch failed, using local data only:", e);
        setActiveDeliveries(localMapped.filter(d => !["delivered", "cancelled"].includes(d.status)));
        setHistory(localMapped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      }

      setLoading(false);
    }

    fetchAll();
  }, [user]);

  return { activeDeliveries, history, loading };
}
