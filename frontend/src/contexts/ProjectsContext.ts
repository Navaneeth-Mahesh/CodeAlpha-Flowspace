import { createContext } from "react";
import type { Project } from "@/types/project";

export interface ProjectsContextValue {
  projects: Project[];
  archivedProjects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (data: { name: string; description?: string; color?: string; icon?: string; visibility?: string }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
}

export const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined);
