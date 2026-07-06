import type { NotificationType } from "@/types/notification";

export const NOTIFICATION_META: Record<NotificationType, { emoji: string; label: string }> = {
  task_assigned: { emoji: "🎯", label: "Task assigned" },
  task_updated: { emoji: "🔄", label: "Task updated" },
  task_completed: { emoji: "✅", label: "Task completed" },
  comment_added: { emoji: "💬", label: "New comment" },
  mention: { emoji: "📣", label: "Mention" },
  deadline_reminder: { emoji: "⏰", label: "Deadline reminder" },
  project_invite: { emoji: "👋", label: "Project invite" },
};
