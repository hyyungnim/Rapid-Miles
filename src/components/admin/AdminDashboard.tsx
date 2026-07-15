import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, Users, UserCheck, Package, DollarSign, TrendingUp,
  Activity, ArrowUpRight, Clock, MapPin, LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useAdminData } from "../../hooks/useAdminData";
import { Logo } from "../ui/Logo";

type Tab = "overview" | "analytics" | "revenue";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
  { key: "revenue", label: "Revenue", icon: DollarSign },
];

function formatCurrency(n: number) {
  if (n >= 1000000) return "₦" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "₦" + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K";
  return "₦" + n.toLocaleString();
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { stats, recentDeliveries, topDrivers, revenue, analytics, loading } = useAdminData();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border border-muted-fg border-t-transparent animate-spin" />
      </div>
    );
  }

  const STATS = stats ? [
    { label: "Deliveries", val: stats.deliveries.toLocaleString(), change: stats.deliveriesChange, icon: Package },
    { label: "Customers", val: stats.customers.toLocaleString(), change: stats.customersChange, icon: Users },
    { label: "Drivers", val: stats.drivers.toLocaleString(), change: stats.driversChange, icon: UserCheck },
    { label: "Revenue", val: formatCurrency(stats.revenue), change: stats.revenueChange, icon: DollarSign },
  ] : [];

  const STATUS_STYLE: Record<string, string> = {
    delivered: "bg-success-light text-success",
    in_transit: "bg-primary-light text-primary",
    accepted: "bg-muted text-fg",
    pending: "bg-accent-light text-accent-fg",
    picked_up: "bg-primary-light text-primary",
    cancelled: "bg-error-light text-error",
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
<Logo size="sm" />
            <nav className="hidden sm:flex items-center gap-1 bg-muted rounded-full p-1">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    tab === t.key ? "bg-card text-fg shadow-sm" : "text-muted-fg hover:text-fg"
                  }`}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-fg hidden sm:block">{user?.full_name || "Admin"}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-fg hover:text-fg hover:bg-muted transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map(s => (
                  <div key={s.label} className="rounded-xl bg-muted p-5">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-4 h-4 text-muted-fg" />
                      <span className="text-xs font-medium text-success bg-success-light px-2 py-0.5 rounded-full">{s.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-fg">{s.val}</p>
                    <p className="text-xs text-muted-fg mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-fg">Recent deliveries</p>
                    <ArrowUpRight className="w-4 h-4 text-muted-fg" />
                  </div>
                  <div className="space-y-2">
                    {recentDeliveries.length === 0 && (
                      <p className="text-sm text-muted-fg text-center py-8">No deliveries yet</p>
                    )}
                    {recentDeliveries.map(d => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-fg">{d.id}</p>
                          <p className="text-xs text-muted-fg">{d.customer_name} → {d.driver_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-fg">{formatCurrency(d.amount)}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[d.status] || STATUS_STYLE.pending}`}>{d.status.replace("_", " ")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-muted p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-fg">Top drivers</p>
                    <ArrowUpRight className="w-4 h-4 text-muted-fg" />
                  </div>
                  <div className="space-y-2">
                    {topDrivers.length === 0 && (
                      <p className="text-sm text-muted-fg text-center py-8">No drivers yet</p>
                    )}
                    {topDrivers.map(d => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0f172a] flex items-center justify-center text-xs font-bold text-white">{d.name[0]}</div>
                          <div>
                            <p className="text-sm font-medium text-fg">{d.name}</p>
                            <p className="text-xs text-muted-fg">{d.rating} ★ · {d.deliveries} deliveries</p>
                          </div>
                        </div>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.online ? "bg-success" : "bg-border"}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analytics && [
                  { label: "Avg. Delivery Time", val: analytics.avgDeliveryTime, change: "—", icon: Clock },
                  { label: "On-Time Rate", val: analytics.onTimeRate, change: "—", icon: Activity },
                  { label: "Avg. Distance", val: analytics.avgDistance, change: "—", icon: MapPin },
                  { label: "Repeat Rate", val: analytics.repeatRate, change: "—", icon: Users },
                  { label: "Avg. Rating", val: analytics.avgRating, change: "—", icon: BarChart3 },
                  { label: "Cancellation", val: analytics.cancellation, change: "—", icon: Clock },
                ].filter(s => s.val !== "—").map(s => (
                  <div key={s.label} className="rounded-xl bg-muted p-5">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-4 h-4 text-muted-fg" />
                    </div>
                    <p className="text-2xl font-bold text-fg">{s.val}</p>
                    <p className="text-xs text-muted-fg mt-1">{s.label}</p>
                  </div>
                ))}
                {!analytics && <p className="text-sm text-muted-fg col-span-full text-center py-12">No data yet</p>}
              </div>
            </motion.div>
          )}

          {tab === "revenue" && (
            <motion.div key="revenue" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg space-y-6">
              {revenue && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Today", val: formatCurrency(revenue.today) },
                      { label: "Week", val: formatCurrency(revenue.week) },
                      { label: "Month", val: formatCurrency(revenue.month) },
                      { label: "All time", val: formatCurrency(revenue.allTime) },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl bg-muted p-4">
                        <p className="text-xs text-muted-fg mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-fg">{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-muted p-6">
                    <p className="text-sm font-semibold text-fg mb-4">Monthly revenue</p>
                    <div className="h-44 flex items-end justify-between gap-2">
                      {revenue.monthly.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-primary/10 rounded-t relative" style={{ height: `${Math.max(h > 0 ? (h / Math.max(...revenue.monthly)) * 100 : 0, 2)}%` }}>
                            <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t transition-all" style={{ height: `${Math.max(h > 0 ? (h / Math.max(...revenue.monthly)) * 100 : 0, 2)}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-fg">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {!revenue && <p className="text-sm text-muted-fg text-center py-12">No revenue data yet</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}