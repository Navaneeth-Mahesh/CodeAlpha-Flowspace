import { useState } from "react";
import { User as UserIcon, Palette, Shield, Bell } from "lucide-react";
import { cn } from "@/utils/cn";
import { ProfileSettings } from "@/pages/settings/tabs/ProfileSettings";
import { AppearanceSettings } from "@/pages/settings/tabs/AppearanceSettings";
import { SecuritySettings } from "@/pages/settings/tabs/SecuritySettings";
import { NotificationSettings } from "@/pages/settings/tabs/NotificationSettings";

type Tab = "profile" | "appearance" | "security" | "notifications";

const TABS: { key: Tab; label: string; icon: typeof UserIcon }[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "security", label: "Security", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">Settings</h1>

      <div className="mt-6 grid gap-8 md:grid-cols-[180px_1fr]">
        <nav className="flex flex-row gap-1 md:flex-col" aria-label="Settings sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm font-medium transition-colors",
                tab === t.key ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "profile" && <ProfileSettings />}
          {tab === "appearance" && <AppearanceSettings />}
          {tab === "security" && <SecuritySettings />}
          {tab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}
