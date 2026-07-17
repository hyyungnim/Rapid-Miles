import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { Plus, Navigation, Clock, MapPin, Truck, User, LogOut, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { BookingFlow } from "../components/customer/BookingFlow";
import { TrackDelivery } from "../components/customer/TrackDelivery";
import { DeliveryHistory } from "../components/customer/DeliveryHistory";
import { SavedAddresses } from "../components/customer/SavedAddresses";
import { useNotifications } from "../hooks/useNotifications";

type Tab = "book" | "track" | "history" | "addresses" | "profile";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "book", label: "Book", icon: Plus },
  { key: "track", label: "Track", icon: Navigation },
  { key: "history", label: "History", icon: Clock },
  { key: "addresses", label: "Places", icon: MapPin },
];

const CONTENT: Record<Tab, React.ReactNode> = {
  book: <BookingFlow />,
  track: <TrackDelivery />,
  history: <DeliveryHistory />,
  addresses: <SavedAddresses />,
  profile: null,
};

export function CustomerDashboard() {
  const [tab, setTab] = useState<Tab>("book");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { unread, notifications, markRead, markAllRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

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
            <div ref={notifRef} className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="w-4 h-4 text-muted-fg" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-[9px] font-bold text-white flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <span className="text-xs font-semibold text-fg">Notifications</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[11px] text-primary hover:text-primary/80">Mark all read</button>
                    )}
                  </div>
                  {notifications.length === 0 && (
                    <p className="text-xs text-muted-fg text-center py-8">No notifications</p>
                  )}
                  {notifications.map(n => (
                    <button key={n.id} onClick={() => { if (!n.read) markRead(n.id); }}
                      className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors ${!n.read ? "bg-primary-light/20" : ""}`}>
                      <p className="text-xs font-semibold text-fg">{n.title}</p>
                      <p className="text-[11px] text-muted-fg mt-0.5">{n.body}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => navigate("/customer/profile")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors">
              <span className="text-sm text-muted-fg hidden sm:block">{user?.full_name || "User"}</span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                {(user?.full_name || "U")[0].toUpperCase()}
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.key ? "bg-card text-fg shadow-sm" : "text-muted-fg"
              }`}>
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            {tab === "profile" ? (
              <div className="max-w-lg">
                <p className="text-sm text-muted-fg">Profile management</p>
                <p className="text-lg font-bold text-fg mt-1">Coming soon</p>
              </div>
            ) : CONTENT[tab]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
