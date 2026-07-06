import { cn } from "@/utils/cn";

/**
 * Brand mark — a custom geometric "F" monogram on a rounded gradient badge.
 * Built from primitive shapes (not a stock icon) so it reads as a distinct
 * wordmark rather than a generic dashboard glyph.
 */
export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="fs-badge" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="#3D63C9" />
          </linearGradient>
        </defs>
        <rect width="30" height="30" rx="9" fill="url(#fs-badge)" />
        {/* Monogram F: spine + two arms, top arm extends into a flow dot */}
        <rect x="9" y="7" width="3.2" height="16" rx="1.2" fill="white" />
        <rect x="9" y="7" width="12" height="3.2" rx="1.2" fill="white" />
        <rect x="9" y="13.4" width="9" height="3.2" rx="1.2" fill="white" />
        <circle cx="22.5" cy="8.6" r="2.1" fill="var(--color-accent)" />
      </svg>
      {withWordmark && (
        <span className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-text)]">
          Flowspace
        </span>
      )}
    </span>
  );
}
