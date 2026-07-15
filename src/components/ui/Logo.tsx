import { motion } from "motion/react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const sizes = {
  sm: { icon: 20, text: "text-sm", tagline: "text-[9px]" },
  md: { icon: 28, text: "text-base", tagline: "text-[10px]" },
  lg: { icon: 36, text: "text-xl", tagline: "text-[11px]" },
};

export function Logo({ size = "md", showTagline = false }: LogoProps) {
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative shrink-0"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg viewBox="0 0 40 40" fill="none" width={s.icon} height={s.icon}>
          <rect width="40" height="40" rx="10" fill="#2563eb" />
          <motion.g
            initial={{ x: -4, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <path d="M10 28L14 12L22 20L30 10V28H10Z" fill="white" opacity="0.95" />
            <path d="M14 12L10 28H12.5L16 14L14 12Z" fill="#f5c400" />
            <circle cx="30" cy="10" r="2" fill="#f5c400" />
          </motion.g>
        </svg>
      </motion.div>
      <div className="flex flex-col">
        <span className={`${s.text} font-bold tracking-tight text-fg leading-none`}>RAPID MILES</span>
        {showTagline && (
          <span className={`${s.tagline} font-medium text-primary tracking-wider leading-none mt-0.5`}>LOGISTICS</span>
        )}
      </div>
    </div>
  );
}
