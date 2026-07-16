import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, Package, User, Phone, ArrowRight, Camera, CheckCircle, AlertTriangle, LocateFixed, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { AddressAutocomplete } from "../map/AddressAutocomplete";
import { calcDeliveryFee, fmtCurrency } from "../../lib/constants";
import { getDrivingDistance } from "../../lib/routing";
import { reverseGeocode } from "../../lib/photon";
import { findNearestLandmark } from "../../lib/ilorin-landmarks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const WEIGHT_KG: Record<string, number> = { light: 0.5, medium: 3, heavy: 7 };

function isValidCoord(c: { lat: number; lng: number }): boolean {
  return isFinite(c.lat) && isFinite(c.lng) && Math.abs(c.lat) > 0.01 && Math.abs(c.lng) > 0.01;
}

const SAME_LOCATION_WARNING = "Pickup and drop-off are the same location. Distance-based fee will be ₦0.";

export function BookingFlow() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pickup: "", dropoff: "", description: "", recipientName: "", recipientPhone: "",
    weight: "light",
  });
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [routingSource, setRoutingSource] = useState<"osrm" | "estimate" | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [booked, setBooked] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const sameLocation = pickupCoords && dropoffCoords &&
    Math.abs(pickupCoords.lat - dropoffCoords.lat) < 0.001 &&
    Math.abs(pickupCoords.lng - dropoffCoords.lng) < 0.001;

  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDistanceKm(null);
      setDurationMin(null);
      setRouteError(false);
      setRoutingSource(null);
      return;
    }

    if (!isValidCoord(pickupCoords) || !isValidCoord(dropoffCoords)) {
      setRouteError(true);
      setDistanceKm(null);
      setDurationMin(null);
      setRoutingSource(null);
      return;
    }

    let cancelled = false;
    setCalculating(true);
    setRouteError(false);

    getDrivingDistance(pickupCoords, dropoffCoords).then(result => {
      if (cancelled) return;
      if (result) {
        setDistanceKm(result.distanceKm);
        setDurationMin(result.durationMin);
        setRoutingSource(result.source);
      } else {
        setRouteError(true);
        setDistanceKm(null);
        setDurationMin(null);
        setRoutingSource(null);
      }
    }).catch(() => {
      if (!cancelled) setRouteError(true);
    }).finally(() => {
      if (!cancelled) setCalculating(false);
    });

    return () => { cancelled = true; };
  }, [pickupCoords, dropoffCoords]);

  const fee = distanceKm !== null ? calcDeliveryFee(distanceKm, WEIGHT_KG[form.weight]) : null;

  const handlePickupSelect = (s: { place_id: string; display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    if (isValidCoord({ lat, lng })) {
      setPickupCoords({ lat, lng });
    }
  };

  const handleDropoffSelect = (s: { place_id: string; display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    if (isValidCoord({ lat, lng })) {
      setDropoffCoords({ lat, lng });
    }
  };

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocateError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPickupCoords({ lat, lng });
        const nearby = findNearestLandmark(lat, lng);
        if (nearby) {
          update("pickup", nearby.name);
        } else {
          const result = await reverseGeocode(lat, lng);
          update("pickup", result ? result.display_name : `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
        setLocating(false);
      },
      (err) => {
        setLocateError(err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setPhoto(ev.target?.result as string); setPhotoError(false); };
      reader.readAsDataURL(file);
    }
  };

  const handleReview = () => {
    if (!photo) { setPhotoError(true); return; }
    if (!pickupCoords || !dropoffCoords) return;
    setStep(3);
  };

  const handleConfirm = async () => {
    const id = `RML-${Date.now().toString(36).toUpperCase()}`;
    setTrackingId(id);

    const booking = {
      user_id: user?.id || "anonymous",
      tracking_number: id,
      pickup_address: form.pickup,
      pickup_lat: pickupCoords?.lat || 0,
      pickup_lng: pickupCoords?.lng || 0,
      delivery_address: form.dropoff,
      delivery_lat: dropoffCoords?.lat || 0,
      delivery_lng: dropoffCoords?.lng || 0,
      distance_km: distanceKm || 0,
      duration_minutes: durationMin || 0,
      package_name: form.description,
      package_category: "general",
      weight_kg: WEIGHT_KG[form.weight] || 0.5,
      is_fragile: false,
      quantity: 1,
      delivery_notes: null,
      delivery_fee: fee || 0,
      status: "pending" as const,
      route_geometry: null,
    };

    if (supabase) {
      await supabase.from("bookings").insert(booking).throwOnError();
    } else {
      const existing = JSON.parse(localStorage.getItem("rm_bookings") || "[]");
      localStorage.setItem("rm_bookings", JSON.stringify([...existing, { id: `${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...booking }]));
    }

    setBooked(true);
  };

  if (booked) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg text-center py-12">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-fg mb-2">Booking confirmed!</h2>
        <p className="text-sm text-muted-fg mb-2">Your tracking ID</p>
        <p className="text-3xl font-bold text-primary tracking-tight mb-8">{trackingId}</p>
        <button onClick={() => navigate(0)}
          className="px-8 py-3 rounded-full bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
          Book another
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-0 mb-10">
        {[
          { n: 1, label: "Route" },
          { n: 2, label: "Package" },
          { n: 3, label: "Confirm" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                step >= s.n ? "bg-primary text-primary-fg" : "bg-border text-muted-fg"
              }`}>{s.n}</div>
              <span className={`text-xs font-medium ${step >= s.n ? "text-fg" : "text-muted-fg"}`}>{s.label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px mx-3 ${step > s.n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-lg">
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">Pickup</label>
            <AddressAutocomplete value={form.pickup} onChange={v => { update("pickup", v); if (!v) setPickupCoords(null); }}
              onSelect={handlePickupSelect}
              placeholder="Where to collect?"
              icon={<MapPin className="w-4 h-4 text-muted-fg shrink-0" />} />
            <button type="button" onClick={handleUseMyLocation} disabled={locating}
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 transition-colors">
              {locating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
              {locating ? "Getting location…" : "Use my current location"}
            </button>
            {locateError && (
              <p className="mt-1 text-xs text-error">{locateError}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">Drop-off</label>
            <AddressAutocomplete value={form.dropoff} onChange={v => { update("dropoff", v); if (!v) setDropoffCoords(null); }}
              onSelect={handleDropoffSelect}
              placeholder="Where is it going?"
              icon={<Navigation className="w-4 h-4 text-muted-fg shrink-0" />} />
          </div>

          {sameLocation && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-warning-light dark:bg-warning-light/10 text-warning text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{SAME_LOCATION_WARNING}</span>
            </div>
          )}

          {routeError && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Could not calculate route. Please try different locations.</span>
            </div>
          )}

          <div className="rounded-xl bg-primary-light/50 divide-y divide-primary-light/80 text-sm">
            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
              <div className="flex items-center gap-2">
                <span className="text-muted-fg">Distance</span>
                  {routingSource === "estimate" && (
                    <span className="text-[10px] font-medium text-warning bg-warning-light px-1.5 py-0.5 rounded">Estimate</span>
                  )}
              </div>
              {calculating ? (
                <span className="w-4 h-4 rounded-full border border-muted-fg border-t-transparent animate-spin" />
              ) : distanceKm !== null ? (
                <span className="font-semibold text-fg">
                  {distanceKm} km{durationMin !== null ? ` · ${durationMin} min` : ""}
                </span>
              ) : (
                <span className="text-muted-fg/50">Select both locations</span>
              )}
            </div>
            {fee !== null && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-fg">Total fee</span>
                <span className="font-semibold text-fg">{fmtCurrency(fee)}</span>
              </div>
            )}
          </div>

          <button onClick={() => setStep(2)} disabled={distanceKm === null || calculating}
            className="w-full py-2.5 rounded-full bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
            Continue
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 max-w-lg">
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">What's inside?</label>
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/30 transition-all">
              <Package className="w-4 h-4 text-muted-fg shrink-0 mt-0.5" />
              <textarea value={form.description} onChange={e => update("description", e.target.value)}
                className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50 resize-none min-h-[60px]" placeholder="Documents, fragile items, etc." />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">Weight</label>
            <div className="flex gap-2">
              {[
                { k: "light", label: "Light (<1kg)" },
                { k: "medium", label: "Med (1-5kg)" },
                { k: "heavy", label: "Heavy (>5kg)" },
              ].map(w => (
                <button key={w.k} type="button" onClick={() => update("weight", w.k)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    form.weight === w.k ? "bg-primary text-primary-fg" : "bg-muted text-muted-fg hover:bg-border"
                  }`}>{w.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary-light/50 text-sm">
            <span className="text-muted-fg">Estimated fare</span>
            <span className="font-semibold text-fg">{fee !== null ? fmtCurrency(fee) : "—"}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">
              Package photo <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-3">
              {photo ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={photo} alt="Package" className="w-full h-full object-cover" />
                  <button onClick={() => setPhoto(null)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center">×</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className={`w-20 h-20 rounded-xl bg-muted border border-dashed flex flex-col items-center justify-center gap-1 hover:bg-card hover:border-primary/50 transition-all ${photoError ? "border-error" : "border-border"}`}>
                  <Camera className={`w-5 h-5 ${photoError ? "text-error" : "text-muted-fg"}`} />
                  <span className={`text-[10px] ${photoError ? "text-error" : "text-muted-fg"}`}>Snap</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
            </div>
            {photoError && <p className="text-xs text-error mt-1">Photo is required before proceeding</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">Recipient</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <User className="w-4 h-4 text-muted-fg shrink-0" />
                <input value={form.recipientName} onChange={e => update("recipientName", e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50" placeholder="Recipient's name" />
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                <Phone className="w-4 h-4 text-muted-fg shrink-0" />
                <input value={form.recipientPhone} onChange={e => update("recipientPhone", e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50" placeholder="Recipient's phone" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-full text-sm font-medium text-muted-fg hover:text-fg transition-colors">Back</button>
            <button onClick={handleReview} className="flex-1 py-2.5 rounded-full bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">Review</button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
          <div className="rounded-xl bg-muted p-6 space-y-4 mb-6">
            {[
              { label: "Pickup", val: form.pickup || "Not set" },
              { label: "Drop-off", val: form.dropoff || "Not set" },
              { label: "Package", val: form.description || "Not specified" },
              { label: "Weight", val: form.weight },
              { label: "Distance", val: distanceKm !== null ? `${distanceKm} km` : "—" },
              { label: "Duration", val: durationMin !== null ? `${durationMin} min` : "—" },
              { label: "Fee", val: fee !== null ? fmtCurrency(fee) : "—" },
              { label: "Recipient", val: `${form.recipientName}, ${form.recipientPhone}` },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between gap-4">
                <span className="text-xs text-muted-fg shrink-0 w-20">{r.label}</span>
                <span className="text-sm text-fg text-right">{r.val}</span>
              </div>
            ))}
            {photo && (
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-xs text-muted-fg shrink-0 w-20">Photo</span>
                <img src={photo} alt="Package" className="w-14 h-14 rounded-lg object-cover border border-border" />
              </div>
            )}
          </div>
          <button onClick={handleConfirm}
            className="w-full py-3 rounded-full bg-accent text-accent-fg font-semibold text-sm hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
            Confirm & book · {fee !== null ? fmtCurrency(fee) : ""} <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
