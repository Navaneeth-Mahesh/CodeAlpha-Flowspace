import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/types/user";

export function AssigneeStack({ users, max = 3 }: { users: User[]; max?: number }) {
  if (!users.length) return null;
  const shown = users.slice(0, max);
  const remaining = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar
          key={u.id}
          name={u.name}
          initials={u.avatarInitials}
          color={u.avatarColor}
          size="sm"
          className="ring-2 ring-[var(--color-surface)]"
        />
      ))}
      {remaining > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-[10px] font-medium text-[var(--color-text-secondary)] ring-2 ring-[var(--color-surface)]">
          +{remaining}
        </span>
      )}
    </div>
  );
}
