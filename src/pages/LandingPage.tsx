import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Truck } from "lucide-react";
import { useNavigate } from "react-router";

const BASE = 500, RATE = 200;
const calcFare = (km: number) => BASE + km * RATE;

export function LandingPage() {
  const [km, setKm] = useState(10);
  const navigate = useNavigate();
  const fare = calcFare(km);

  return (
    <div className="bg-bg min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-40 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold text-[15px] text-white/90 tracking-tight">RAPID MILES</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/customer/auth")}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5">
              Sign in
            </button>
            <button onClick={() => navigate("/customer/auth")}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors px-5 py-2 rounded-full border border-white/20 hover:border-white/40">
              Get started
            </button>
          </div>
        </div>
      </nav>

      <section className="min-h-screen bg-[#0f172a] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2563eb]/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 py-32 w-full relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5c400]" />
              Ilorin — Kwara State
            </div>
            <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white mb-6">
              MOVE<br />
              <span className="text-[#f5c400]">WITH MOMENTUM.</span>
            </h1>
            <p className="text-lg text-white/40 max-w-lg leading-relaxed mb-10">
              Logistics that respects your time. Pickup, delivery, and last-mile — priced by the kilometre, tracked in real-time.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/customer/auth")}
                className="px-6 py-3 rounded-full bg-[#f5c400] text-[#0f172a] font-semibold text-sm hover:bg-[#e0b000] transition-all flex items-center gap-2">
                Start shipping <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/customer/auth")}
                className="px-6 py-3 rounded-full text-white/60 text-sm hover:text-white transition-colors">
                Track a package
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      <section className="py-32 bg-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-16">
            <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">Pricing Engine</p>
            <h2 className="text-5xl font-bold tracking-[-0.03em] text-fg">KNOW THE COST,<br />BEFORE YOU SHIP.</h2>
          </motion.div>
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-fg">Distance</span>
                    <span className="text-2xl font-bold text-fg">{km} <span className="text-sm font-normal text-muted-fg">km</span></span>
                  </div>
                  <input type="range" min={1} max={100} value={km} onChange={e => setKm(+e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
                    style={{ background: `linear-gradient(to right, #2563eb ${km}%, #e2e8f0 ${km}%)` }} />
                  <div className="flex justify-between text-xs text-muted-fg mt-1"><span>1 km</span><span>100 km</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Base fare", val: `₦${BASE.toLocaleString()}` },
                    { label: "Per km", val: `₦${RATE.toLocaleString()}` },
                    { label: "Distance cost", val: `₦${(km * RATE).toLocaleString()}` },
                    { label: "Weight included", val: "Up to 5 kg" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-fg">{r.label}</span>
                      <span className="font-medium text-fg">{r.val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-96">
              <div className="bg-[#0f172a] rounded-2xl p-8 lg:p-10">
                <p className="text-[11px] font-semibold text-white/30 tracking-[0.15em] uppercase mb-1">Estimated total</p>
                <p className="text-6xl font-bold text-[#f5c400] tracking-[-0.03em]">₦{fare.toLocaleString()}</p>
                <div className="h-px bg-white/10 my-6" />
                <button onClick={() => navigate("/customer/auth")}
                  className="w-full py-3 rounded-full bg-[#f5c400] text-[#0f172a] font-semibold text-sm hover:bg-[#e0b000] transition-all flex items-center justify-center gap-2">
                  Book this delivery <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 lg:mb-20">
            <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">Services</p>
            <h2 className="text-5xl font-bold tracking-[-0.03em] text-fg">EVERYTHING<br />WE HANDLE.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "PICKUP SERVICE", desc: "We collect from your door. Schedule a time and we handle the rest.", metric: "30 min avg." },
              { title: "EXPRESS DELIVERY", desc: "Same-day delivery within Ilorin. Tracked and time-stamped.", metric: "99% on-time" },
              { title: "LAST MILE", desc: "Precision delivery to the exact drop-off point. No guesswork.", metric: "100 m accuracy" },
              { title: "BUSINESS", desc: "Bulk logistics with custom rates, dedicated support, and monthly billing.", metric: "50+ partners" },
            ].map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 lg:p-8 rounded-xl bg-bg border border-border hover:border-primary/30 transition-all cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-semibold text-primary tracking-wider">{s.metric}</span>
                  <span className="text-2xl font-bold text-border group-hover:text-primary/20 transition-colors">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-xl font-bold text-fg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2 lg:sticky lg:top-32">
              <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3">Process</p>
              <h2 className="text-5xl font-bold tracking-[-0.03em] text-fg mb-4">FOUR STEPS.</h2>
              <p className="text-muted-fg text-sm leading-relaxed">From booking to delivery in the simplest workflow possible.</p>
            </motion.div>
            <div className="lg:col-span-3 space-y-16">
              {[
                { n: "01", title: "CREATE ACCOUNT", desc: "Sign up in under 60 seconds. No paperwork, no delays." },
                { n: "02", title: "BOOK A DELIVERY", desc: "Enter pickup and drop-off, set the package details, and confirm. The price is clear before you commit." },
                { n: "03", title: "WE COLLECT", desc: "Your assigned rider heads to the pickup location. You get a live notification the moment they're on the way." },
                { n: "04", title: "TRACK & RECEIVE", desc: "Follow the delivery in real-time on a map. Get a confirmation when it's handed over." },
              ].map((s, i) => (
                <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group">
                  <div className="flex items-start gap-6">
                    <span className="text-6xl font-bold text-border group-hover:text-primary/20 transition-colors leading-none shrink-0">{s.n}</span>
                    <div className="pt-3">
                      <h3 className="text-2xl font-bold text-fg mb-2">{s.title}</h3>
                      <p className="text-muted-fg text-sm leading-relaxed max-w-md">{s.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-[#f5c400] tracking-[0.2em] uppercase mb-4">Get started</p>
            <h2 className="text-6xl font-bold tracking-[-0.03em] text-white mb-6">READY TO<br />SHIP?</h2>
            <p className="text-white/40 text-sm mb-10 max-w-sm mx-auto">Create an account in under a minute and make your first booking today.</p>
            <button onClick={() => navigate("/customer/auth")}
              className="px-8 py-3.5 rounded-full bg-[#f5c400] text-[#0f172a] font-semibold text-sm hover:bg-[#e0b000] transition-all inline-flex items-center gap-2">
              Create free account <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 bg-bg border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center"><Truck className="w-3.5 h-3.5 text-white" /></div>
                <span className="font-semibold text-[15px] text-fg tracking-tight">RAPID MILES</span>
              </div>
              <p className="text-sm text-muted-fg leading-relaxed">We deliver peace of mind, one mile at a time.</p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <p className="text-[11px] font-semibold text-muted-fg tracking-[0.15em] uppercase mb-4">Services</p>
                {["Pickup", "Express", "Last Mile", "Business"].map(s => (
                  <a key={s} href="#" className="block text-sm text-fg/70 hover:text-fg mb-2 transition-colors">{s}</a>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-fg tracking-[0.15em] uppercase mb-4">Contact</p>
                <p className="text-sm text-fg/70 mb-1">+234 906 653 6931</p>
                <p className="text-sm text-fg/70 mb-1">rapidmileslogistics@gmail.com</p>
                <p className="text-sm text-fg/60 text-xs leading-relaxed">27 Bolorunduro Community,<br />Tanke Akata, Ilorin</p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start justify-between gap-2">
            <p className="text-xs text-muted-fg/60">© 2024 Rapid Miles Logistics.</p>
            <p className="text-xs text-primary font-medium">Swift · Safe · Reliable</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
