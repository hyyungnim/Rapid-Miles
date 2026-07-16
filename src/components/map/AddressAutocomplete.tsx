import { useState, useRef, useCallback } from "react";
import { searchLandmarks, type Landmark } from "../../lib/ilorin-landmarks";

interface Suggestion { place_id: string; display_name: string; lat: string; lon: string; }

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (s: Suggestion) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

interface CombinedSuggestion {
  id: string;
  label: string;
  lat: string;
  lon: string;
  source: "landmark" | "nominatim";
}

const ILORIN_BBOX = "4.40,8.65,4.75,8.40";

export function AddressAutocomplete({ value, onChange, onSelect, placeholder = "Enter address", icon }: Props) {
  const [suggestions, setSuggestions] = useState<CombinedSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }

    const local = searchLandmarks(q).map((l: Landmark, i: number) => ({
      id: `lm-${i}`,
      label: l.name,
      lat: String(l.lat),
      lon: String(l.lng),
      source: "landmark" as const,
    }));

    setFetching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=NG&viewbox=${ILORIN_BBOX}&bounded=0&dedup=1`
      );
      if (!res.ok) throw new Error("Network error");
      const data: Suggestion[] = await res.json();
      const osm = data.map((s) => ({
        id: s.place_id,
        label: s.display_name,
        lat: s.lat,
        lon: s.lon,
        source: "nominatim" as const,
      }));

      const seen = new Set(local.map(s => s.label.toLowerCase()));
      const merged = [...local, ...osm.filter(s => !seen.has(s.label.toLowerCase()))];
      setSuggestions(merged);
      setOpen(merged.length > 0);
    } catch {
      setSuggestions(local);
      setOpen(local.length > 0);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (s: CombinedSuggestion) => {
    onChange(s.label);
    setOpen(false);
    onSelect?.({ place_id: s.id, display_name: s.label, lat: s.lat, lon: s.lon });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/30 transition-all">
        {icon}
        <input value={value} onChange={e => handleChange(e.target.value)}
          className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50" placeholder={placeholder} />
        {fetching && <span className="w-3 h-3 rounded-full border border-muted-fg border-t-transparent animate-spin" />}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card rounded-xl border border-border shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map(s => (
            <button key={s.id} type="button" onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-primary-light hover:text-primary border-b border-border last:border-0 transition-colors flex items-center gap-2">
              {s.source === "landmark" && (
                <span className="text-[10px] font-medium text-accent bg-accent-light px-1.5 py-0.5 rounded shrink-0">Landmark</span>
              )}
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
