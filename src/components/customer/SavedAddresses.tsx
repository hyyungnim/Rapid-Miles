import { useState } from "react";
import { Home, Briefcase, Heart, Plus, Trash2, MapPin } from "lucide-react";
import { AddressAutocomplete } from "../map/AddressAutocomplete";

const ICONS: Record<string, any> = { home: Home, work: Briefcase, other: Heart };

export function SavedAddresses() {
  const [addresses, setAddresses] = useState([
    { id: "1", label: "home", address: "27 Bolorunduro Community, Tanke Akata, Ilorin", default: true },
    { id: "2", label: "work", address: "Kwara State University Main Gate, Malete", default: false },
    { id: "3", label: "other", address: "University of Ilorin, Main Campus", default: false },
  ]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("home");
  const [newAddress, setNewAddress] = useState("");

  const handleAdd = () => {
    if (!newAddress.trim()) return;
    setAddresses(prev => [...prev, {
      id: `addr-${Date.now()}`,
      label: newLabel,
      address: newAddress,
      default: false,
    }]);
    setNewAddress("");
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-lg">
      <div className="space-y-2 mb-4">
        {addresses.map(a => {
          const Icon = ICONS[a.label] || MapPin;
          return (
            <div key={a.id}
              className="rounded-xl bg-muted p-4 flex items-start gap-3 group hover:bg-card transition-colors cursor-default">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-fg capitalize">{a.label}</p>
                  {a.default && <span className="text-[10px] font-medium text-muted-fg bg-border px-1.5 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-xs text-muted-fg truncate">{a.address}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-error-light transition-all">
                <Trash2 className="w-3.5 h-3.5 text-error" />
              </button>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="rounded-xl bg-muted p-4 space-y-3">
          <div className="flex gap-2">
            {[
              { k: "home", label: "Home", icon: Home },
              { k: "work", label: "Work", icon: Briefcase },
              { k: "other", label: "Other", icon: Heart },
            ].map(r => (
              <button key={r.k} type="button" onClick={() => setNewLabel(r.k)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  newLabel === r.k ? "bg-primary text-white" : "bg-card text-muted-fg hover:bg-border"
                }`}>
                <r.icon className="w-3 h-3" /> {r.label}
              </button>
            ))}
          </div>
          <AddressAutocomplete value={newAddress} onChange={setNewAddress} placeholder="Enter address"
            icon={<MapPin className="w-4 h-4 text-muted-fg shrink-0" />} />
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setNewAddress(""); }}
              className="flex-1 py-2 rounded-full text-sm font-medium text-muted-fg hover:text-fg transition-colors">Cancel</button>
            <button onClick={handleAdd}
              className="flex-1 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-fg hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add address
        </button>
      )}
    </div>
  );
}
