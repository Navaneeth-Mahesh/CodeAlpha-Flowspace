import { api } from "@/services/api";
import type { AppNotification } from "@/types/notification";

export const notificationService = {
  list: () =>
    api
      .get<{ notifications: AppNotification[]; unreadCount: number }>("/notifications")
      .then((r) => r.data),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.patch("/notifications/read-all"),
};
