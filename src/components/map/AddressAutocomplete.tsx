import { useState, useRef, useCallback } from "react";

interface Suggestion { place_id: string; display_name: string; lat: string; lon: string; }

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (s: Suggestion) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder = "Enter address", icon }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    setFetching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=NG`
      );
      if (!res.ok) throw new Error("Network error");
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.display_name);
    setOpen(false);
    onSelect?.(s);
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
            <button key={s.place_id} type="button" onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-primary-light hover:text-primary border-b border-border last:border-0 transition-colors">
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
