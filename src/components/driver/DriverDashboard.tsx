import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Navigation, Clock, Package, ChevronDown, Phone,
  CheckCircle, XCircle, Truck, User, Camera, LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

type Tab = "active" | "history";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "active", label: "Active", icon: Navigation },
  { key: "history", label: "History", icon: Clock },
];

interface Delivery {
  id: string; pickup: string; dropoff: string;
  customer: string; customerPhone: string;
  recipient: string; recipientPhone: string;
  status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered";
  amount: string; eta?: string; photo: string | null;
}

const DELIVERIES: Delivery[] = [
  {
    id: "RML-2401", pickup: "Tanke, Ilorin", dropoff: "Unilorin Campus",
    customer: "Abdulsalam K.", customerPhone: "+234 800 111 2222",
    recipient: "Dr. Adeyemi", recipientPhone: "+234 800 777 8888",
    status: "pending", amount: "₦3,200",
    photo: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=200&h=200&fit=crop",
  },
  {
    id: "RML-2402", pickup: "GRA, Ilorin", dropoff: "Kwara Mall",
    customer: "Amina B.", customerPhone: "+234 800 333 4444",
    recipient: "Hauwa H.", recipientPhone: "+234 800 999 0000",
    status: "accepted", amount: "₦4,500", eta: "15 min",
    photo: null,
  },
  {
    id: "RML-2400", pickup: "Airport Rd", dropoff: "Sango Garage",
    customer: "Fatimah O.", customerPhone: "+234 800 555 6666",
    recipient: "Musa K.", recipientPhone: "+234 800 222 3333",
    status: "in_transit", amount: "₦2,800", eta: "8 min",
    photo: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=200&h=200&fit=crop",
  },
];

const HISTORY: Delivery[] = [
  { id: "RML-2399", pickup: "Tanke", dropoff: "University Rd", customer: "Kunle A.", customerPhone: "+234 800 111 2222", recipient: "Prof. Saliu", recipientPhone: "+234 800 333 4444", status: "delivered", amount: "₦3,500", photo: null },
  { id: "RML-2398", pickup: "GRA", dropoff: "Sango", customer: "Bola M.", customerPhone: "+234 800 555 6666", recipient: "Tunde B.", recipientPhone: "+234 800 777 8888", status: "delivered", amount: "₦4,200", photo: null },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "text-accent bg-accent-light",
  accepted: "text-fg bg-muted",
  in_transit: "text-primary bg-primary-light",
  delivered: "text-success bg-success-light",
};

export function DriverDashboard() {
  const [tab, setTab] = useState<Tab>("active");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs text-muted-fg hidden sm:inline">Online</span>
            </div>
            <button onClick={() => navigate("/driver/profile")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors">
              <span className="text-sm text-muted-fg hidden sm:block">{user?.full_name || "Driver"}</span>
              <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-xs font-bold text-white">
                {(user?.full_name || "D")[0].toUpperCase()}
              </div>
            </button>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-fg hover:text-fg hover:bg-muted transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
        <nav className="sm:hidden flex items-center gap-1 px-6 pb-3 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                tab === t.key ? "bg-card text-fg shadow-sm" : "text-muted-fg"
              }`}>
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg space-y-2">
            {(tab === "active" ? DELIVERIES : HISTORY).map(d => (
              <div key={d.id} className="rounded-xl bg-muted overflow-hidden transition-colors hover:bg-card">
                <button onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  className="w-full p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-fg">{d.id}</p>
                      <p className="text-xs text-muted-fg">{d.dropoff}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[d.status]}`}>{d.status.replace("_", " ")}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-fg transition-transform ${expanded === d.id ? "rotate-180" : ""}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {expanded === d.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><p className="text-xs text-muted-fg">Pickup</p><p className="text-fg">{d.pickup}</p></div>
                          <div><p className="text-xs text-muted-fg">Drop-off</p><p className="text-fg">{d.dropoff}</p></div>
                          <div><p className="text-xs text-muted-fg">Sender</p><p className="text-fg">{d.customer}</p></div>
                          <div><p className="text-xs text-muted-fg">Receiver</p><p className="text-fg">{d.recipient}</p></div>
                        </div>

                        {d.photo && (
                          <div>
                            <p className="text-xs text-muted-fg mb-1 flex items-center gap-1">
                              <Camera className="w-3 h-3" /> Package photo
                            </p>
                            <img src={d.photo} alt="Package" className="w-full h-40 object-cover rounded-lg border border-border" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={`tel:${d.customerPhone}`} className="px-3 py-1.5 rounded-full bg-[#0f172a] text-white text-xs font-medium hover:bg-[#1e293b] transition-colors flex items-center gap-1.5">
                            <Phone className="w-3 h-3" /> Call sender
                          </a>
                          <a href={`tel:${d.recipientPhone}`} className="px-3 py-1.5 rounded-full border border-border text-fg text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1.5">
                            <Phone className="w-3 h-3" /> Call receiver
                          </a>
                          {d.status === "pending" && (
                            <>
                              <button className="px-3 py-1.5 rounded-full bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors flex items-center gap-1.5">
                                <CheckCircle className="w-3 h-3" /> Accept
                              </button>
                              <button className="px-3 py-1.5 rounded-full border border-border text-muted-fg text-xs font-medium hover:text-fg transition-colors flex items-center gap-1.5">
                                <XCircle className="w-3 h-3" /> Decline
                              </button>
                            </>
                          )}
                          {d.status === "accepted" && (
                            <button className="px-4 py-1.5 rounded-full bg-accent text-accent-fg text-xs font-medium hover:bg-accent/90 transition-colors">Mark picked up</button>
                          )}
                          {d.status === "in_transit" && (
                            <button className="px-4 py-1.5 rounded-full bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors">Mark delivered</button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
