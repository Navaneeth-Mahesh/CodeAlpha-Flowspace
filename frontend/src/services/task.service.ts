import { api } from "@/services/api";
import type { Task, Comment } from "@/types/task";

export const taskService = {
  listForProject: (projectId: string, filters?: Record<string, string>) =>
    api
      .get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`, { params: filters })
      .then((r) => r.data.tasks),

  mine: () => api.get<{ tasks: Task[] }>("/tasks/mine").then((r) => r.data.tasks),

  search: (q: string) => api.get<{ tasks: Task[] }>("/tasks/search", { params: { q } }).then((r) => r.data.tasks),

  get: (id: string) => api.get<{ task: Task }>(`/tasks/${id}`).then((r) => r.data.task),

  create: (projectId: string, data: Partial<Task>) =>
    api.post<{ task: Task }>(`/projects/${projectId}/tasks`, data).then((r) => r.data.task),

  update: (id: string, data: Partial<Task>) =>
    api.patch<{ task: Task }>(`/tasks/${id}`, data).then((r) => r.data.task),

  remove: (id: string) => api.delete(`/tasks/${id}`),

  setArchived: (id: string, archived: boolean) =>
    api.patch<{ task: Task }>(`/tasks/${id}/archive`, { archived }).then((r) => r.data.task),

  duplicate: (id: string) => api.post<{ task: Task }>(`/tasks/${id}/duplicate`).then((r) => r.data.task),

  addChecklistItem: (id: string, text: string) =>
    api.post<{ task: Task }>(`/tasks/${id}/checklist`, { text }).then((r) => r.data.task),

  updateChecklistItem: (id: string, itemId: string, data: { text?: string; done?: boolean }) =>
    api.patch<{ task: Task }>(`/tasks/${id}/checklist/${itemId}`, data).then((r) => r.data.task),

  deleteChecklistItem: (id: string, itemId: string) =>
    api.delete<{ task: Task }>(`/tasks/${id}/checklist/${itemId}`).then((r) => r.data.task),

  getComments: (taskId: string) =>
    api.get<{ comments: Comment[] }>(`/tasks/${taskId}/comments`).then((r) => r.data.comments),

  addComment: (taskId: string, content: string, mentions: string[] = []) =>
    api.post<{ comment: Comment }>(`/tasks/${taskId}/comments`, { content, mentions }).then((r) => r.data.comment),

  updateComment: (id: string, content: string) =>
    api.patch<{ comment: Comment }>(`/comments/${id}`, { content }).then((r) => r.data.comment),

  deleteComment: (id: string) => api.delete(`/comments/${id}`),

  toggleReaction: (id: string, emoji: string) =>
    api.post<{ comment: Comment }>(`/comments/${id}/reactions`, { emoji }).then((r) => r.data.comment),
};
