import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface Props { onClose: () => void; onSwitchToSignUp: () => void; onSuccess: (role: string) => void; }

export function Login({ onClose, onSwitchToSignUp, onSuccess }: Props) {
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [showPw, setShowPw] = useState(false);
  const { signIn, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      const users = JSON.parse(localStorage.getItem("rm_users") || "[]");
      const u = users.find((x: any) => x.email === form.email);
      let role = u?.role;
      if (!role && form.email === "rapidmileslogistics@gmail.com") role = "admin";
      onSuccess(role || form.role);
    } catch (e: any) {
      setErr(e.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card rounded-2xl w-full max-w-sm p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors">
          <X className="w-3.5 h-3.5 text-muted-fg" />
        </button>
        <h2 className="text-2xl font-bold text-fg mb-1">Welcome back</h2>
        <p className="text-sm text-muted-fg mb-6">Choose your role and sign in.</p>
        {(err || error) && <p className="text-xs text-error mb-4">{err || error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-fg mb-2 block">I am a</label>
            <div className="flex gap-2">
              {[
                { k: "customer", label: "Customer" },
                { k: "driver", label: "Driver" },
              ].map(r => (
                <button key={r.k} type="button" onClick={() => setForm(f => ({ ...f, role: r.k }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    form.role === r.k ? "bg-primary text-white" : "bg-muted text-muted-fg hover:bg-border"
                  }`}>{r.label}</button>
              ))}
            </div>
          </div>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-0 py-2.5 bg-transparent border-b border-border text-fg text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-fg/50"
            placeholder="Email address" required />
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-0 py-2.5 bg-transparent border-b border-border text-fg text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-fg/50 pr-6"
              placeholder="Password" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-0 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-muted-fg" /> : <Eye className="w-4 h-4 text-muted-fg" />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-[#0f172a] text-white font-medium text-sm hover:bg-[#1e293b] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? "Signing in..." : "Sign in"} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-sm text-muted-fg text-center mt-6">
          No account?{" "}
          <button type="button" onClick={onSwitchToSignUp} className="text-fg font-medium hover:text-primary transition-colors">Create one</button>
        </p>
      </motion.div>
    </motion.div>
  );
}
