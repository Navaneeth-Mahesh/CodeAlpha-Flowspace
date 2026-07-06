import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name, initials, color, size = "md", online, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        role="img"
        aria-label={name}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold text-white",
          sizeMap[size]
        )}
        style={{ backgroundColor: color }}
      >
        {initials}
      </span>
      {online !== undefined && (
        <span
          aria-label={online ? "Online" : "Offline"}
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface)]",
            online ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
          )}
        />
      )}
    </span>
  );
}
