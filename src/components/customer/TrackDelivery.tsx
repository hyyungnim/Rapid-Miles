import { useState } from "react";
import { Search, Truck, MapPin, Navigation, Camera } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { MapView } from "../map/MapView";

const PROGRESS: Record<string, number> = {
  pending: 0, accepted: 1, rider_assigned: 1, picked_up: 2, in_transit: 2, delivered: 3,
};

const STEPS = ["Ordered", "Picked up", "In transit", "Delivered"];

export function TrackDelivery() {
  const [id, setId] = useState("");
  const [delivery, setDelivery] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!id.trim()) return;
    setSearching(true);
    setNotFound(false);
    setDelivery(null);

    const { data, error } = await supabase
      ?.from("bookings")
      .select("*")
      .eq("tracking_number", id.trim())
      .maybeSingle();

    if (!error && data) {
      let riderName = "";
      if (data.driver_id) {
        const { data: driver } = await supabase.from("drivers").select("full_name").eq("id", data.driver_id).maybeSingle();
        riderName = driver?.full_name || "";
      }
      setDelivery({ ...data, rider_name: riderName });
    } else {
      setNotFound(true);
    }
    setSearching(false);
  };

  const progressIndex = delivery ? (PROGRESS[delivery.status] ?? 0) : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8 max-w-lg">
        <div className="flex-1">
          <input value={id} onChange={e => setId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg placeholder:text-muted-fg/50 focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all"
            placeholder="Tracking ID (e.g. RML-2401)" />
        </div>
        <button onClick={handleSearch} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          {searching ? "..." : "Track"}
        </button>
      </div>

      {notFound && (
        <p className="text-sm text-error mb-4">No delivery found with that tracking ID</p>
      )}

      {delivery && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-fg mb-0.5">Tracking</p>
              <p className="text-2xl font-bold text-fg tracking-tight">{delivery.tracking_number}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-medium capitalize">{delivery.status.replace("_", " ")}</span>
          </div>

          <div className="flex items-start gap-0">
            {STEPS.map((s, i) => {
              const active = i <= progressIndex;
              return (
                <div key={s} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? "bg-primary" : "bg-border"}`} />
                    {i < STEPS.length - 1 && <div className={`flex-1 h-px ${active ? "bg-primary" : "bg-border"}`} />}
                  </div>
                  <p className={`text-xs mt-1.5 ${active ? "text-fg font-medium" : "text-muted-fg"}`}>{s}</p>
                </div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Pickup", val: delivery.pickup_address },
              { icon: Navigation, label: "Drop-off", val: delivery.delivery_address },
            ].map(p => (
              <div key={p.label} className="rounded-xl bg-muted p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <p.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-muted-fg tracking-wider uppercase">{p.label}</span>
                </div>
                <p className="text-sm text-fg">{p.val}</p>
              </div>
            ))}
          </div>

          {delivery.package_photo && (
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-muted-fg tracking-wider uppercase">Package photo</span>
              </div>
              <img src={delivery.package_photo} alt="Package" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          {delivery.driver_id && (
            <div className="rounded-xl bg-muted p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0f172a] flex items-center justify-center text-sm font-bold text-white">
                  {(delivery.rider_name || "R")[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-fg">{delivery.rider_name || "Rider"}</p>
                  <p className="text-xs text-muted-fg">Your rider</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}

          {delivery.pickup_lat && delivery.delivery_lat && (
            <MapView pickupLat={delivery.pickup_lat} pickupLng={delivery.pickup_lng}
              dropLat={delivery.delivery_lat} dropLng={delivery.delivery_lng} height="220px" />
          )}
        </div>
      )}
    </div>
  );
}
