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

  useEffect(() => {
    async function fetchLocal() {
      const all: any[] = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
      const mapped: DriverDelivery[] = all.filter(b => b.driver_id === user?.id || b.status === "pending").map((b: any) => ({
        id: b.tracking_number,
        pickup: b.pickup_address || "",
        dropoff: b.delivery_address || "",
        customer: b.user_id || "Unknown",
        customerPhone: "",
        recipient: b.recipient_name || "",
        recipientPhone: b.recipient_phone || "",
        status: b.status,
        amount: b.delivery_fee || 0,
      }));
      setActiveDeliveries(mapped.filter(d => !["delivered", "cancelled"].includes(d.status)));
      setHistory(mapped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      setLoading(false);
    }

    if (!user) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      fetchLocal();
      return;
    }

    async function fetchDeliveries() {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !bookings) {
        setLoading(false);
        return;
      }

      const customerIds = [...new Set(bookings.map((b: any) => b.user_id))];
      const { data: customers } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", customerIds.length ? customerIds : ["none"]);

      const customerMap = new Map((customers || []).map((c: any) => [c.id, c]));

      const mapped: DriverDelivery[] = bookings.map((b: any) => {
        const c = customerMap.get(b.user_id) || { full_name: "Unknown", phone: "" };
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

      setActiveDeliveries(mapped.filter(d => !["delivered", "cancelled"].includes(d.status)));
      setHistory(mapped.filter(d => ["delivered", "cancelled"].includes(d.status)));
      setLoading(false);
    }

    fetchDeliveries();
  }, [user]);

  return { activeDeliveries, history, loading };
}
