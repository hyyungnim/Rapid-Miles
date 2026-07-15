export const RATE_PER_KM = 200;
export const RATE_PER_KG = 100;

export const calcDeliveryFee = (distanceKm: number, weightKg: number) =>
  RATE_PER_KM * distanceKm + RATE_PER_KG * weightKg;

export const fmtCurrency = (n: number) =>
  `₦${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const genTrackingNumber = () => {
  const prefix = "RML";
  const year = new Date().getFullYear();
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${year}-${rand}`;
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rider_assigned: "Rider Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-500",
  accepted: "text-blue-500",
  rider_assigned: "text-indigo-500",
  picked_up: "text-purple-500",
  in_transit: "text-cyan-500",
  delivered: "text-emerald-500",
  cancelled: "text-red-500",
};

export const BOOKING_STATUS_BG: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-blue-50 text-blue-700",
  rider_assigned: "bg-indigo-50 text-indigo-700",
  picked_up: "bg-purple-50 text-purple-700",
  in_transit: "bg-cyan-50 text-cyan-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export const STATUS_STEPS = [
  "pending",
  "accepted",
  "rider_assigned",
  "picked_up",
  "in_transit",
  "delivered",
] as const;

export const PACKAGE_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food",
  "Documents",
  "Fragile Items",
  "Books",
  "Medicine",
  "Other",
];
