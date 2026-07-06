import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ProjectsContext } from "@/contexts/ProjectsContext";
import { projectService } from "@/services/project.service";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@/types/project";

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      const [active, archived] = await Promise.all([
        projectService.list({ archived: false }),
        projectService.list({ archived: true }),
      ]);
      setProjects(active);
      setArchivedProjects(archived);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProject = useCallback(
    async (data: Parameters<typeof projectService.create>[0]) => {
      const project = await projectService.create(data);
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    []
  );

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const updated = await projectService.update(id, data);
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...updated } : p)));
  }, []);

  const removeProject = useCallback(async (id: string) => {
    await projectService.remove(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    setArchivedProjects((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const setArchived = useCallback(async (id: string, archived: boolean) => {
    const updated = await projectService.setArchived(id, archived);
    if (archived) {
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setArchivedProjects((prev) => [updated, ...prev]);
    } else {
      setArchivedProjects((prev) => prev.filter((p) => p._id !== id));
      setProjects((prev) => [updated, ...prev]);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const isFavorite = await projectService.toggleFavorite(id);
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, isFavorite } : p)));
  }, []);

  const duplicateProject = useCallback(async (id: string) => {
    const copy = await projectService.duplicate(id);
    setProjects((prev) => [copy, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      archivedProjects,
      loading,
      error,
      refresh,
      createProject,
      updateProject,
      removeProject,
      setArchived,
      toggleFavorite,
      duplicateProject,
    }),
    [projects, archivedProjects, loading, error, refresh, createProject, updateProject, removeProject, setArchived, toggleFavorite, duplicateProject]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
