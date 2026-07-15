import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";
import { Plus, Navigation, Clock, MapPin, Truck, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { BookingFlow } from "../components/customer/BookingFlow";
import { TrackDelivery } from "../components/customer/TrackDelivery";
import { DeliveryHistory } from "../components/customer/DeliveryHistory";
import { SavedAddresses } from "../components/customer/SavedAddresses";

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
