interface PaystackPopup {
  open(): void;
}

interface PaystackCallback {
  reference: string;
  transaction?: string;
  status: "success" | "cancelled";
  message?: string;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  ref: string;
  label?: string;
  metadata?: Record<string, any>;
  onSuccess: (ref: string) => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}

const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

export function hasPaystack(): boolean {
  return !!PUBLIC_KEY;
}

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(script);
  });
}

export function openPaystackPopup(cfg: PaystackConfig): PaystackPopup | null {
  if (!PUBLIC_KEY) {
    cfg.onError("Paystack public key not configured");
    return null;
  }
  if (!(window as any).PaystackPop) {
    cfg.onError("Paystack script not loaded");
    return null;
  }

  const handler = (window as any).PaystackPop.setup({
    key: PUBLIC_KEY,
    email: cfg.email,
    amount: cfg.amount,
    ref: cfg.ref,
    label: cfg.label || "Rapid Miles",
    metadata: cfg.metadata || {},
    callback: (response: PaystackCallback) => {
      if (response.status === "success") {
        cfg.onSuccess(response.reference);
      }
    },
    onClose: () => {
      cfg.onCancel();
    },
  });

  handler.openIframe();
  return handler;
}

export function generatePaymentRef(): string {
  return `RMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
