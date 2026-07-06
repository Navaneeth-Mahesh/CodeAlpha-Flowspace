import type { User } from "@/types/user";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface ChecklistItem {
  _id: string;
  text: string;
  done: boolean;
}

export interface TaskActivity {
  type: string;
  user: string;
  meta?: Record<string, unknown>;
  at: string;
}

export interface Task {
  _id: string;
  project: string | { _id: string; name: string; color: string; icon: string };
  title: string;
  description: string;
  status: string;
  priority: Priority;
  labels: string[];
  dueDate?: string;
  assignees: User[];
  watchers: string[];
  checklist: ChecklistItem[];
  estimatedHours?: number;
  actualHours?: number;
  order: number;
  createdBy: User;
  archived: boolean;
  activity: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  project: string;
  author: User;
  content: string;
  mentions: string[];
  reactions: { emoji: string; users: string[] }[];
  edited: boolean;
  createdAt: string;
}
