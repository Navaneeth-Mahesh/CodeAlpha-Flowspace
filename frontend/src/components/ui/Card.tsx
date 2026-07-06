import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "neu" | "glass" | "flat";
  glow?: boolean;
  children: ReactNode;
}

export function Card({ className, variant = "neu", glow = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "p-6",
        variant === "neu" && "surface-neu",
        variant === "glass" && "surface-glass rounded-[var(--radius-lg)]",
        variant === "flat" && "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]",
        glow && "ring-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
