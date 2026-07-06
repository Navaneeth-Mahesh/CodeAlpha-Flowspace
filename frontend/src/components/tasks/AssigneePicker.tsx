import { useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { userService } from "@/services/user.service";
import { cn } from "@/utils/cn";
import type { User } from "@/types/user";

export function AssigneePicker({
  projectId,
  selected,
  onChange,
}: {
  projectId: string;
  selected: User[];
  onChange: (users: User[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<User[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) userService.searchCollaborators({ projectId }).then(setCandidates);
  }, [open, projectId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (user: User) => {
    const exists = selected.some((u) => u.id === user.id);
    onChange(exists ? selected.filter((u) => u.id !== user.id) : [...selected, user]);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((u) => (
          <button
            key={u.id}
            onClick={() => toggle(u)}
            title={`Remove ${u.name}`}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-soft)] py-1 pl-1 pr-2.5 text-xs text-[var(--color-text)]"
          >
            <Avatar name={u.name} initials={u.avatarInitials} color={u.avatarColor} size="sm" />
            {u.name.split(" ")[0]}
          </button>
        ))}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          aria-label="Add assignee"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="surface-glass absolute left-0 z-30 mt-2 w-56 rounded-[var(--radius-md)] p-1.5 shadow-xl">
          {candidates.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-[var(--color-text-muted)]">
              No collaborators yet — invite teammates from the Members tab.
            </p>
          ) : (
            candidates.map((u) => {
              const isSelected = selected.some((s) => s.id === u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggle(u)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)]",
                    isSelected && "bg-[var(--color-primary-soft)]"
                  )}
                >
                  <Avatar name={u.name} initials={u.avatarInitials} color={u.avatarColor} size="sm" />
                  <span className="text-[var(--color-text)]">{u.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
