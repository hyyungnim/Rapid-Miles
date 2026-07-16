import { useState, useRef, useCallback, useEffect } from "react";
import { searchLandmarks, type Landmark } from "../../lib/ilorin-landmarks";
import { ILORIN, toPhotonResult, type PhotonFeature, type PhotonResult } from "../../lib/photon";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (s: { place_id: string; display_name: string; lat: string; lon: string }) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

interface LocalItem {
  id: string;
  label: string;
  lat: number;
  lon: number;
  source: "landmark" | "photon";
}

const CACHE_TTL = 60_000;

export function AddressAutocomplete({ value, onChange, onSelect, placeholder = "Enter address", icon }: Props) {
  const [items, setItems] = useState<LocalItem[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const cacheRef = useRef(new Map<string, { data: LocalItem[]; expiry: number }>());

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const fetchPhoton = useCallback(async (q: string): Promise<LocalItem[]> => {
    const params = new URLSearchParams({
      q,
      limit: "6",
      bbox: ILORIN.bbox.join(","),
      lat: String(ILORIN.center.lat),
      lon: String(ILORIN.center.lon),
    });

    const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
      signal: abortRef.current?.signal,
    });
    if (!res.ok) throw new Error("Photon API error");

    const body: { features: PhotonFeature[] } = await res.json();
    return (body.features || []).map((f) => {
      const r = toPhotonResult(f);
      return { id: r.place_id, label: r.display_name, lat: r.lat, lon: r.lon, source: "photon" as const };
    });
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setItems([]); setOpen(false); return; }

    const local: LocalItem[] = searchLandmarks(q).slice(0, 4).map((l: Landmark, i: number) => ({
      id: `lm-${i}`,
      label: l.name,
      lat: l.lat,
      lon: l.lng,
      source: "landmark" as const,
    }));

    setItems(local);
    setOpen(local.length > 0);

    const cached = cacheRef.current.get(q);
    if (cached && Date.now() < cached.expiry) {
      setItems(cached.data);
      setOpen(cached.data.length > 0);
      return;
    }

    setFetching(true);
    try {
      const photon = await fetchPhoton(q);
      const seen = new Set(local.map((l) => l.label.toLowerCase()));
      const merged = [...local, ...photon.filter((p) => !seen.has(p.label.toLowerCase()))];
      cacheRef.current.set(q, { data: merged, expiry: Date.now() + CACHE_TTL });
      setItems(merged);
      setOpen(merged.length > 0);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (local.length === 0) setItems(local);
    } finally {
      setFetching(false);
    }
  }, [fetchPhoton]);

  const handleChange = (val: string) => {
    onChange(val);
    abortRef.current?.abort();
    clearTimeout(timerRef.current);
    abortRef.current = new AbortController();
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (item: LocalItem) => {
    onChange(item.label);
    setOpen(false);
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
        {fetching && <span className="w-3 h-3 rounded-full border border-muted-fg border-t-transparent animate-spin" />}
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
              {item.source === "landmark" && (
                <span className="text-[10px] font-medium text-accent bg-accent-light px-1.5 py-0.5 rounded shrink-0">
                  Landmark
                </span>
              )}
              {item.source === "photon" && (
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950 px-1.5 py-0.5 rounded shrink-0">
                  Place
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
