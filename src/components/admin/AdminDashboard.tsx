import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, Users, UserCheck, Package, DollarSign, TrendingUp,
  Truck, Activity, ArrowUpRight, Clock, MapPin, LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

type Tab = "overview" | "analytics" | "revenue";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
  { key: "revenue", label: "Revenue", icon: DollarSign },
];

const STATS = [
  { label: "Deliveries", val: "1,247", change: "+12%", icon: Package },
  { label: "Customers", val: "342", change: "+8%", icon: Users },
  { label: "Drivers", val: "18", change: "+2", icon: UserCheck },
  { label: "Revenue", val: "₦486K", change: "+15%", icon: DollarSign },
];

const RECENT = [
  { id: "RML-2401", customer: "Abdulsalam K.", driver: "Muhammed S.", status: "in_transit", amount: "₦3,200" },
  { id: "RML-2400", customer: "Fatimah O.", driver: "Ibrahim K.", status: "delivered", amount: "₦2,800" },
  { id: "RML-2399", customer: "Kunle A.", driver: "Bola A.", status: "delivered", amount: "₦3,500" },
];

const TOP_DRIVERS = [
  { name: "Muhammed S.", deliveries: 45, rating: "4.8", online: true },
  { name: "Ibrahim K.", deliveries: 32, rating: "4.6", online: true },
  { name: "Bola A.", deliveries: 28, rating: "4.7", online: false },
];

const ANALYTICS = [
  { label: "Avg. Delivery Time", val: "24 min", change: "-5%", icon: Clock },
  { label: "On-Time Rate", val: "97%", change: "+2%", icon: Activity },
  { label: "Avg. Distance", val: "12.4 km", change: "+0.5%", icon: MapPin },
  { label: "Repeat Rate", val: "68%", change: "+4%", icon: Users },
  { label: "Avg. Rating", val: "4.8 ★", change: "+0.1", icon: BarChart3 },
  { label: "Cancellation", val: "2.3%", change: "-0.7%", icon: Clock },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center"><Truck className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-semibold text-[15px] tracking-tight text-fg">RAPID MILES</span>
            </div>
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
                    {RECENT.map(d => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-fg">{d.id}</p>
                          <p className="text-xs text-muted-fg">{d.customer} → {d.driver}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          d.status === "delivered" ? "bg-success-light text-success" : "bg-primary-light text-primary"
                        }`}>{d.status}</span>
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
                    {TOP_DRIVERS.map(d => (
                      <div key={d.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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
                {ANALYTICS.map(s => (
                  <div key={s.label} className="rounded-xl bg-muted p-5">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-4 h-4 text-muted-fg" />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.change.startsWith("+") ? "bg-success-light text-success" :
                        s.change.startsWith("-") ? "bg-error-light text-error" : "bg-muted text-muted-fg"
                      }`}>{s.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-fg">{s.val}</p>
                    <p className="text-xs text-muted-fg mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "revenue" && (
            <motion.div key="revenue" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Today", val: "₦18,400" },
                  { label: "Week", val: "₦112K" },
                  { label: "Month", val: "₦486K" },
                  { label: "All time", val: "₦2.4M" },
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
                  {[60, 45, 80, 55, 90, 70, 85, 65, 95, 75, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full bg-primary/10 rounded-t relative" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t transition-all" style={{ height: `${h}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-fg">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
