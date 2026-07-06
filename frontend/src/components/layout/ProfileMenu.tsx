import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="Account menu" aria-expanded={open}>
        <Avatar name={user.name} initials={user.avatarInitials} color={user.avatarColor} online />
      </button>

      {open && (
        <div className="surface-glass absolute right-0 z-50 mt-2 w-56 rounded-[var(--radius-lg)] p-1.5 shadow-xl">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Avatar name={user.name} initials={user.avatarInitials} color={user.avatarColor} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <button
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.settings);
            }}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.settings);
            }}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
