import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { NotificationsContext } from "@/contexts/NotificationsContext";
import { notificationService } from "@/services/notification.service";
import { getSocket } from "@/services/socket";
import { useAuth } from "@/hooks/useAuth";
import type { AppNotification } from "@/types/notification";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (status !== "authenticated") return;
    notificationService.list().then(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (notification: AppNotification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("notification:new", handleNew);
    return () => {
      socket.off("notification:new", handleNew);
    };
  }, [status]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    notificationService.markRead(id).catch(() => refresh());
  }, [refresh]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    notificationService.markAllRead().catch(() => refresh());
  }, [refresh]);

  const value = useMemo(
    () => ({ notifications, unreadCount, markRead, markAllRead, refresh }),
    [notifications, unreadCount, markRead, markAllRead, refresh]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
