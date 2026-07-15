import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Clock, Shield,Smartphone, Package } from "lucide-react";
import { useNavigate } from "react-router";
import { Logo } from "../components/ui/Logo";

const BASE = 500, RATE = 200;
const calcFare = (km: number) => BASE + km * RATE;

export function LandingPage() {
  const [km, setKm] = useState(10);
  const navigate = useNavigate();
  const fare = calcFare(km);

  return (
    <div className="bg-bg min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/customer/auth")}
              className="text-xs font-medium text-muted-fg hover:text-fg transition-colors px-3 py-1.5">
              Sign in
            </button>
            <button onClick={() => navigate("/customer/auth")}
              className="text-xs font-medium text-primary-fg bg-primary hover:bg-primary/90 transition-colors px-4 py-1.5 rounded-full">
              Get started
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24 bg-gradient-to-b from-primary-light/50 to-bg">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Ilorin — Kwara State
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-fg leading-[1.05] mb-5">
              Logistics that<br />
              <span className="text-primary">keeps you moving.</span>
            </h1>
            <p className="text-base text-muted-fg max-w-xl leading-relaxed mb-8">
              Book a delivery in seconds. Track every mile in real time.
              Same-day pickup and drop-off across Ilorin — priced by the kilometre, no surprises.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/customer/auth")}
                className="px-6 py-3 rounded-full bg-primary text-primary-fg font-medium text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
                Start shipping <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/customer/auth")}
                className="px-6 py-3 rounded-full border border-border text-fg text-sm font-medium hover:bg-muted transition-colors">
                Track a package
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-card border border-border">
            {[
              { icon: MapPin, label: "Service area", val: "Ilorin metro" },
              { icon: Clock, label: "Avg. pickup", val: "30 min" },
              { icon: Package, label: "Deliveries", val: "1,000+" },
              { icon: Shield, label: "Satisfaction", val: "98%" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-fg">{s.val}</p>
                <p className="text-xs text-muted-fg">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-wider uppercase mb-3">Services</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-fg">Everything we handle</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Pickup", desc: "We collect from your door. Schedule a time and we handle the rest.", metric: "30 min avg." },
              { icon: Package, title: "Express", desc: "Same-day delivery within Ilorin. Tracked and time-stamped from start to finish.", metric: "99% on-time" },
              { icon: MapPin, title: "Last Mile", desc: "Precision delivery to the exact drop-off point. Every address, every time.", metric: "100 m accuracy" },
              { icon: Smartphone, title: "Business", desc: "Bulk logistics with custom rates, dedicated support, and monthly billing.", metric: "50+ partners" },
            ].map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary tracking-wider mb-2 block">{s.metric}</span>
                <h3 className="text-lg font-bold text-fg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2">
              <p className="text-xs font-semibold text-primary tracking-wider uppercase mb-3">Pricing</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-fg mb-4">Know the cost, before you ship.</h2>
              <p className="text-sm text-muted-fg leading-relaxed">Transparent per-kilometre pricing. No hidden fees, no surprise charges.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-fg">Distance</span>
                    <span className="text-xl font-bold text-fg">{km} <span className="text-sm font-normal text-muted-fg">km</span></span>
                  </div>
                  <input type="range" min={1} max={100} value={km} onChange={e => setKm(+e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                    style={{ background: `linear-gradient(to right, var(--primary) ${km}%, var(--border) ${km}%)` }} />
                  <div className="flex justify-between text-xs text-muted-fg mt-1"><span>1 km</span><span>100 km</span></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Base fare", val: `₦${BASE.toLocaleString()}` },
                    { label: "Per km", val: `₦${RATE.toLocaleString()}` },
                    { label: "Distance", val: `₦${(km * RATE).toLocaleString()}` },
                    { label: "Weight", val: "Up to 5 kg" },
                  ].map(r => (
                    <div key={r.label} className="text-center p-3 rounded-xl bg-muted">
                      <p className="text-xs text-muted-fg mb-1">{r.label}</p>
                      <p className="text-sm font-bold text-fg">{r.val}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary-light">
                  <div>
                    <p className="text-xs text-muted-fg mb-0.5">Estimated total</p>
                    <p className="text-2xl font-bold text-primary">₦{fare.toLocaleString()}</p>
                  </div>
                  <button onClick={() => navigate("/customer/auth")}
                    className="px-5 py-2.5 rounded-full bg-primary text-primary-fg font-medium text-sm hover:bg-primary/90 transition-all flex items-center gap-2">
                    Book now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-semibold text-primary tracking-wider uppercase mb-3">Process</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-fg mb-4">Four steps, one delivery.</h2>
              <p className="text-sm text-muted-fg leading-relaxed">From booking to drop-off in the simplest workflow possible.</p>
            </motion.div>
            <div className="space-y-8">
              {[
                { n: "01", title: "Create account", desc: "Sign up in under 60 seconds. No paperwork, no delays." },
                { n: "02", title: "Book a delivery", desc: "Enter pickup and drop-off, set the package details, and confirm. The price is clear before you commit." },
                { n: "03", title: "We collect", desc: "Your assigned rider heads to the pickup location. You get a live notification the moment they are on the way." },
                { n: "04", title: "Track & receive", desc: "Follow the delivery in real-time on a map. Get a confirmation when it is handed over." },
              ].map((s, i) => (
                <motion.div key={s.n} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 group">
                  <span className="text-3xl font-bold text-border group-hover:text-primary/30 transition-colors leading-none shrink-0 w-10">{s.n}</span>
                  <div className="pt-1">
                    <h3 className="text-lg font-bold text-fg mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-fg leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-primary-fg/60 tracking-wider uppercase mb-4">Get started</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-fg mb-4">Ready to ship?</h2>
            <p className="text-sm text-primary-fg/70 mb-8 max-w-sm mx-auto">Create an account in under a minute and make your first booking today.</p>
            <button onClick={() => navigate("/customer/auth")}
              className="px-8 py-3 rounded-full bg-accent text-accent-fg font-semibold text-sm hover:bg-accent/90 transition-all inline-flex items-center gap-2 shadow-sm">
              Create free account <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <Logo size="sm" />
              </div>
              <p className="text-xs text-muted-fg leading-relaxed">We deliver peace of mind, one mile at a time.</p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <p className="text-[11px] font-semibold text-muted-fg tracking-wider uppercase mb-4">Services</p>
                {["Pickup", "Express", "Last Mile", "Business"].map(s => (
                  <p key={s} className="text-xs text-fg/70 hover:text-fg mb-2 transition-colors cursor-default">{s}</p>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-fg tracking-wider uppercase mb-4">Contact</p>
                <p className="text-xs text-fg/70 mb-1">+234 906 653 6931</p>
                <p className="text-xs text-fg/70 mb-1">rapidmileslogistics@gmail.com</p>
                <p className="text-xs text-fg/50 leading-relaxed">27 Bolorunduro Community,<br />Tanke Akata, Ilorin</p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start justify-between gap-2">
            <p className="text-[11px] text-muted-fg/60">&copy; 2024 Rapid Miles Logistics.</p>
            <p className="text-[11px] text-primary font-medium">Swift &middot; Safe &middot; Reliable</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
