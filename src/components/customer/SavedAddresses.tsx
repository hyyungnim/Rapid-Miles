import { useState, useEffect } from "react";
import { Home, Briefcase, Heart, Plus, Trash2, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { AddressAutocomplete } from "../map/AddressAutocomplete";

const ICONS: Record<string, any> = { home: Home, work: Briefcase, other: Heart };

export function SavedAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("home");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }
    supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at")
      .then(({ data, error }) => {
        if (!error && data) setAddresses(data);
        setLoading(false);
      });
  }, [user]);

  const handleAdd = async () => {
    if (!newAddress.trim() || !user || !supabase) return;
    const { data, error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label: newLabel,
      full_address: newAddress,
      lat: 0,
      lng: 0,
      is_favorite: newLabel === "home",
    }).select().maybeSingle();

    if (!error && data) {
      setAddresses(prev => [...prev, data]);
    }
    setNewAddress("");
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 rounded-full border border-muted-fg border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-2">
      {addresses.map(a => {
        const Icon = ICONS[a.label] || MapPin;
        return (
          <div key={a.id} className="rounded-xl bg-muted p-4 flex items-center justify-between group hover:bg-card transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg capitalize">{a.label}</p>
                <p className="text-xs text-muted-fg">{a.full_address}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(a.id)}
              className="p-1.5 rounded-lg text-muted-fg hover:text-error hover:bg-error-light transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      {addresses.length === 0 && !adding && (
        <p className="text-sm text-muted-fg text-center py-12">No saved addresses</p>
      )}

      {adding ? (
        <div className="rounded-xl bg-muted p-4 space-y-3">
          <div className="flex items-center gap-2">
            {["home", "work", "other"].map(l => (
              <button key={l} onClick={() => setNewLabel(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                  newLabel === l ? "bg-primary text-white" : "bg-card text-muted-fg"
                }`}>{l}</button>
            ))}
          </div>
          <AddressAutocomplete value={newAddress} onChange={setNewAddress} placeholder="Enter address" />
          <div className="flex items-center gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">Save</button>
            <button onClick={() => { setAdding(false); setNewAddress(""); }} className="px-4 py-1.5 rounded-full border border-border text-muted-fg text-xs font-medium hover:text-fg transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-fg hover:text-fg hover:border-muted-fg transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add address
        </button>
      )}
    </div>
  );
}
