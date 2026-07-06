import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Clock, Users } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const TEAM_SIZES = [
  { value: "solo", label: "Just me" },
  { value: "small", label: "2–10 people" },
  { value: "medium", label: "11–50 people" },
  { value: "large", label: "50+ people" },
];

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const finish = async (skip = false) => {
    setSubmitting(true);
    try {
      const updated = await authService.updateProfile({
        jobTitle: skip ? "" : role,
        teamSize: skip ? "" : teamSize ?? "",
        onboarded: true,
      });
      updateUser(updated);
      navigate(ROUTES.dashboard, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <AuthLayout title="A little about you" subtitle="This helps us tailor your first workspace.">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} initials={user.avatarInitials} color={user.avatarColor} size="lg" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
          </div>
        </div>

        <Input
          label="Your role"
          placeholder="e.g. Product Designer, Engineering Manager"
          icon={<Briefcase className="h-4 w-4" />}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Team size</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TEAM_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setTeamSize(size.value)}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm transition-colors",
                  teamSize === size.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
                )}
              >
                <Users className="h-4 w-4" />
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => finish(false)} isLoading={submitting} fullWidth className="mt-2">
          Enter Flowspace
        </Button>

        <button
          type="button"
          onClick={() => finish(true)}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        >
          <Clock className="h-3.5 w-3.5" />
          Skip for now
        </button>
      </div>
    </AuthLayout>
  );
}
