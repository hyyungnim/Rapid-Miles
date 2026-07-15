import { Calendar, ArrowUpRight } from "lucide-react";
import { useDeliveries } from "../../hooks/useDeliveries";

function formatCurrency(n: number) {
  return "₦" + n.toLocaleString();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DeliveryHistory() {
  const { deliveries, loading } = useDeliveries();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 rounded-full border border-muted-fg border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-lg">
      {deliveries.length === 0 && (
        <p className="text-sm text-muted-fg text-center py-12">No delivery history</p>
      )}
      {deliveries.map(d => (
        <div key={d.id}
          className="rounded-xl bg-muted p-4 flex items-center justify-between group hover:bg-card transition-colors cursor-default">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-lg font-bold text-fg/20 group-hover:text-[#d4a545]/30 transition-colors">{d.tracking_number?.slice(-2)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-fg">{d.tracking_number || d.id}</span>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                  d.status === "delivered" ? "bg-[#22a06b]/10 text-[#22a06b]" :
                  d.status === "cancelled" ? "bg-error-light text-error" :
                  "bg-primary-light text-primary"
                }`}>{d.status.replace("_", " ")}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-fg">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(d.created_at)}</span>
                <span>{d.pickup_address} → {d.delivery_address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-fg">{formatCurrency(d.delivery_fee)}</span>
            <ArrowUpRight className="w-4 h-4 text-muted-fg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
}
