import { useState } from "react";
import { Search, Truck, MapPin, Navigation, Camera } from "lucide-react";
import { MapView } from "../map/MapView";

const MOCK = {
  id: "RML-2401", status: "in_transit",
  pickup: "27 Bolorunduro Community, Tanke, Ilorin",
  dropoff: "University of Ilorin Main Campus",
  rider: "Muhammed S.", eta: "12 min",
  photo: null as string | null,
};

const STEPS = ["Ordered", "Picked up", "In transit", "Delivered"];

export function TrackDelivery() {
  const [id, setId] = useState("");
  const [delivery, setDelivery] = useState<typeof MOCK | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!id.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setDelivery({ ...MOCK, id: id.startsWith("RML") ? id : `RML-${id}`, photo: null });
      setSearching(false);
    }, 600);
  };

  const progressIndex = 2;

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

      {delivery && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-fg mb-0.5">Tracking</p>
              <p className="text-2xl font-bold text-fg tracking-tight">{delivery.id}</p>
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
              { icon: MapPin, label: "Pickup", val: delivery.pickup },
              { icon: Navigation, label: "Drop-off", val: delivery.dropoff },
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

          {delivery.photo && (
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-muted-fg tracking-wider uppercase">Package photo</span>
              </div>
              <img src={delivery.photo} alt="Package" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          <div className="rounded-xl bg-muted p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0f172a] flex items-center justify-center text-sm font-bold text-white">{delivery.rider[0]}</div>
              <div>
                <p className="text-sm font-semibold text-fg">{delivery.rider}</p>
                <p className="text-xs text-muted-fg">Your rider</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-fg">{delivery.eta}</span>
            </div>
          </div>

          <MapView pickupLat={8.495} pickupLng={4.553} dropLat={8.48} dropLng={4.541} height="220px" />
        </div>
      )}

      {searching && !delivery && (
        <p className="text-sm text-muted-fg">Searching...</p>
      )}
    </div>
  );
}
