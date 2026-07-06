import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Change password</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Use a password you're not using anywhere else.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-success-soft)] px-3.5 py-2.5 text-sm text-[var(--color-success)]">
          Password updated.
        </div>
      )}

      <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Input label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

      <Button onClick={handleSubmit} isLoading={saving} className="self-start">
        Update password
      </Button>
    </Card>
  );
}
