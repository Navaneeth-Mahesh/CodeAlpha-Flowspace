import { useState } from "react";
import { UserPlus, Clock, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import { projectService } from "@/services/project.service";
import { useAuth } from "@/hooks/useAuth";
import type { Project, ProjectRole } from "@/types/project";

const ROLES: ProjectRole[] = ["admin", "manager", "member", "guest"];

export function MembersTab({ project, onChange }: { project: Project; onChange: (project: Project) => void }) {
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  const myMembership =
    project.owner.id === user?.id
      ? { role: "owner" as ProjectRole }
      : project.members.find((m) => m.user.id === user?.id);
  const canManage = myMembership && ["owner", "admin", "manager"].includes(myMembership.role);

  const handleRoleChange = async (userId: string, role: ProjectRole) => {
    const updated = await projectService.updateMemberRole(project._id, userId, role);
    onChange(updated);
  };

  const handleRemove = async (userId: string) => {
    const updated = await projectService.removeMember(project._id, userId);
    onChange(updated);
  };

  const handleCancelInvite = async (email: string) => {
    const updated = await projectService.cancelInvite(project._id, email);
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Only people invited here can see this project. Nobody else in Flowspace can find or open it.
        </p>
        {canManage && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        )}
      </div>

      <div className="mt-5 flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar name={project.owner.name} initials={project.owner.avatarInitials} color={project.owner.avatarColor} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-text)]">{project.owner.name}</p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">{project.owner.email}</p>
          </div>
          <Badge tone="primary">Owner</Badge>
        </div>

        {project.members.map((m) => (
          <div key={m.user.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={m.user.name} initials={m.user.avatarInitials} color={m.user.avatarColor} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">{m.user.name}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{m.user.email}</p>
            </div>
            {canManage ? (
              <select
                value={m.role}
                onChange={(e) => handleRoleChange(m.user.id, e.target.value as ProjectRole)}
                className="surface-neu-inset rounded-[var(--radius-sm)] px-2 py-1 text-xs capitalize text-[var(--color-text)] outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <Badge tone="neutral">{m.role}</Badge>
            )}
            {canManage && (
              <button onClick={() => handleRemove(m.user.id)} aria-label={`Remove ${m.user.name}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {project.pendingInvites.map((invite) => (
          <div key={invite.email} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-soft)]">
              <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[var(--color-text)]">{invite.email}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Invited · not yet on Flowspace</p>
            </div>
            <Badge tone="warning">Pending</Badge>
            {canManage && (
              <button onClick={() => handleCancelInvite(invite.email)} aria-label={`Cancel invite for ${invite.email}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {project.members.length === 0 && project.pendingInvites.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
            It's just you here. Invite someone to start collaborating.
          </p>
        )}
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} project={project} onInvited={onChange} />
    </div>
  );
}
