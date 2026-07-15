import { useState } from "react";
import { X, Mail, ArrowLeft, Truck } from "lucide-react";
import { motion } from "motion/react";

interface Props { onClose: () => void; onBackToLogin: () => void; }

export function ForgotPassword({ onClose, onBackToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Truck className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-gray-900 text-sm">Rapid Miles</span>
        </div>
        {sent ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">We've sent a password reset link to <strong className="text-gray-700">{email}</strong></p>
            <button onClick={onBackToLogin} className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Forgot password?</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="bg-transparent flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400" placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <button onClick={onBackToLogin} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mx-auto mt-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
