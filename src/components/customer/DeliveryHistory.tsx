import { Calendar, ArrowUpRight } from "lucide-react";

const HISTORY = [
  { id: "RM-2399", date: "Dec 10", pickup: "Tanke", dropoff: "University Rd", status: "delivered", amount: "₦3,500" },
  { id: "RM-2398", date: "Dec 09", pickup: "GRA", dropoff: "Kwara Mall", status: "delivered", amount: "₦4,200" },
  { id: "RM-2397", date: "Dec 07", pickup: "Airport Rd", dropoff: "Sango", status: "cancelled", amount: "—" },
];

export function DeliveryHistory() {
  return (
    <div className="space-y-2 max-w-lg">
      {HISTORY.map(d => (
        <div key={d.id}
          className="rounded-xl bg-muted p-4 flex items-center justify-between group hover:bg-card transition-colors cursor-default">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-lg font-bold text-fg/20 group-hover:text-[#d4a545]/30 transition-colors">{d.id.slice(-2)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-fg">{d.id}</span>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                  d.status === "delivered" ? "bg-[#22a06b]/10 text-[#22a06b]" : "bg-error-light text-error"
                }`}>{d.status}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-fg">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d.date}</span>
                <span>{d.pickup} → {d.dropoff}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-fg">{d.amount}</span>
            <ArrowUpRight className="w-4 h-4 text-muted-fg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
}
