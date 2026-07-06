import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NOTIFICATION_META } from "@/constants/notifications";
import { timeAgo } from "@/utils/date";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="surface-neu relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="surface-glass absolute right-0 z-50 mt-2 w-80 rounded-[var(--radius-lg)] p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold text-[var(--color-text)]">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-[var(--color-text-muted)]">
                You're all caught up.
              </p>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const meta = NOTIFICATION_META[n.type];
                return (
                  <button
                    key={n._id}
                    onClick={() => {
                      markRead(n._id);
                      setOpen(false);
                      if (n.project) navigate(ROUTES.project(n.project._id));
                    }}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-2 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-hover)]",
                      !n.read && "bg-[var(--color-primary-soft)]/40"
                    )}
                  >
                    <span className="mt-0.5 text-base leading-none">{meta.emoji}</span>
                    <span className="flex-1">
                      <span className="block text-sm text-[var(--color-text)]">{n.message}</span>
                      <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />}
                  </button>
                );
              })
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.notifications);
            }}
            className="mt-1 w-full rounded-[var(--radius-md)] py-2 text-center text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]"
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}
