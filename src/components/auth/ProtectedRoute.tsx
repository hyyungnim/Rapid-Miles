import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../lib/types";

interface Props { children: React.ReactNode; role: UserRole; }

export function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/", { replace: true });
    else if (user.role !== role) {
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "driver") navigate("/driver/dashboard", { replace: true });
      else navigate("/customer", { replace: true });
    }
  }, [user, loading, role, navigate]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-5 h-5 rounded-full border border-muted-fg border-t-transparent animate-spin" /></div>;
  if (!user || user.role !== role) return null;

  return <>{children}</>;
}
