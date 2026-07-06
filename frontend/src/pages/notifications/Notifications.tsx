import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/hooks/useNotifications";
import { NOTIFICATION_META } from "@/constants/notifications";
import { timeAgo } from "@/utils/date";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
            <Bell className="h-6 w-6 text-[var(--color-primary)]" />
          </span>
          <p className="text-sm text-[var(--color-text-secondary)]">You're all caught up.</p>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          {notifications.map((n) => {
            const meta = NOTIFICATION_META[n.type];
            return (
              <button
                key={n._id}
                onClick={() => {
                  markRead(n._id);
                  if (n.project) navigate(ROUTES.project(n.project._id));
                }}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 text-left hover:bg-[var(--color-surface-hover)]",
                  !n.read && "bg-[var(--color-primary-soft)]/30"
                )}
              >
                <span className="mt-0.5 text-lg leading-none">{meta.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-[var(--color-text)]">{n.message}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {meta.label} · {timeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
