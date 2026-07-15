import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Truck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function CustomerAuth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [authDone, setAuthDone] = useState(false);

  useEffect(() => {
    if (authDone && user) navigate("/customer");
  }, [authDone, user, navigate]);

  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.email, form.password, form.name, form.phone, "customer");
      }
      setAuthDone(true);
    } catch (e: any) {
      setErr(e.message || (mode === "signin" ? "Sign in failed" : "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center"><Truck className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-lg text-fg">RAPID MILES</span>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-full p-1 mb-6">
          {(["signin", "signup"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${mode === m ? "bg-card text-fg shadow-sm" : "text-muted-fg"}`}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-fg mb-1">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
        <p className="text-sm text-muted-fg mb-6">
          {mode === "signin" ? "Sign in to your customer account." : "Register as a customer."}
        </p>
        {err && <p className="text-xs text-error mb-4 bg-error-light px-3 py-2 rounded-lg">{err}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50"
                  placeholder="Full name" required />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50"
                  placeholder="Phone number" required />
              </motion.div>
            )}
          </AnimatePresence>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50"
            placeholder="Email address" required />
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50 pr-10"
              placeholder={mode === "signup" ? "Password (min. 6)" : "Password"} required minLength={mode === "signup" ? 6 : undefined} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-muted-fg" /> : <Eye className="w-4 h-4 text-muted-fg" />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-[#0f172a] text-white font-medium text-sm hover:bg-[#1e293b] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? (mode === "signin" ? "Signing in..." : "Creating...") : (mode === "signin" ? "Sign in" : "Create account")} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
        <button onClick={() => navigate("/")} className="text-xs text-muted-fg hover:text-fg mt-4 block text-center w-full transition-colors">Back to home</button>
      </motion.div>
    </div>
  );
}
