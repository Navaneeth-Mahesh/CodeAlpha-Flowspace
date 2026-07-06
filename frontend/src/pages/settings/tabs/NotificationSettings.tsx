import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import type { NotificationPrefs } from "@/types/user";

const OPTIONS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: "taskAssigned", label: "Task assigned", hint: "When someone assigns you a task" },
  { key: "comments", label: "Comments", hint: "When someone comments on a task you're on" },
  { key: "mentions", label: "Mentions", hint: "When someone @mentions you" },
  { key: "deadlines", label: "Deadline reminders", hint: "Heads up before a task is due" },
];

export function NotificationSettings() {
  const { user, updateUser } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | undefined>(user?.notificationPrefs);

  if (!prefs) return null;

  const toggle = async (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    const updated = await authService.updateProfile({ notificationPrefs: next });
    updateUser(updated);
  };

  return (
    <Card>
      <h2 className="text-sm font-semibold text-[var(--color-text)]">Notification preferences</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Choose what shows up in your notification center.</p>

      <div className="mt-4 flex flex-col gap-4">
        {OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text)]">{opt.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{opt.hint}</p>
            </div>
            <Checkbox checked={prefs[opt.key]} onChange={() => toggle(opt.key)} />
          </div>
        ))}
      </div>
    </Card>
  );
}
