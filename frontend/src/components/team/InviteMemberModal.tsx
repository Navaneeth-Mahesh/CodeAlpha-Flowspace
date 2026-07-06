import { useState } from "react";
import { Mail } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { projectService } from "@/services/project.service";
import type { Project, ProjectRole } from "@/types/project";

const ROLES: ProjectRole[] = ["admin", "manager", "member", "guest"];

export function InviteMemberModal({
  open,
  onClose,
  project,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  project: Project;
  onInvited: (project: Project) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("member");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"added" | "pending" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setRole("member");
    setError(null);
    setStatus(null);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Enter an email address");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await projectService.invite(project._id, email.trim(), role);
      onInvited(result.project);
      setStatus(result.status);
      setEmail("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={`Invite to ${project.name}`}
      description="They'll only see this project — nothing else in your workspace."
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}
        {status === "added" && (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-success-soft)] px-3.5 py-2.5 text-sm text-[var(--color-success)]">
            They already have a Flowspace account and were added immediately.
          </div>
        )}
        {status === "pending" && (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] px-3.5 py-2.5 text-sm text-[var(--color-warning)]">
            No account yet for that email — they'll be added automatically the moment they sign up.
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="teammate@company.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
            className="surface-neu-inset mt-2 h-11 w-full rounded-[var(--radius-md)] px-3 text-sm capitalize text-[var(--color-text)] outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleSubmit} isLoading={submitting} fullWidth className="mt-2">
          Send invite
        </Button>
      </div>
    </Modal>
  );
}
