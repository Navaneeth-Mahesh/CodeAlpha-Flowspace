import type { User } from "@/types/user";

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "comment_added"
  | "mention"
  | "deadline_reminder"
  | "project_invite";

export interface AppNotification {
  _id: string;
  recipient: string;
  actor?: User;
  type: NotificationType;
  message: string;
  project?: { _id: string; name: string; color: string; icon: string };
  task?: string;
  read: boolean;
  createdAt: string;
}
