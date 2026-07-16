import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Truck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [authDone, setAuthDone] = useState(false);

  useEffect(() => {
    if (authDone && user) navigate("/admin/dashboard");
  }, [authDone, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signIn(email, password);
      setAuthDone(true);
    } catch (e: any) {
      setErr(e.message || "Sign in failed");
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

        <h1 className="text-2xl font-bold text-fg mb-1">Admin sign in</h1>
        <p className="text-sm text-muted-fg mb-6">Sign in to access the admin dashboard.</p>
        {err && <p className="text-xs text-error mb-4 bg-error-light px-3 py-2 rounded-lg">{err}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50"
            placeholder="Email address" required />
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50 pr-10"
              placeholder="Password" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-muted-fg" /> : <Eye className="w-4 h-4 text-muted-fg" />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-primary-fg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? "Signing in..." : "Sign in"} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
        <button onClick={() => navigate("/")} className="text-xs text-muted-fg hover:text-fg mt-4 block text-center w-full transition-colors">Back to home</button>
      </motion.div>
    </div>
  );
}
