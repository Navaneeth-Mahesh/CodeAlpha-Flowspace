import { Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <h2 className="text-sm font-semibold text-[var(--color-text)]">Theme</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Choose how Flowspace looks on this device.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["dark", "light"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-[var(--radius-md)] border p-4 transition-colors",
              theme === t ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-border)] hover:bg-[var(--color-surface-soft)]"
            )}
          >
            {t === "dark" ? <Moon className="h-5 w-5 text-[var(--color-text)]" /> : <Sun className="h-5 w-5 text-[var(--color-text)]" />}
            <span className="text-sm font-medium capitalize text-[var(--color-text)]">{t}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
