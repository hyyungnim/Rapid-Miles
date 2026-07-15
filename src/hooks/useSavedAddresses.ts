import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Address } from "../lib/types";
import { useAuth } from "../contexts/AuthContext";

export function useSavedAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAddresses(data);
        setLoading(false);
      });
  }, [user]);

  const addAddress = useCallback(
    async (addr: Omit<Address, "id" | "created_at" | "user_id">) => {
      if (!user || !supabase) return;
      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...addr, user_id: user.id })
        .select()
        .single();
      if (!error && data) setAddresses((prev) => [data, ...prev]);
      return data;
    },
    [user]
  );

  const removeAddress = useCallback(async (id: string) => {
    if (!supabase) return;
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { addresses, loading, addAddress, removeAddress };
}
