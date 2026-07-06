import { useCallback, useEffect, useState } from "react";
import { taskService } from "@/services/task.service";
import { getSocket } from "@/services/socket";
import type { Task } from "@/types/task";

export function useProjectTasks(projectId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    taskService
      .listForProject(projectId)
      .then(setTasks)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("project:join", projectId);

    const handleCreated = (task: Task) => setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [...prev, task]));
    const handleUpdated = (task: Task) => setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    const handleDeleted = ({ id }: { id: string }) => setTasks((prev) => prev.filter((t) => t._id !== id));

    socket.on("task:created", handleCreated);
    socket.on("task:updated", handleUpdated);
    socket.on("task:deleted", handleDeleted);

    return () => {
      socket.emit("project:leave", projectId);
      socket.off("task:created", handleCreated);
      socket.off("task:updated", handleUpdated);
      socket.off("task:deleted", handleDeleted);
    };
  }, [projectId]);

  const createTask = useCallback(
    async (data: Partial<Task>) => {
      if (!projectId) return;
      const task = await taskService.create(projectId, data);
      setTasks((prev) => [...prev, task]);
      return task;
    },
    [projectId]
  );

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const updated = await taskService.update(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  }, []);

  // Optimistic, local-only status/order change (used while dragging) — persisted separately via updateTask.
  const moveTaskLocal = useCallback((id: string, status: string, order: number) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status, order } : t)));
  }, []);

  const removeTask = useCallback(async (id: string) => {
    await taskService.remove(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  return { tasks, loading, error, refresh, createTask, updateTask, moveTaskLocal, removeTask, setTasks };
}
