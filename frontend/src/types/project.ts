import type { User } from "@/types/user";

export type ProjectRole = "owner" | "admin" | "manager" | "member" | "guest";

export interface ProjectMember {
  user: User;
  role: ProjectRole;
  joinedAt: string;
}

export interface PendingInvite {
  email: string;
  role: ProjectRole;
  invitedBy: string;
  invitedAt: string;
}

export interface ProjectColumn {
  id: string;
  name: string;
  order: number;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  visibility: "private" | "team" | "public";
  owner: User;
  members: ProjectMember[];
  pendingInvites: PendingInvite[];
  favoritedBy: string[];
  isFavorite: boolean;
  columns: ProjectColumn[];
  archived: boolean;
  archivedAt?: string;
  taskCount?: number;
  doneCount?: number;
  createdAt: string;
  updatedAt: string;
}
