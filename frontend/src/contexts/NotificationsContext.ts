import { createContext } from "react";
import type { AppNotification } from "@/types/notification";

export interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
}

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
