import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
        <span className="relative inline-flex h-[18px] w-[18px] shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={cn("peer sr-only", className)}
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 rounded-[5px] border border-[var(--color-border)] bg-[var(--color-surface)]",
              "transition-colors peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)]",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-primary)]"
            )}
          />
          <Check
            aria-hidden="true"
            className="absolute inset-0 m-auto h-3 w-3 text-white opacity-0 scale-75 transition-all peer-checked:opacity-100 peer-checked:scale-100"
            strokeWidth={3}
          />
        </span>
        {label && <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
