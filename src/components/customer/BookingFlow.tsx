import { useState, useRef } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, Package, User, Phone, ArrowRight, Camera, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { AddressAutocomplete } from "../map/AddressAutocomplete";

export function BookingFlow() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pickup: "", dropoff: "", description: "", recipientName: "", recipientPhone: "",
    weight: "light",
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [booked, setBooked] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

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
    setStep(3);
  };

  const handleConfirm = () => {
    const id = `RML-${Date.now().toString(36).toUpperCase()}`;
    setTrackingId(id);
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
          className="px-8 py-3 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
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
                step >= s.n ? "bg-primary text-white" : "bg-border text-muted-fg"
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
            <AddressAutocomplete value={form.pickup} onChange={v => update("pickup", v)} placeholder="Where to collect?"
              icon={<MapPin className="w-4 h-4 text-muted-fg shrink-0" />} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">Drop-off</label>
            <AddressAutocomplete value={form.dropoff} onChange={v => update("dropoff", v)} placeholder="Where is it going?"
              icon={<Navigation className="w-4 h-4 text-muted-fg shrink-0" />} />
          </div>
          <button onClick={() => setStep(2)} className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
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
                    form.weight === w.k ? "bg-[#0f172a] text-white" : "bg-muted text-muted-fg hover:bg-border"
                  }`}>{w.label}</button>
              ))}
            </div>
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
            <button onClick={handleReview} className="flex-1 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Review</button>
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
            Confirm & book <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
