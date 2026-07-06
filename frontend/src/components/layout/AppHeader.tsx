import { useEffect, useState } from "react";
import { Search, Command } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { CommandPalette } from "@/components/layout/CommandPalette";

export function AppHeader({ title }: { title?: string }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-6">
        {title ? (
          <h1 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-text)]">{title}</h1>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaletteOpen(true)}
            className="surface-neu-inset flex h-9 w-64 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm text-[var(--color-text-muted)]"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search…</span>
            <span className="flex items-center gap-0.5 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px]">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </button>
          <ThemeToggle />
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
