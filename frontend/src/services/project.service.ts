import { api } from "@/services/api";
import type { Project } from "@/types/project";

export const projectService = {
  list: (params?: { archived?: boolean; favorite?: boolean }) =>
    api.get<{ projects: Project[] }>("/projects", { params }).then((r) => r.data.projects),

  get: (id: string) => api.get<{ project: Project }>(`/projects/${id}`).then((r) => r.data.project),

  create: (data: { name: string; description?: string; color?: string; icon?: string; visibility?: string }) =>
    api.post<{ project: Project }>("/projects", data).then((r) => r.data.project),

  update: (id: string, data: Partial<Project>) =>
    api.patch<{ project: Project }>(`/projects/${id}`, data).then((r) => r.data.project),

  remove: (id: string) => api.delete(`/projects/${id}`),

  setArchived: (id: string, archived: boolean) =>
    api.patch<{ project: Project }>(`/projects/${id}/archive`, { archived }).then((r) => r.data.project),

  toggleFavorite: (id: string) =>
    api.patch<{ isFavorite: boolean }>(`/projects/${id}/favorite`).then((r) => r.data.isFavorite),

  duplicate: (id: string) =>
    api.post<{ project: Project }>(`/projects/${id}/duplicate`).then((r) => r.data.project),

  invite: (id: string, email: string, role: string) =>
    api
      .post<{ project: Project; status: "added" | "pending" }>(`/projects/${id}/invite`, { email, role })
      .then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    api.delete<{ project: Project }>(`/projects/${id}/members/${userId}`).then((r) => r.data.project),

  updateMemberRole: (id: string, userId: string, role: string) =>
    api.patch<{ project: Project }>(`/projects/${id}/members/${userId}`, { role }).then((r) => r.data.project),

  cancelInvite: (id: string, email: string) =>
    api.delete<{ project: Project }>(`/projects/${id}/invites/${email}`).then((r) => r.data.project),
};
