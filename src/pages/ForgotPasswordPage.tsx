import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Truck, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface ForgotPasswordPageProps {
  role: "customer" | "driver";
}

export function ForgotPasswordPage({ role }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const backRoute = role === "customer" ? "/customer/auth" : "/rapidman";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e: any) {
      setErr(e.message || "Failed to send reset email");
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

        <h1 className="text-2xl font-bold text-fg mb-1">Forgot password</h1>
        <p className="text-sm text-muted-fg mb-6">
          {sent ? "Check your email for the reset link." : "Enter your email and we'll send you a reset link."}
        </p>

        {err && <p className="text-xs text-error mb-4 bg-error-light px-3 py-2 rounded-lg">{err}</p>}

        {sent ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-fg">{email}</p>
            </div>
            <button onClick={() => navigate(backRoute)}
              className="w-full py-3 rounded-full bg-primary text-primary-fg font-medium text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Back to sign in <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm outline-none text-fg focus:bg-card focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-fg/50"
              placeholder="Email address" required />
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-full bg-primary text-primary-fg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? "Sending..." : "Send reset link"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <button onClick={() => navigate(backRoute)}
          className="text-xs text-muted-fg hover:text-fg mt-4 block text-center w-full transition-colors">
          Back to sign in
        </button>
      </motion.div>
    </div>
  );
}
