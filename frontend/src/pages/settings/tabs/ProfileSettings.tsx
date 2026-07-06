import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [timezone, setTimezone] = useState(user?.timezone ?? "UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await authService.updateProfile({ name, bio, jobTitle, timezone });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} initials={user.avatarInitials} color={user.avatarColor} size="lg" />
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
        </div>
      </div>

      <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Job title" placeholder="e.g. Product Designer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text)]">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="A short line about what you work on"
          className="surface-neu-inset w-full resize-none px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <span className="text-right text-xs text-[var(--color-text-muted)]">{bio.length}/280</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--color-text)]">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="surface-neu-inset h-11 rounded-[var(--radius-md)] px-3 text-sm text-[var(--color-text)] outline-none"
        >
          {((Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? ["UTC"]).map((tz: string) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} isLoading={saving}>
          Save changes
        </Button>
        {saved && <span className="text-sm text-[var(--color-success)]">Saved</span>}
      </div>
    </Card>
  );
}
