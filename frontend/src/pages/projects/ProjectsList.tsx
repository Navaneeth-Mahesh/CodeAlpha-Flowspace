import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Star, Archive, MoreHorizontal, Copy, ArchiveRestore, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { useProjects } from "@/hooks/useProjects";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { Project } from "@/types/project";

type SortKey = "recent" | "name" | "progress";

export default function ProjectsList() {
  const { projects, archivedProjects, toggleFavorite, duplicateProject, setArchived, removeProject } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [showArchived, setShowArchived] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const list = showArchived ? archivedProjects : projects;

  const filtered = useMemo(() => {
    let result = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "progress")
      result = [...result].sort(
        (a, b) => (b.doneCount ?? 0) / (b.taskCount || 1) - (a.doneCount ?? 0) / (a.taskCount || 1)
      );
    return result;
  }, [list, search, sort]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">Projects</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <Input placeholder="Search projects…" icon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="surface-neu-inset h-11 rounded-[var(--radius-md)] px-3 text-sm text-[var(--color-text)] outline-none"
        >
          <option value="recent">Recently updated</option>
          <option value="name">Name (A–Z)</option>
          <option value="progress">Progress</option>
        </select>
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
            showArchived ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
          )}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Viewing archived" : "Show archived"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {showArchived ? "No archived projects." : search ? "No projects match your search." : "No projects yet — create your first one."}
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              menuOpen={menuOpenId === p._id}
              onToggleMenu={() => setMenuOpenId(menuOpenId === p._id ? null : p._id)}
              onOpen={() => navigate(ROUTES.project(p._id))}
              onFavorite={() => toggleFavorite(p._id)}
              onDuplicate={() => duplicateProject(p._id)}
              onArchiveToggle={() => setArchived(p._id, !showArchived)}
              onDelete={() => {
                if (confirm(`Permanently delete "${p.name}"? This can't be undone.`)) removeProject(p._id);
              }}
            />
          ))}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function ProjectCard({
  project,
  menuOpen,
  onToggleMenu,
  onOpen,
  onFavorite,
  onDuplicate,
  onArchiveToggle,
  onDelete,
}: {
  project: Project;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpen: () => void;
  onFavorite: () => void;
  onDuplicate: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}) {
  const progress = project.taskCount ? Math.round(((project.doneCount ?? 0) / project.taskCount) * 100) : 0;

  return (
    <Card className="relative flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <button onClick={onOpen} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-lg" style={{ backgroundColor: `${project.color}22` }}>
            {project.icon}
          </span>
          <div>
            <p className="font-medium text-[var(--color-text)]">{project.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] capitalize">{project.visibility}</p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onFavorite} aria-label="Toggle favorite">
            <Star className={cn("h-4 w-4", project.isFavorite ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-text-muted)]")} />
          </button>
          <div className="relative">
            <button onClick={onToggleMenu} aria-label="Project options" className="rounded-full p-1 hover:bg-[var(--color-surface-hover)]">
              <MoreHorizontal className="h-4 w-4 text-[var(--color-text-muted)]" />
            </button>
            {menuOpen && (
              <div className="surface-glass absolute right-0 z-20 mt-1 w-40 rounded-[var(--radius-md)] p-1 shadow-xl">
                <button onClick={onDuplicate} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <button onClick={onArchiveToggle} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                  <ArchiveRestore className="h-3.5 w-3.5" /> {project.archived ? "Restore" : "Archive"}
                </button>
                <button onClick={onDelete} className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {project.description && <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{project.description}</p>}

      <div>
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>{project.doneCount ?? 0}/{project.taskCount ?? 0} tasks</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
        </div>
      </div>
    </Card>
  );
}
