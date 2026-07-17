import { useState, useRef, useCallback, useEffect } from "react";
import { loadGoogleMaps, hasGoogleMaps } from "../../lib/google-maps";
import { searchLandmarks, type Landmark } from "../../lib/ilorin-landmarks";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (s: { place_id: string; display_name: string; lat: string; lon: string }) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

interface Suggestion {
  id: string;
  label: string;
  lat: number;
  lon: number;
  source: "landmark" | "google";
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder = "Enter address", icon }: Props) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setItems([]); setOpen(false); return; }

    const local: Suggestion[] = searchLandmarks(q).slice(0, 6).map((l: Landmark, i: number) => ({
      id: `lm-${i}`,
      label: l.name,
      lat: l.lat,
      lon: l.lng,
      source: "landmark" as const,
    }));

    setItems(local);
    setOpen(local.length > 0);

    if (!hasGoogleMaps()) return;

    setFetching(true);
    try {
      const gm = await loadGoogleMaps();
      if (!gm) return;

      if (!autocompleteRef.current) {
        autocompleteRef.current = new gm.places.AutocompleteService();
      }

      const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteRef.current!.getPlacePredictions(
          {
            input: q,
            types: ["address", "establishment", "geocode"],
            componentRestrictions: { country: "ng" },
            locationBias: { lat: 8.4966, lng: 4.5426 } as any,
            radius: 50000,
          },
          (results, status) => {
            if (status === gm.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });

      const googleItems: Suggestion[] = predictions.slice(0, 6).map((p) => ({
        id: p.place_id,
        label: p.description,
        lat: 0,
        lon: 0,
        source: "google" as const,
      }));

      const seen = new Set(local.map((l) => l.label.toLowerCase()));
      const merged = [...local, ...googleItems.filter((g) => !seen.has(g.label.toLowerCase()))];
      setItems(merged);
      setOpen(merged.length > 0);
    } catch (err) {
      console.warn("Google Places autocomplete failed:", err);
      if (local.length === 0) setItems([]);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const resolveGoogleLatLng = useCallback(async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const gm = await loadGoogleMaps();
      if (!gm) return null;
      const geocoder = new gm.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
        geocoder.geocode({ placeId }, (results, status) => {
          resolve(status === gm.GeocoderStatus.OK && results?.length ? results[0] : null);
        });
      });
      if (result && result.geometry?.location) {
        const loc = result.geometry.location;
        return { lat: loc.lat(), lng: loc.lng() };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const handleSelect = async (item: Suggestion) => {
    onChange(item.label);
    setOpen(false);

    if (item.source === "google" && item.lat === 0) {
      const coords = await resolveGoogleLatLng(item.id);
      if (coords) {
        item.lat = coords.lat;
        item.lon = coords.lng;
      }
    }

    onSelect?.({
      place_id: item.id,
      display_name: item.label,
      lat: String(item.lat),
      lon: String(item.lon),
    });
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/30 transition-all">
        {icon}
        <input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50"
          placeholder={placeholder}
        />
        <div className="flex items-center gap-1">
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="w-5 h-5 rounded-full bg-border text-muted-fg hover:text-fg hover:bg-border/80 text-xs flex items-center justify-center transition-colors"
              aria-label="Clear">
              ×
            </button>
          )}
          {fetching && <span className="w-3 h-3 rounded-full border border-muted-fg border-t-transparent animate-spin" />}
        </div>
      </div>
      {open && items.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card rounded-xl border border-border shadow-lg max-h-60 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-primary-light hover:text-primary border-b border-border last:border-0 transition-colors flex items-center gap-2"
            >
              <span className="text-[10px] font-medium text-accent bg-accent-light px-1.5 py-0.5 rounded shrink-0">
                {item.source === "landmark" ? "Landmark" : "Place"}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
