import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "primary" | "success" | "danger" | "warning" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneStyles: Record<Tone, string> = {
  neutral: "bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)]",
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
